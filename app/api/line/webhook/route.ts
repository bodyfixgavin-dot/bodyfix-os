import { NextResponse } from "next/server";
import { shouldAcknowledgeFirstMessage, createFirstContactResult } from "../../../../lib/bodyfix-ai/reception-policy";
import { isBriefReaction } from "../../../../lib/bodyfix-ai/reactions";
import { WELCOME_REPLY } from "@/lib/bodyfix-ai/prompt";
import { getLineDisplayName, notifyGavin, replyLineMessage, replyLineMessages, verifyLineSignature } from "@/lib/bodyfix-ai/line";
import { locationDetailMessages, serviceDetailMessages } from "../../../../lib/bodyfix-ai/richmenu";
import { createWelcomeRecord, ensureSheetHeaders, getCrmRecord, upsertCrmRecord, recordHumanHandoffMessage, recordRichMenuClick, markRichMenuBookingIntent } from "@/lib/bodyfix-ai/sheets";
import type { LineEvent } from "@/lib/bodyfix-ai/types";
import { shouldNotifyHuman, formatHumanNotification } from "../../../../lib/bodyfix-ai/notifications";

export const runtime = "nodejs";

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

  if (event.type === "postback" && event.postback?.data) {
    await handlePostbackEvent(event, userId);
    return;
  }

  if (event.type !== "message" || event.message?.type !== "text" || !event.message.text) return;

  // Emoji reactions never need a bot message; especially not after Gavin
  // has taken control of a real conversation.
  if (isBriefReaction(event.message.text)) return;

  const displayName = await getLineDisplayName(userId);

  let existing: Awaited<ReturnType<typeof getCrmRecord>> = null;
  try {
    existing = await getCrmRecord(userId);
  } catch (error) {
    // Fail closed: if we cannot determine ownership of the conversation,
    // do not risk an unwanted automatic reply.
    logWebhookError("Failed to read CRM; human-only response", error, { eventType: event.type, userId });
    return;
  }

  if (!shouldAcknowledgeFirstMessage(existing?.record)) {
    // Existing customers (including Gavin's active manual chats) never get
    // a conversational bot response. Still retain the latest inbound text.
    try {
      await recordHumanHandoffMessage({
        userId,
        displayName,
        userMessage: event.message.text,
        existing
      });
    } catch (error) {
      logWebhookError("Failed to record inbound human chat", error, { eventType: event.type, userId });
    }
    return;
  }

  // A new contact receives one short fixed acknowledgement, never generative
  // AI. Subsequent messages silently become Gavin's responsibility.
  const aiResult = createFirstContactResult(event.message.text);
  try {
    await replyLineMessage(event.replyToken, aiResult.replyText);
  } catch (error) {
    logWebhookError("Failed to send first-contact reply", error, { eventType: event.type, userId });
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
    logWebhookError("Failed to record first-contact CRM", error, { eventType: event.type, userId });
  }

  if (shouldNotifyHuman(aiResult.classification)) {
    try {
      await notifyGavin(formatHumanNotification(recordDisplayName, aiResult.classification));
    } catch (error) {
      logWebhookError("Failed to notify Gavin about first contact", error, { eventType: event.type, userId });
    }
  }
}

function bookingReply(mode: string) {
  if (mode === "notice") {
    return "BodyFix 採預約制。請先告訴我希望的服務、方便的日期／時段與地點，確認後才算完成預約；若需接觸敏感區域，會先說明內容並取得明確同意。";
  }
  if (mode === "this-week") {
    return "收到！想查本週可約時段，請回覆：① 想預約的服務 ② 方便日期與時段 ③ 六張犁／西門／國父紀念館／指定地點。Gavin 確認行程後會親自回覆。";
  }
  if (mode === "custom-location") {
    return "收到指定地點服務的詢問！請回覆：① 希望的服務 ② 大致地區（不用先傳完整地址）③ 日期與時間。確認可安排後再提供細節。";
  }
  return "收到你的預約詢問 ❤️ 請直接回覆：① 想預約的服務 ② 方便的日期與時間 ③ 希望的地點。Gavin 確認後會親自回覆；點選按鈕尚不代表預約完成。";
}

function describeClick(action: string, item: string) {
  const known: Record<string, string> = {
    "body-reset": "肌筋膜整理",
    "pelvic-core": "骨盆核心整理",
    "vip-pelvic": "骨盆核心整理（舊按鈕）",
    "personal-training": "私人教練課",
    "training-plans": "教練課方案",
    "ziwei": "紫微斗數",
    "tarot": "塔羅占卜",
    "luzhangli": "六張犁工作室",
    "ximen": "西門共享工作室",
    "sunyatsen": "國父紀念館工作室",
    "custom": "指定地點",
    "immediate": "直接預約",
    "this-week": "本週可約時段",
    "specific-time": "指定時段預約",
    "custom-location": "指定地點預約",
    "notice": "預約須知",
    "gavin": "認識 Gavin",
    "first-visit": "第一次來",
    "faq": "常見問題",
    "4r": "4R Method",
    "about-bodyfix": "認識 BodyFix"
  };
  return known[item] || (action === "booking" ? "預約詢問" : "其他選單");
}

async function handlePostbackEvent(event: LineEvent, userId: string) {
  if (!event.replyToken || !event.postback?.data) return;

  const params = new URLSearchParams(event.postback.data);
  const action = params.get("action") || "";
  if (!["booking", "service", "location", "content"].includes(action)) return;

  const itemKey = action === "booking" ? params.get("mode") || "immediate"
    : action === "service" ? params.get("service") || ""
    : action === "location" ? params.get("location") || ""
    : params.get("content") || "";
  const item = describeClick(action, itemKey);
  const booking = action === "booking" && itemKey !== "notice";
  const clickedAt = new Date(event.timestamp || Date.now()).toISOString();
  const displayName = await getLineDisplayName(userId);

  let notify = booking;
  let duplicate = false;
  try {
    const tracked = await recordRichMenuClick({
      eventId: event.webhookEventId || "",
      clickedAt,
      userId,
      displayName,
      action,
      item,
      intent: booking ? "booking" : "browse",
      eventData: action + "=" + itemKey
    });
    notify = tracked.notify;
    duplicate = tracked.duplicate;
  } catch (error) {
    logWebhookError("Failed to record Rich Menu click", error, { eventType: event.type, userId });
  }

  // LINE may redeliver an event with the same ID. Avoid replying or notifying twice.
  if (duplicate) return;

  // Reply failures must never discard an otherwise valid booking lead.
  try {
    if (action === "service") {
      await replyLineMessages(event.replyToken, serviceDetailMessages(itemKey));
    } else if (action === "location") {
      await replyLineMessages(event.replyToken, locationDetailMessages(itemKey));
    } else if (action === "booking") {
      await replyLineMessage(event.replyToken, bookingReply(itemKey));
    }
  } catch (error) {
    logWebhookError("Failed to reply to Rich Menu click", error, { eventType: event.type, userId });
  }

  if (booking && notify) {
    try {
      await markRichMenuBookingIntent({ userId, displayName, item, clickedAt });
    } catch (error) {
      logWebhookError("Failed to mark Rich Menu booking in CRM", error, { eventType: event.type, userId });
    }
    try {
      const name = displayName || "未取得暱稱的使用者";
      await notifyGavin(
        "📩 BodyFix｜新預約意願\n客戶：" + name +
        "\n選單：" + item +
        "\n時間：" + clickedAt +
        "\n狀態：點選預約，尚未確認時段。\n請在官方 LINE 聊天室確認需求。"
      );
    } catch (error) {
      logWebhookError("Failed to notify Gavin about Rich Menu booking", error, { eventType: event.type, userId });
    }
  }
}

function logWebhookError(message: string, error: unknown, context?: { eventType?: string; userId?: string }) {
  console.error(message, {
    eventType: context?.eventType,
    userId: context?.userId,
    error: error instanceof Error ? error.message : String(error)
  });
}
