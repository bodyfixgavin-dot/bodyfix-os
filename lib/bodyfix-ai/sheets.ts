import { createSign } from "crypto";
import type { BodyFixAiResult, CrmRecord } from "./types";

export const CRM_HEADERS = [
  "userId",
  "displayName",
  "firstSeenAt",
  "lastUserMessageAt",
  "lastBotMessageAt",
  "lastUserMessage",
  "lastBotReply",
  "lastIntent",
  "bodyIssue",
  "bodyArea",
  "preferredService",
  "bookingStage",
  "leadTemperature",
  "nextAction",
  "needHuman",
  "preferredLocation",
  "preferredTime",
  "followupCount",
  "lastFollowupAt",
  "notes"
] as const;

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
let cachedToken: { token: string; expiresAt: number } | null = null;

export async function ensureSheetHeaders() {
  const rows = await getSheetValues("A1:T1");
  const current = rows[0] || [];
  if (CRM_HEADERS.some((header, index) => current[index] !== header)) {
    await updateSheetValues("A1:T1", [Array.from(CRM_HEADERS)]);
  }
}

export async function getCrmRecord(userId: string) {
  const rows = await getSheetValues("A2:T");
  const rowIndex = rows.findIndex((row) => row[0] === userId);
  if (rowIndex === -1) return null;
  return { record: rowToRecord(rows[rowIndex]), rowNumber: rowIndex + 2 };
}

export async function listCrmRecords() {
  const rows = await getSheetValues("A2:T");
  return rows
    .map((row, index) => ({ record: rowToRecord(row), rowNumber: index + 2 }))
    .filter(({ record }) => Boolean(record.userId));
}

export async function recordIncomingMessage(input: {
  userId: string;
  displayName?: string;
  userMessage: string;
  existing?: { record: CrmRecord; rowNumber: number } | null;
  note?: string;
  now?: Date;
}) {
  const now = input.now || new Date();
  const iso = now.toISOString();
  const existing = input.existing ?? (await getCrmRecord(input.userId));

  if (existing) {
    const record: CrmRecord = {
      ...existing.record,
      displayName: input.displayName || existing.record.displayName,
      lastUserMessageAt: iso,
      lastUserMessage: input.userMessage,
      notes: mergeNotes(existing.record.notes, input.note || "")
    };
    await updateSheetValues(`A${existing.rowNumber}:T${existing.rowNumber}`, [recordToRow(record)]);
    return record;
  }

  const record: CrmRecord = {
    userId: input.userId,
    displayName: input.displayName || "",
    firstSeenAt: iso,
    lastUserMessageAt: iso,
    lastBotMessageAt: "",
    lastUserMessage: input.userMessage,
    lastBotReply: "",
    lastIntent: "unclear",
    bodyIssue: "",
    bodyArea: "",
    preferredService: "unknown",
    bookingStage: "human_takeover",
    leadTemperature: "C",
    nextAction: "human_takeover",
    needHuman: "true",
    preferredLocation: "",
    preferredTime: "",
    followupCount: "0",
    lastFollowupAt: "",
    notes: input.note || "Incoming LINE message saved without automated reply."
  };
  await appendSheetValues("A:T", [recordToRow(record)]);
  return record;
}

export async function upsertCrmRecord(input: {
  userId: string;
  displayName?: string;
  userMessage: string;
  aiResult: BodyFixAiResult;
  existing?: { record: CrmRecord; rowNumber: number } | null;
  now?: Date;
}) {
  const now = input.now || new Date();
  const iso = now.toISOString();
  const existing = input.existing ?? (await getCrmRecord(input.userId));
  const previous = existing?.record;
  const classification = input.aiResult.classification;

  const record: CrmRecord = {
    userId: input.userId,
    displayName: input.displayName || previous?.displayName || "",
    firstSeenAt: previous?.firstSeenAt || iso,
    lastUserMessageAt: iso,
    lastBotMessageAt: iso,
    lastUserMessage: input.userMessage,
    lastBotReply: input.aiResult.replyText,
    lastIntent: classification.intent,
    bodyIssue: classification.bodyIssue || previous?.bodyIssue || "",
    bodyArea: classification.bodyArea || previous?.bodyArea || "",
    preferredService: classification.preferredService,
    bookingStage: classification.bookingStage,
    leadTemperature: classification.leadTemperature,
    nextAction: classification.nextAction,
    needHuman: String(classification.needHuman),
    preferredLocation: classification.preferredLocation || previous?.preferredLocation || "",
    preferredTime: classification.preferredTime || previous?.preferredTime || "",
    followupCount: previous?.followupCount || "0",
    lastFollowupAt: previous?.lastFollowupAt || "",
    notes: mergeNotes(previous?.notes, classification.notes)
  };

  if (existing) {
    await updateSheetValues(`A${existing.rowNumber}:T${existing.rowNumber}`, [recordToRow(record)]);
  } else {
    await appendSheetValues("A:T", [recordToRow(record)]);
  }

  return record;
}

export async function createWelcomeRecord(input: { userId: string; displayName?: string; replyText: string; now?: Date }) {
  const now = input.now || new Date();
  const iso = now.toISOString();
  const existing = await getCrmRecord(input.userId);
  if (existing) {
    const record: CrmRecord = {
      ...existing.record,
      displayName: input.displayName || existing.record.displayName,
      lastBotMessageAt: iso,
      lastBotReply: input.replyText,
      bookingStage: existing.record.bookingStage || "new",
      leadTemperature: existing.record.leadTemperature || "C"
    };
    await updateSheetValues(`A${existing.rowNumber}:T${existing.rowNumber}`, [recordToRow(record)]);
    return record;
  }

  const record: CrmRecord = {
    userId: input.userId,
    displayName: input.displayName || "",
    firstSeenAt: iso,
    lastUserMessageAt: "",
    lastBotMessageAt: iso,
    lastUserMessage: "",
    lastBotReply: input.replyText,
    lastIntent: "follow",
    bodyIssue: "",
    bodyArea: "",
    preferredService: "unknown",
    bookingStage: "new",
    leadTemperature: "C",
    nextAction: "ask_body_issue",
    needHuman: "false",
    preferredLocation: "",
    preferredTime: "",
    followupCount: "0",
    lastFollowupAt: "",
    notes: "LINE follow event welcome sent."
  };
  await appendSheetValues("A:T", [recordToRow(record)]);
  return record;
}

export async function markFollowupSent(record: CrmRecord, rowNumber: number, replyText: string, action: "followup_3_days" | "followup_7_days") {
  const now = new Date().toISOString();
  const nextCount = String((Number(record.followupCount) || 0) + 1);
  const updated: CrmRecord = {
    ...record,
    lastBotMessageAt: now,
    lastBotReply: replyText,
    nextAction: action,
    followupCount: nextCount,
    lastFollowupAt: now,
    bookingStage: record.bookingStage === "booked" ? record.bookingStage : "followup_needed"
  };
  await updateSheetValues(`A${rowNumber}:T${rowNumber}`, [recordToRow(updated)]);
  return updated;
}

function rowToRecord(row: string[]): CrmRecord {
  return CRM_HEADERS.reduce((record, header, index) => {
    record[header] = row[index] || "";
    return record;
  }, {} as CrmRecord);
}

function recordToRow(record: CrmRecord) {
  return CRM_HEADERS.map((header) => record[header] || "");
}

function mergeNotes(previous = "", next = "") {
  if (!next) return previous;
  if (!previous) return next;
  return `${previous}\n${new Date().toISOString()} ${next}`;
}

async function getSheetValues(range: string) {
  const sheetId = getSheetId();
  const token = await getGoogleAccessToken();
  const res = await fetch(`${SHEETS_BASE}/${sheetId}/values/${encodeURIComponent(range)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Google Sheets read failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { values?: string[][] };
  return data.values || [];
}

async function updateSheetValues(range: string, values: string[][]) {
  const sheetId = getSheetId();
  const token = await getGoogleAccessToken();
  const res = await fetch(`${SHEETS_BASE}/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values })
  });
  if (!res.ok) throw new Error(`Google Sheets update failed: ${res.status} ${await res.text()}`);
}

async function appendSheetValues(range: string, values: string[][]) {
  const sheetId = getSheetId();
  const token = await getGoogleAccessToken();
  const res = await fetch(`${SHEETS_BASE}/${sheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values })
  });
  if (!res.ok) throw new Error(`Google Sheets append failed: ${res.status} ${await res.text()}`);
}

function getSheetId() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("GOOGLE_SHEET_ID is not configured");
  return sheetId;
}

async function getGoogleAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) throw new Error("Google service account environment is not configured");

  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt(
    { alg: "RS256", typ: "JWT" },
    {
      iss: clientEmail,
      scope: SHEETS_SCOPE,
      aud: TOKEN_URL,
      exp: now + 3600,
      iat: now
    },
    privateKey
  );

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  if (!res.ok) throw new Error(`Google token request failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

function signJwt(header: Record<string, unknown>, payload: Record<string, unknown>, privateKey: string) {
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  return `${signingInput}.${base64Url(signer.sign(privateKey))}`;
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
