import { afterEach, describe, expect, it } from "vitest";
import { getAutomationMode, isHumanActive, type ConversationState } from "./conversation-state";

const baseState: ConversationState = {
  lineUserId: "U-test",
  conversationMode: "human",
  humanUntil: null,
  updatedAt: null,
  updatedBy: "test"
};

const originalMode = process.env.LINE_AUTOMATION_MODE;

afterEach(() => {
  if (originalMode === undefined) delete process.env.LINE_AUTOMATION_MODE;
  else process.env.LINE_AUTOMATION_MODE = originalMode;
});

describe("getAutomationMode", () => {
  it("fails closed to manual when unset or invalid", () => {
    delete process.env.LINE_AUTOMATION_MODE;
    expect(getAutomationMode()).toBe("manual");
    process.env.LINE_AUTOMATION_MODE = "unexpected";
    expect(getAutomationMode()).toBe("manual");
  });

  it("accepts manual, draft, and auto", () => {
    process.env.LINE_AUTOMATION_MODE = "draft";
    expect(getAutomationMode()).toBe("draft");
    process.env.LINE_AUTOMATION_MODE = "auto";
    expect(getAutomationMode()).toBe("auto");
  });
});

describe("isHumanActive", () => {
  it("keeps indefinite human takeover active", () => {
    expect(isHumanActive(baseState, new Date("2026-06-27T10:00:00Z"))).toBe(true);
  });

  it("recognizes future and expired takeover windows", () => {
    expect(isHumanActive({ ...baseState, humanUntil: "2026-06-27T11:00:00Z" }, new Date("2026-06-27T10:00:00Z"))).toBe(true);
    expect(isHumanActive({ ...baseState, humanUntil: "2026-06-27T09:00:00Z" }, new Date("2026-06-27T10:00:00Z"))).toBe(false);
  });

  it("does not treat bot or paused as human takeover", () => {
    expect(isHumanActive({ ...baseState, conversationMode: "bot" })).toBe(false);
    expect(isHumanActive({ ...baseState, conversationMode: "paused" })).toBe(false);
  });
});
