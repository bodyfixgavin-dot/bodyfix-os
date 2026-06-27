import { NextResponse } from "next/server";
import { generateBodyFixReply } from "@/lib/bodyfix-ai/openai";
import { createCoachingResult, isCoachingIntent } from "../../../../lib/bodyfix-ai/coaching";
import { WELCOME_REPLY } from "@/lib/bodyfix-ai/prompt";
import { createHmac, timingSafeEqual } from "crypto";
import { createWelcomeRecord, ensureSheetHeaders, getCrmRecord, recordIncomingMessage, upsertCrmRecord } from "@/lib/bodyfix-ai/sheets";
import { getAutomationDecision } from "@/lib/bodyfix-ai/conversation-state";
import type { BodyFixAiResult, BodyFixClassification, LineEvent } from "@/lib/bodyfix-ai/types";

export const runtime = "nodejs";

const WEBHOOK_SOURCE = "legacy-line-channel";
const LINE_API_BASE = "https://api.line.me/v2/bot";

const AI_FALLBACK_REPLY = "收到你的訊息。目前自動接待暫時無法完成判讀，我已保留你的需求。你可以直接留下想處理的狀況、方便地點與時間，Gavin 會在工作空檔親自確認。";

const AI_FALLBACK_RESULT: BodyFixAiResult = {
  replyText: AI_FALLBACK_REPLY,
  classification: {
    intent: "unclear",
    leadTemperature: "C",
    bookingStage: "human_takeover",
    preferredService: "unknown",
    needHuman: true,
    bodyIssue: "",
    bodyArea: "",
    preferredLocation: "",
    preferredTime: "",
    nextAction: "human_takeover",
    notes: "AI reply generation failed; human takeover requested."
  }
};

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!verifyLegacyLineSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid LINE signature" }, { status: 401 });
  }

  let payload: { events?: LineEvent[] };
  try {
    payload = JSON.parse(rawBody) as { events?: LineEvent[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const events = payload.events || [];
  if (events.length === 0) return NextResponse.json({ ok: true });

  try {
    await ensureSheetHeaders();
  } catch (error) {
    logWebhookError("Failed to ensure Sheet headers", error);
  }

  await Promise.all(events.map((event) => handleLineEventSafely(event)));
  return NextResponse.json({ ok: true });
}

async function handleLineEventSafely(event: LineEvent) {
  try {
    await handleLineEvent(event);
  } catch (error) {
    logWebhookError("Failed to process LINE event", error, {
      eventType: event.type,
      userId: event.source?.userId
    });
  }
}

async function handleLineEvent(event: LineEvent) {
  const userId = event.source?.userId;
  if (!userId || !event.replyToken) return;

  if (event.type === "follow") {
    const displayName = await getLineDisplayName(userId);
    const decision = await getAutomationDecision(userId);
    if (!decision.allowSend) {
      await notifyGavin(`Legacy LINE 自動歡迎已暫停\n客戶：${displayName || userId}\n原因：${decision.reason}`);
      return;
    }

    try {
      await replyLineMessage(event.replyToken, WELCOME_REPLY);
      await createWelcomeRecord({ userId, displayName, replyText: WELCOME_REPLY });
    } catch (error) {
      logWebhookError("Failed to send LINE welcome reply", error, { eventType: event.type, userId });
    }
    return;
  }

  if (event.type !== "message" || event.message?.type !== "text" || !event.message.text) return;

  const displayName = await getLineDisplayName(userId);
  let existing: Awaited<ReturnType<typeof getCrmRecord>> = null;
  try {
    existing = await getCrmRecord(userId);
    await recordIncomingMessage({
      userId,
      displayName,
      userMessage: event.message.text,
      existing,
      note: "Legacy LINE message received before automation decision."
    });
  } catch (error) {
    logWebhookError("Failed to save incoming LINE message", error, { eventType: event.type, userId });
  }

  const beforeAi = await getAutomationDecision(userId);
  if (!beforeAi.allowAi) {
    await notifyGavin(formatSuppressedNotification(displayName || userId, event.message.text, beforeAi.reason));
    return;
  }

  const aiResult = await generateReplyWithFallback(event.message.text, existing?.record, event.type, userId);

  const beforeSend = await getAutomationDecision(userId);
  if (!beforeSend.allowSend) {
    await notifyGavin(formatDraftNotification(displayName || userId, event.message.text, aiResult.replyText, beforeSend.reason));
    return;
  }

  try {
    await replyLineMessage(event.replyToken, aiResult.replyText);
  } catch (error) {
    logWebhookError("Failed to send LINE reply", error, { eventType: event.type, userId });
    return;
  }

  let recordDisplayName = displayName || userId;
  try {
    const record = await upsertCrmRecord({
      userId,
      displayName,
      userMessage: event.message.text,
      aiResult
    });
    recordDisplayName = record.displayName || userId;
  } catch (error) {
    logWebhookError("Failed to upsert CRM record", error, { eventType: event.type, userId });
  }

  if (shouldNotifyHuman(aiResult.classification)) {
    try {
      await notifyGavin(formatHumanNotification(recordDisplayName, aiResult.classification));
    } catch (error) {
      logWebhookError("Failed to notify Gavin", error, { eventType: event.type, userId });
    }
  }
}

async function generateReplyWithFallback(message: string, crm: Parameters<typeof generateBodyFixReply>[1], eventType: string, userId: string) {
  if (isCoachingIntent(message)) return createCoachingResult();

  try {
    return await generateBodyFixReply(message, crm);
  } catch (error) {
    logWebhookError("Failed to generate AI reply", error, { eventType, userId });
    return AI_FALLBACK_RESULT;
  }
}

function verifyLegacyLineSignature(rawBody: string, signature: string | null) {
  const secret = process.env.LINE_LEGACY_CHANNEL_SECRET;
  if (!secret || !signature) return false;

  const digest = createHmac("sha256", secret).update(rawBody).digest("base64");
  const expected = Buffer.from(digest);
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function getLegacyLineToken() {
  const token = process.env.LINE_LEGACY_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_LEGACY_CHANNEL_ACCESS_TOKEN is not configured");
  return token;
}

async function replyLineMessage(replyToken: string, text: string) {
  const res = await fetch(`${LINE_API_BASE}/message/reply`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getLegacyLineToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text: truncateLineText(text) }]
    })
  });
  if (!res.ok) throw new Error(`Legacy LINE reply failed: ${res.status} ${await res.text()}`);
}

async function pushLineMessage(userId: string, text: string) {
  const res = await fetch(`${LINE_API_BASE}/message/push`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getLegacyLineToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text: truncateLineText(text) }]
    })
  });
  if (!res.ok) throw new Error(`Legacy LINE push failed: ${res.status} ${await res.text()}`);
}

async function getLineDisplayName(userId: string) {
  try {
    const res = await fetch(`${LINE_API_BASE}/profile/${userId}`, {
      headers: { Authorization: `Bearer ${getLegacyLineToken()}` }
    });
    if (!res.ok) return "";
    const profile = (await res.json()) as { displayName?: string };
    return profile.displayName || "";
  } catch {
    return "";
  }
}

async function notifyGavin(text: string) {
  const gavinLineUserId = process.env.GAVIN_LINE_USER_ID;
  if (!gavinLineUserId) return;
  await pushLineMessage(gavinLineUserId, text);
}

function truncateLineText(text: string) {
  return text.length > 4900 ? `${text.slice(0, 4897)}...` : text;
}

function shouldNotifyHuman(classification: BodyFixClassification) {
  return classification.needHuman || classification.leadTemperature === "A" || classification.bookingStage === "human_takeover";
}

function formatSuppressedNotification(displayName: string, userMessage: string, reason: string) {
  return `Legacy LINE 待人工處理：\n客戶：${displayName}\n原因：${reason}\n訊息：${userMessage.slice(0, 1200)}`;
}

function formatDraftNotification(displayName: string, userMessage: string, draft: string, reason: string) {
  return `Legacy LINE AI 草稿未送出：\n客戶：${displayName}\n原因：${reason}\n客戶訊息：${userMessage.slice(0, 800)}\n\n草稿：${draft.slice(0, 1800)}`;
}

function formatHumanNotification(displayName: string, classification: BodyFixClassification) {
  return `高意願客戶提醒：
客戶：${displayName}
狀況：${classification.bodyIssue || "未填"}
意圖：${classification.intent}
建議下一步：請 Gavin 依客戶需求確認適合的服務與時長。
地點偏好：${classification.preferredLocation || "未填"}
時間偏好：${classification.preferredTime || "未填"}
建議回覆：${classification.needHuman ? "請 Gavin 真人判斷安全邊界或收尾。" : "直接提供本週可約時段。"}`;
}

function logWebhookError(message: string, error: unknown, context?: { eventType?: string; userId?: string }) {
  console.error(message, {
    source: WEBHOOK_SOURCE,
    eventType: context?.eventType,
    userId: context?.userId,
    error: error instanceof Error ? error.message : String(error)
  });
}
