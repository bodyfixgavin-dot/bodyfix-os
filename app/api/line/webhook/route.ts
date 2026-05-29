import { NextResponse } from "next/server";
import { generateBodyFixReply } from "@/lib/bodyfix-ai/openai";
import { WELCOME_REPLY } from "@/lib/bodyfix-ai/prompt";
import { getLineDisplayName, notifyGavin, replyLineMessage, verifyLineSignature } from "@/lib/bodyfix-ai/line";
import { createWelcomeRecord, ensureSheetHeaders, getCrmRecord, upsertCrmRecord } from "@/lib/bodyfix-ai/sheets";
import type { BodyFixClassification, LineEvent } from "@/lib/bodyfix-ai/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!verifyLineSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid LINE signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as { events?: LineEvent[] };
  const events = payload.events || [];

  await ensureSheetHeaders();
  await Promise.all(events.map((event) => handleLineEvent(event)));

  return NextResponse.json({ ok: true });
}

async function handleLineEvent(event: LineEvent) {
  const userId = event.source?.userId;
  if (!userId || !event.replyToken) return;

  if (event.type === "follow") {
    const displayName = await getLineDisplayName(userId);
    await replyLineMessage(event.replyToken, WELCOME_REPLY);
    await createWelcomeRecord({ userId, displayName, replyText: WELCOME_REPLY });
    return;
  }

  if (event.type !== "message" || event.message?.type !== "text" || !event.message.text) return;

  const displayName = await getLineDisplayName(userId);
  const existing = await getCrmRecord(userId);
  const aiResult = await generateBodyFixReply(event.message.text, existing?.record);

  await replyLineMessage(event.replyToken, aiResult.replyText);
  const record = await upsertCrmRecord({
    userId,
    displayName,
    userMessage: event.message.text,
    aiResult,
    existing
  });

  if (shouldNotifyHuman(aiResult.classification)) {
    await notifyGavin(formatHumanNotification(record.displayName || userId, aiResult.classification));
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
建議安排：60 分鐘標準整理
地點偏好：${classification.preferredLocation || "未填"}
時間偏好：${classification.preferredTime || "未填"}
建議回覆：${classification.needHuman ? "請 Gavin 真人判斷安全邊界或收尾。" : "直接提供本週可約時段。"}`;
}
