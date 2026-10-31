import { describe, it, expect } from "vitest";
import { isBriefReaction, REACTION_ACKNOWLEDGEMENT } from "./reactions";

describe("short reaction handling", () => {
  it("recognizes common emoji-only acknowledgements", () => {
    for (const text of ["❤️", "❤️❤️", "👍", "🙏", "😊", "😍", "💕", "😂😂"]) {
      expect(isBriefReaction(text)).toBe(true);
    }
    expect(REACTION_ACKNOWLEDGEMENT).toContain("收到");
  });
  it("keeps real booking inquiries and messages on normal routing", () => {
    for (const text of ["我想預約 BodyFix", "❤️ 我想預約骨盆核心", "請幫我安排明天", "測試真人訊息1101", "你好", "謝謝，我想約六張犁"]) {
      expect(isBriefReaction(text)).toBe(false);
    }
  });
});
