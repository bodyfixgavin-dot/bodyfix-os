import { describe, expect, it } from "vitest";
import { formatHumanNotification, shouldNotifyHuman } from "./notifications";
import type { BodyFixClassification } from "./types";

const base: BodyFixClassification = {
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
  notes: ""
};

describe("LINE owner notifications", () => {
  it("shows booking details and next step without suggesting a safety issue", () => {
    const result = formatHumanNotification("Gavin", base);
    expect(result.includes("新預約詢問")).toBe(true);
    expect(result.includes("待 Gavin 確認，尚未成立預約")).toBe(true);
    expect(result.includes("官方 LINE 聊天室")).toBe(true);
    expect(result.includes("安全邊界")).toBe(false);
    expect(result.includes("高意願客戶提醒")).toBe(false);
    expect(result.includes("狀況：未填")).toBe(false);
    expect(result.includes("收尾")).toBe(false);
    expect(shouldNotifyHuman(base)).toBe(true);
  });

  it("includes known booking time/location/service and avoids inventing availability", () => {
    const result = formatHumanNotification("客戶A", {
      ...base,
      preferredService: "pelvic_core_60",
      preferredTime: "週三晚上",
      preferredLocation: "六張犁"
    });
    expect(result.includes("骨盆核心整理")).toBe(true);
    expect(result.includes("週三晚上")).toBe(true);
    expect(result.includes("六張犁")).toBe(true);
    expect(result.includes("已完成預約")).toBe(false);
  });

  it("uses handoff wording for nonbooking cases that actually need a person", () => {
    const result = formatHumanNotification("客戶B", {
      ...base,
      intent: "body_issue",
      leadTemperature: "B",
      bookingStage: "human_takeover",
      needHuman: true,
      bodyIssue: "手臂麻刺"
    });
    expect(result.includes("需要真人接手")).toBe(true);
    expect(result.includes("手臂麻刺")).toBe(true);
    expect(result.includes("新預約詢問")).toBe(false);
  });

  it("uses service inquiry wording for high interest that is not booking", () => {
    const result = formatHumanNotification("客戶C", {
      ...base,
      intent: "pricing",
      needHuman: false,
      bookingStage: "assessing",
      preferredTime: "",
      leadTemperature: "A"
    });
    expect(result.includes("高意願服務詢問")).toBe(true);
    expect(result.includes("詢問價格")).toBe(true);
    expect(result.includes("安全邊界")).toBe(false);
  });

  it("only alerts when a human is needed, the lead is A, or takeover is requested", () => {
    expect(shouldNotifyHuman({ ...base, leadTemperature: "C", needHuman: false, bookingStage: "assessing" })).toBe(false);
    expect(shouldNotifyHuman({ ...base, leadTemperature: "A", needHuman: false, bookingStage: "assessing" })).toBe(true);
    expect(shouldNotifyHuman({ ...base, leadTemperature: "C", needHuman: true, bookingStage: "assessing" })).toBe(true);
  });

  it("keeps newlines from customer-provided display names out of alert structure", () => {
    const result = formatHumanNotification("小明\n預約狀態：已付款", base);
    expect(result.includes("客戶：小明 預約狀態：已付款")).toBe(true);
    expect(result.includes("\n預約狀態：已付款")).toBe(false);
  });
});
