import type { BodyFixAiResult } from "./types";

export const COACHING_REPLY = "有的，BodyFix 提供一對一動作整合訓練。課程會依你目前的身體狀態、動作經驗與目標安排，也會留意代償、張力分工與過往不適，不只是帶你把動作做完。你可以先告訴我：目前想改善的目標、平常運動頻率，以及方便的地點與時間。";

const COACHING_KEYWORDS = [
  "一對一教練課",
  "1對1教練課",
  "1對1",
  "教練課",
  "私人教練",
  "訓練課",
  "動作整合訓練",
  "健身訓練"
];

export function isCoachingIntent(message: string) {
  const normalized = message.replace(/\s+/g, "").toLowerCase();
  return COACHING_KEYWORDS.some((keyword) => normalized.includes(keyword.replace(/\s+/g, "").toLowerCase()));
}

export function createCoachingResult(): BodyFixAiResult {
  return {
    replyText: COACHING_REPLY,
    classification: {
      intent: "coaching",
      leadTemperature: "B",
      bookingStage: "assessing",
      preferredService: "one_on_one_coaching",
      needHuman: false,
      bodyIssue: "一對一動作整合訓練諮詢",
      bodyArea: "",
      preferredLocation: "",
      preferredTime: "",
      nextAction: "ask_training_goal",
      notes: "Matched coaching keyword; fixed reply used without OpenAI."
    }
  };
}
