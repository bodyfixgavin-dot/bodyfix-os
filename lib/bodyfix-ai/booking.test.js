import { describe, expect, it } from "vitest";
import { createMenuBookingResult } from "./booking";

describe("message-action booking reception", () => {
  it("classifies immediate booking without AI guessing", () => {
    const result = createMenuBookingResult("我想預約 BodyFix");
    expect(result?.classification).toMatchObject({
      intent: "booking",
      leadTemperature: "A",
      bookingStage: "waiting_time",
      needHuman: true,
      nextAction: "ask_time"
    });
    expect(result?.replyText).toContain("尚未完成預約");
  });

  it("asks about service and date instead of inventing available calendar slots", () => {
    const result = createMenuBookingResult("我想查看本週可約時段");
    expect(result?.replyText).toContain("確認行事曆後");
    expect(result?.classification.intent).toBe("booking");
  });

  it("does not confuse other chat or service messages with the menu action", () => {
    expect(createMenuBookingResult("測試真人訊息1101")).toBeNull();
    expect(createMenuBookingResult("我想預約骨盆核心整理，明天下午")).toBeNull();
  });
});
