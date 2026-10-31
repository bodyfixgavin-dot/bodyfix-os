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


/**
 * Rich Menu audit log. Stores pseudonymous LINE IDs and menu selections
 * without collecting conversation text or sensitive physical details.
 */
export type RichMenuClick = {
  eventId: string;
  clickedAt: string;
  userId: string;
  displayName: string;
  action: string;
  item: string;
  intent: "booking" | "browse";
  eventData: string;
};

const CLICK_TAB = "RichMenuClicks";
const CLICK_HEADERS = [
  "eventId", "clickedAt", "userId", "displayName",
  "action", "item", "intent", "eventData"
];
let clickTabReady: Promise<void> | null = null;

async function ensureClickTab() {
  if (!clickTabReady) {
    clickTabReady = (async () => {
      const id = getSheetId();
      const token = await getGoogleAccessToken();
      const meta = await fetch(
        SHEETS_BASE + "/" + id + "?fields=sheets.properties.title",
        { headers: { Authorization: "Bearer " + token } }
      );
      if (!meta.ok) throw new Error("Click tab metadata failed: " + meta.status);
      const result = (await meta.json()) as { sheets?: Array<{properties?:{title?:string}}> };
      const exists = result.sheets?.some(s => s.properties?.title === CLICK_TAB);
      if (!exists) {
        const res = await fetch(SHEETS_BASE + "/" + id + ":batchUpdate", {
          method: "POST",
          headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
          body: JSON.stringify({ requests: [{ addSheet: { properties: { title: CLICK_TAB } } }] })
        });
        // Another webhook invocation may have created the same tab.
        if (!res.ok && !(res.status === 400 && (await res.text()).includes("already exists"))) {
          throw new Error("Create click tab failed: " + res.status);
        }
      }
      await updateSheetValues(CLICK_TAB + "!A1:H1", [CLICK_HEADERS]);
    })().catch(error => {
      clickTabReady = null;
      throw error;
    });
  }
  await clickTabReady;
}

/**
 * Keep every click. LINE webhookEventId prevents redelivery duplicates.
 * Suppress repeated booking notifications within 30 minutes per user.
 */
export async function recordRichMenuClick(click: RichMenuClick): Promise<{
  saved: boolean;
  notify: boolean;
  duplicate: boolean;
}> {
  await ensureClickTab();
  let notify = click.intent === "booking";
  if (click.intent === "booking" || click.eventId) {
    const rows = await getSheetValues(CLICK_TAB + "!A2:H");
    const recent = rows.slice(-1000);
    if (click.eventId && recent.some(row => row[0] === click.eventId)) {
      return { saved: false, notify: false, duplicate: true };
    }
    if (notify) {
      const prior = [...recent].reverse().find(row =>
        row[2] === click.userId && row[6] === "booking"
      );
      if (prior && Math.abs(Date.parse(click.clickedAt) - Date.parse(prior[1])) < 30 * 60_000) {
        notify = false;
      }
    }
  }
  // Prevent spreadsheet-formula injection from external LINE display names.
  const safeCell = (value: string) => /^[=+\\-@]/.test(value) ? "'" + value : value;
  await appendSheetValues(CLICK_TAB + "!A:H", [[
    click.eventId, click.clickedAt, click.userId, click.displayName,
    click.action, click.item, click.intent, click.eventData
  ].map(safeCell)]);
  return { saved: true, notify, duplicate: false };
}

/** Preserve real chat-message history when recording an action-only click. */
export async function markRichMenuBookingIntent(input: {
  userId: string;
  displayName?: string;
  item: string;
  clickedAt: string;
}) {
  const existing = await getCrmRecord(input.userId);
  const previous = existing?.record;
  const note = input.clickedAt + " Rich Menu 預約點擊：" + input.item + "（未完成預約）";
  const record: CrmRecord = {
    userId: input.userId,
    displayName: input.displayName || previous?.displayName || "",
    firstSeenAt: previous?.firstSeenAt || input.clickedAt,
    lastUserMessageAt: previous?.lastUserMessageAt || "",
    lastBotMessageAt: previous?.lastBotMessageAt || "",
    lastUserMessage: previous?.lastUserMessage || "",
    lastBotReply: previous?.lastBotReply || "",
    lastIntent: "booking",
    bodyIssue: previous?.bodyIssue || "",
    bodyArea: previous?.bodyArea || "",
    preferredService: previous?.preferredService || "unknown",
    bookingStage: previous?.bookingStage === "booked" ? "booked" : "waiting_time",
    leadTemperature: "A",
    nextAction: "ask_time",
    needHuman: "true",
    preferredLocation: previous?.preferredLocation || "",
    preferredTime: previous?.preferredTime || "",
    followupCount: previous?.followupCount || "0",
    lastFollowupAt: previous?.lastFollowupAt || "",
    notes: mergeNotes(previous?.notes, note)
  };
  if (existing) {
    await updateSheetValues("A" + existing.rowNumber + ":T" + existing.rowNumber, [recordToRow(record)]);
  } else {
    await appendSheetValues("A:T", [recordToRow(record)]);
  }
  return record;
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
  return data.access_token;
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
