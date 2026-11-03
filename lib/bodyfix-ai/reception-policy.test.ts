import { describe, it, expect } from "vitest";
import { createFirstContactResult, shouldAcknowledgeFirstMessage, FIRST_CONTACT_ACK } from "./reception-policy";
import type { CrmRecord } from "./types";

function record(lastUserMessageAt: string): CrmRecord {
  return {
    userId: "line-user", displayName: "Test", firstSeenAt: "2026-01-01T00:00:00Z",
    lastUserMessageAt, lastBotMessageAt: "", lastUserMessage: "", lastBotReply: "",
    lastIntent: "", bodyIssue: "", bodyArea: "", preferredService: "unknown",
    bookingStage: "assessing", leadTemperature: "C", nextAction: "ask_body_issue",
    needHuman: "false", preferredLocation: "", preferredTime: "",
    followupCount: "0", lastFollowupAt: "", notes: ""
  };
}

describe("BodyFix first-contact-only response policy", () => {
  it("only acknowledges an actual first customer message", () => {
    expect(shouldAcknowledgeFirstMessage(null)).toBe(true);
    expect(shouldAcknowledgeFirstMessage(record(""))).toBe(true); // follower welcome
    expect(shouldAcknowledgeFirstMessage(record("2026-11-03T17:45:00Z"))).toBe(false);
  });

  it("does not generate booking confirmations or promise an appointment", () => {
    const result = createFirstContactResult("想約10號下午2點，六張犁");
    expect(result.replyText).toBe(FIRST_CONTACT_ACK);
    expect(result.replyText.includes("已預約")).toBe(false);
    expect(result.replyText.includes("幫你安排")).toBe(false);
    expect(result.classification.bookingStage).toBe("human_takeover");
    expect(result.classification.needHuman).toBe(true);
  });

  it("preserves explicit rich-menu booking acknowledgment, but hands off thereafter", () => {
    const result = createFirstContactResult("我想預約 BodyFix");
    expect(result.replyText.includes("收到你的預約詢問")).toBe(true);
    expect(result.classification.intent).toBe("booking");
    expect(result.classification.bookingStage).toBe("human_takeover");
    expect(result.classification.nextAction).toBe("human_takeover");
  });
});
