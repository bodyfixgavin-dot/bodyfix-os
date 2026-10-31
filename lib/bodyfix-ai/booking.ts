import type { BodyFixAiResult } from "./types";

/**
 * Deterministic reception for Rich Menu message actions. These appear as true
 * user messages in LINE Official Account Manager rather than postback displayText.
 * Exact-match only: ordinary customer messages still use the normal AI flow.
 */
export function createMenuBookingResult(message: string): BodyFixAiResult | null {
  const text = message.trim().replace(/\s+/g, " ");
  const isImmediate = text === "我想預約 BodyFix";
  const isWeek = text === "我想查看本週可約時段";
  if (!isImmediate && !isWeek) return null;

  return {
    replyText: isWeek
      ? "收到你的時段詢問 ❤️ 請回覆：① 想預約的服務 ② 方便的日期與時段 ③ 想安排的地點。Gavin 確認行事曆後會親自回覆；此訊息不代表預約成功。"
      : "收到你的預約詢問 ❤️ 請直接回覆：① 想預約的服務 ② 方便的日期與時間 ③ 希望的地點。Gavin 確認後會親自回覆；尚未完成預約。",
    classification: {
      intent: "booking",
      leadTemperature: "A",
      bookingStage: "waiting_time",
      preferredService: "unknown",
      needHuman: true,
      bodyIssue: "",
      bodyArea: "",
      preferredLocation: "",
      preferredTime: "",
      nextAction: "ask_time",
      notes: isWeek
        ? "客戶詢問本週時段；從一般文字訊息進入（可能來自 Rich Menu），尚未確認預約。"
        : "客戶要求預約；從一般文字訊息進入（可能來自 Rich Menu），尚未確認預約。"
    }
  };
}
