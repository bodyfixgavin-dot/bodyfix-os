import { NextResponse } from "next/server";
import { generateBodyFixReply } from "@/lib/bodyfix-ai/openai";
import { WELCOME_REPLY } from "@/lib/bodyfix-ai/prompt";
import { getLineDisplayName, notifyGavin, replyLineMessage, verifyLineSignature } from "@/lib/bodyfix-ai/line";
import { createWelcomeRecord, ensureSheetHeaders, getCrmRecord, upsertCrmRecord } from "@/lib/bodyfix-ai/sheets";
import type { BodyFixAiResult, BodyFixClassification, LineEvent } from "@/lib/bodyfix-ai/types";

export const runtime = "nodejs";

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

  if (!verifyLineSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid LINE signature" }, { status: 401 });
  }

  let payload: { events?: LineEvent[] };
  try {
    payload = JSON.parse(rawBody) as { events?: LineEvent[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const events = payload.events || [];
  if (events.length === 0) {
    return NextResponse.json({ ok: true });
  }

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
    try {
      await replyLineMessage(event.replyToken, WELCOME_REPLY);
    } catch (error) {
      logWebhookError("Failed to send LINE welcome reply", error, { eventType: event.type, userId });
    }

    try {
      await createWelcomeRecord({ userId, displayName, replyText: WELCOME_REPLY });
    } catch (error) {
      logWebhookError("Failed to create welcome CRM record", error, { eventType: event.type, userId });
    }
    return;
  }

  if (event.type !== "message" || event.message?.type !== "text" || !event.message.text) return;

  const displayName = await getLineDisplayName(userId);

  let existing: Awaited<ReturnType<typeof getCrmRecord>> = null;
  try {
    existing = await getCrmRecord(userId);
  } catch (error) {
    logWebhookError("Failed to read CRM record", error, { eventType: event.type, userId });
  }

  const aiResult = await generateReplyWithFallback(event.message.text, existing?.record, event.type, userId);

  try {
    await replyLineMessage(event.replyToken, aiResult.replyText);
  } catch (error) {
    logWebhookError("Failed to send LINE reply", error, { eventType: event.type, userId });
  }

  let recordDisplayName = displayName || userId;
  try {
    const record = await upsertCrmRecord({
      userId,
      displayName,
      userMessage: event.message.text,
      aiResult,
      existing
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
  try {
    return await generateBodyFixReply(message, crm);
  } catch (error) {
    logWebhookError("Failed to generate AI reply", error, { eventType, userId });
    return AI_FALLBACK_RESULT;
  }
}

function shouldNotifyHuman(classification: BodyFixClassification) {
  return classification.needHuman || classification.leadTemperature === "A" || classification.bookingStage === "human_takeover";
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
    eventType: context?.eventType,
    userId: context?.userId,
    error: error instanceof Error ? error.message : String(error)
  });
}
