import type { BodyFixClassification } from "./types";

export function shouldNotifyHuman(classification: BodyFixClassification) {
  return classification.needHuman ||
    classification.leadTemperature === "A" ||
    classification.bookingStage === "human_takeover";
}

function singleLine(value: string | undefined, fallback = "待確認") {
  const normalized = (value || "").replace(/[\r\n\t]+/g, " ").trim();
  return normalized || fallback;
}

function serviceLabel(value: BodyFixClassification["preferredService"]) {
  const known: Record<BodyFixClassification["preferredService"], string> = {
    standard_fascia_60: "肌筋膜整理",
    pelvic_core_60: "骨盆核心整理",
    fascia_extension_30: "肌筋膜整理加時",
    pelvic_extension_30: "骨盆核心整理加時",
    mixed_extension: "整合服務／加時",
    one_on_one_coaching: "私人教練課",
    unknown: "尚未選擇"
  };
  return known[value] || "尚未選擇";
}

function intentLabel(value: BodyFixClassification["intent"]) {
  const known: Record<BodyFixClassification["intent"], string> = {
    booking: "預約",
    pricing: "詢問價格",
    service_difference: "比較服務",
    body_issue: "身體狀況諮詢",
    coaching: "私人教練課",
    location: "據點／到府",
    oil_massage: "按摩方式",
    sexual_service: "服務界線詢問",
    followup: "後續聯繫",
    unclear: "待釐清"
  };
  return known[value] || "待釐清";
}

/**
 * Customer-facing booking messages and owner alerts must be kept separate.
 * A booking needs a human to confirm times; that is not an indication of a safety issue.
 */
export function formatHumanNotification(
  displayName: string,
  classification: BodyFixClassification
) {
  const name = singleLine(displayName, "未取得暱稱");

  if (classification.intent === "booking") {
    const rows = [
      "📩 BodyFix｜新預約詢問",
      "客戶：" + name,
      "服務：" + serviceLabel(classification.preferredService),
      "日期／時間：" + singleLine(classification.preferredTime),
      "地點：" + singleLine(classification.preferredLocation),
      "預約狀態：" + (classification.bookingStage === "booked"
        ? "AI 標記已預約，請人工核對"
        : "待 Gavin 確認，尚未成立預約"),
      "下一步：請至官方 LINE 聊天室確認服務、日期、時間與據點，再親自回覆客戶。"
    ];
    if (classification.bodyIssue?.trim()) {
      rows.splice(3, 0, "需求：" + singleLine(classification.bodyIssue));
    }
    return rows.join("\n");
  }

  if (classification.needHuman || classification.bookingStage === "human_takeover") {
    const rows = [
      "📨 BodyFix｜需要真人接手",
      "客戶：" + name,
      "詢問類型：" + intentLabel(classification.intent)
    ];
    if (classification.bodyIssue?.trim()) {
      rows.push("客戶描述：" + singleLine(classification.bodyIssue));
    }
    rows.push("下一步：請查看官方 LINE 原始對話，確認需求後親自回覆。");
    return rows.join("\n");
  }

  const rows = [
    "⭐ BodyFix｜高意願服務詢問",
    "客戶：" + name,
    "詢問類型：" + intentLabel(classification.intent)
  ];
  if (classification.bodyIssue?.trim()) {
    rows.push("需求：" + singleLine(classification.bodyIssue));
  }
  if (classification.preferredTime?.trim()) {
    rows.push("時間：" + singleLine(classification.preferredTime));
  }
  if (classification.preferredLocation?.trim()) {
    rows.push("地點：" + singleLine(classification.preferredLocation));
  }
  rows.push("下一步：請查看官方 LINE 對話，依需求提供相關服務資訊或確認預約。");
  return rows.join("\n");
}
