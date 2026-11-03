import { beforeEach, describe, expect, it, vi } from "vitest";

const lineMocks = vi.hoisted(() => ({
  getLineDisplayName: vi.fn(),
  notifyGavin: vi.fn(),
  replyLineMessage: vi.fn(),
  replyLineMessages: vi.fn(),
  verifyLineSignature: vi.fn()
}));

const sheetMocks = vi.hoisted(() => ({
  createWelcomeRecord: vi.fn(),
  ensureSheetHeaders: vi.fn(),
  getCrmRecord: vi.fn(),
  upsertCrmRecord: vi.fn(),
  recordHumanHandoffMessage: vi.fn(),
  recordRichMenuClick: vi.fn(),
  markRichMenuBookingIntent: vi.fn()
}));

const openAiMocks = vi.hoisted(() => ({
  generateBodyFixReply: vi.fn()
}));

vi.mock("@/lib/bodyfix-ai/line", () => lineMocks);
vi.mock("@/lib/bodyfix-ai/sheets", () => sheetMocks);
vi.mock("@/lib/bodyfix-ai/openai", () => openAiMocks);
vi.mock("@/lib/bodyfix-ai/prompt", () => ({ WELCOME_REPLY: "歡迎訊息" }));

function signedRequest(events) {
  return new Request("https://example.test/api/line/webhook", {
    method: "POST",
    headers: { "x-line-signature": "valid" },
    body: JSON.stringify({ events })
  });
}

describe("LINE webhook stability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lineMocks.verifyLineSignature.mockReturnValue(true);
    lineMocks.getLineDisplayName.mockResolvedValue("Gavin Test");
    lineMocks.replyLineMessage.mockResolvedValue(undefined);
    lineMocks.replyLineMessages.mockResolvedValue(undefined);
    lineMocks.notifyGavin.mockResolvedValue(undefined);
    sheetMocks.ensureSheetHeaders.mockResolvedValue(undefined);
    sheetMocks.getCrmRecord.mockResolvedValue(null);
    sheetMocks.upsertCrmRecord.mockResolvedValue({ displayName: "Gavin Test" });
    sheetMocks.recordHumanHandoffMessage.mockResolvedValue({ displayName: "Gavin Test" });
    sheetMocks.createWelcomeRecord.mockResolvedValue(undefined);
    sheetMocks.recordRichMenuClick.mockResolvedValue({ saved: true, notify: true, duplicate: false });
    sheetMocks.markRichMenuBookingIntent.mockResolvedValue(undefined);
    openAiMocks.generateBodyFixReply.mockResolvedValue({
      replyText: "正常 AI 回覆",
      classification: {
        intent: "body_issue",
        leadTemperature: "B",
        bookingStage: "assessing",
        preferredService: "unknown",
        needHuman: false,
        bodyIssue: "肩頸緊繃",
        bodyArea: "肩頸",
        preferredLocation: "",
        preferredTime: "",
        nextAction: "ask_time",
        notes: ""
      }
    });
  });

  it("returns 200 for signed empty events without touching Sheets", async () => {
    const { POST } = await import("./route");

    const res = await POST(signedRequest([]));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(sheetMocks.ensureSheetHeaders).not.toHaveBeenCalled();
    expect(openAiMocks.generateBodyFixReply).not.toHaveBeenCalled();
    expect(lineMocks.replyLineMessage).not.toHaveBeenCalled();
  });

  it("uses a fixed first-contact reply without calling OpenAI", async () => {
    openAiMocks.generateBodyFixReply.mockRejectedValueOnce(new Error("OpenAI unavailable"));
    const { POST } = await import("./route");
    const res = await POST(signedRequest([{
      type: "message", replyToken: "reply-token", source: { userId: "user-1" },
      message: { type: "text", text: "我肩頸很緊" }
    }]));
    expect(res.status).toBe(200);
    expect(lineMocks.replyLineMessage).toHaveBeenCalledWith("reply-token", expect.stringContaining("Gavin 會親自確認"));
    expect(openAiMocks.generateBodyFixReply).not.toHaveBeenCalled();
    expect(sheetMocks.upsertCrmRecord).toHaveBeenCalledWith(expect.objectContaining({
      aiResult: expect.objectContaining({
        classification: expect.objectContaining({ bookingStage: "human_takeover" })
      })
    }));
  });

  it("does not let automatic coaching responses take over the customer chat", async () => {
    const { POST } = await import("./route");
    const res = await POST(signedRequest([{
      type: "message", replyToken: "reply-token", source: { userId: "user-1" },
      message: { type: "text", text: "我想了解 BodyFix 1 對 1 教練課" }
    }]));
    expect(res.status).toBe(200);
    expect(openAiMocks.generateBodyFixReply).not.toHaveBeenCalled();
    expect(lineMocks.replyLineMessage).toHaveBeenCalledWith("reply-token", expect.stringContaining("Gavin 會親自確認"));
  });

  it("does not call OpenAI on new fascia inquiries", async () => {
    const { POST } = await import("./route");
    const res = await POST(signedRequest([{
      type: "message", replyToken: "reply-token", source: { userId: "user-1" },
      message: { type: "text", text: "我肩頸很緊，想了解身體整理" }
    }]));
    expect(res.status).toBe(200);
    expect(openAiMocks.generateBodyFixReply).not.toHaveBeenCalled();
    expect(lineMocks.replyLineMessage).toHaveBeenCalledTimes(1);
  });

  it("continues safely if first-contact CRM and owner notification fail", async () => {
    sheetMocks.upsertCrmRecord.mockRejectedValueOnce(new Error("sheet write failed"));
    lineMocks.notifyGavin.mockRejectedValueOnce(new Error("notify failed"));
    const { POST } = await import("./route");
    const res = await POST(signedRequest([{
      type: "message", replyToken: "reply-token", source: { userId: "user-1" },
      message: { type: "text", text: "需要真人協助" }
    }]));
    expect(res.status).toBe(200);
    expect(lineMocks.replyLineMessage).toHaveBeenCalledWith("reply-token", expect.stringContaining("Gavin"));
    expect(lineMocks.notifyGavin).toHaveBeenCalledTimes(1);
    expect(openAiMocks.generateBodyFixReply).not.toHaveBeenCalled();
  });

  it("stays silent for a heart and does not notify Gavin", async () => {
    const { POST } = await import("./route");
    const res = await POST(signedRequest([{
      type: "message", replyToken: "reply-heart", source: { userId: "user-1" },
      message: { type: "text", text: "❤️" }
    }]));
    expect(res.status).toBe(200);
    expect(lineMocks.replyLineMessage).not.toHaveBeenCalled();
    expect(openAiMocks.generateBodyFixReply).not.toHaveBeenCalled();
    expect(sheetMocks.upsertCrmRecord).not.toHaveBeenCalled();
    expect(sheetMocks.getCrmRecord).not.toHaveBeenCalled();
    expect(lineMocks.notifyGavin).not.toHaveBeenCalled();
  });

  it("does not reply or notify after Gavin has started a manual customer conversation", async () => {
    sheetMocks.getCrmRecord.mockResolvedValueOnce({
      record: { lastUserMessageAt: "2026-11-04T01:00:00+08:00", bookingStage: "waiting_time" },
      rowNumber: 3
    });
    const { POST } = await import("./route");
    const res = await POST(signedRequest([{
      type: "message", replyToken: "manual-reply-token", source: { userId: "user-1" },
      message: { type: "text", text: "六張犁吧🤣" }
    }]));
    expect(res.status).toBe(200);
    expect(lineMocks.replyLineMessage).not.toHaveBeenCalled();
    expect(openAiMocks.generateBodyFixReply).not.toHaveBeenCalled();
    expect(lineMocks.notifyGavin).not.toHaveBeenCalled();
    expect(sheetMocks.recordHumanHandoffMessage).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-1", userMessage: "六張犁吧🤣"
    }));
  });

  it("does not even autoreply to a booking menu message inside an existing manual chat", async () => {
    sheetMocks.getCrmRecord.mockResolvedValueOnce({
      record: { lastUserMessageAt: "2026-11-04T01:00:00+08:00", bookingStage: "human_takeover" },
      rowNumber: 3
    });
    const { POST } = await import("./route");
    const res = await POST(signedRequest([{
      type: "message", replyToken: "manual-menu", source: { userId: "user-1" },
      message: { type: "text", text: "我想預約 BodyFix" }
    }]));
    expect(res.status).toBe(200);
    expect(lineMocks.replyLineMessage).not.toHaveBeenCalled();
    expect(lineMocks.notifyGavin).not.toHaveBeenCalled();
  });

  it("sends the owner a booking-specific alert, not a safety handoff, for message-action booking", async () => {
    const { POST } = await import("./route");
    const res = await POST(signedRequest([{
      type: "message",
      replyToken: "booking-reply",
      source: { userId: "user-1" },
      message: { type: "text", text: "我想預約 BodyFix" }
    }]));

    expect(res.status).toBe(200);
    expect(lineMocks.notifyGavin).toHaveBeenCalledTimes(1);
    const notification = lineMocks.notifyGavin.mock.calls[0][0];
    expect(notification).toContain("新預約詢問");
    expect(notification).toContain("請至官方 LINE 聊天室確認服務");
    expect(notification).not.toContain("安全邊界");
    expect(notification).not.toContain("收尾");
    expect(lineMocks.replyLineMessage).toHaveBeenCalledWith(
      "booking-reply", expect.stringContaining("收到你的預約詢問")
    );
  });

  it("records a direct booking tap, replies with next steps and notifies Gavin", async () => {
    const { POST } = await import("./route");
    const res = await POST(signedRequest([{
      type: "postback",
      webhookEventId: "click-123",
      timestamp: 1793500000000,
      replyToken: "postback-reply",
      source: { userId: "user-1" },
      postback: { data: "action=booking&mode=immediate" }
    }]));
    expect(res.status).toBe(200);
    expect(sheetMocks.recordRichMenuClick).toHaveBeenCalledWith(expect.objectContaining({
      eventId: "click-123",
      action: "booking",
      intent: "booking",
      item: "直接預約"
    }));
    expect(lineMocks.replyLineMessage).toHaveBeenCalledWith(
      "postback-reply", expect.stringContaining("請直接回覆")
    );
    expect(sheetMocks.markRichMenuBookingIntent).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-1", item: "直接預約"
    }));
    expect(lineMocks.notifyGavin).toHaveBeenCalledWith(expect.stringContaining("新預約意願"));
  });

  it("records a booking notice click without creating a sales lead", async () => {
    const { POST } = await import("./route");
    const res = await POST(signedRequest([{
      type: "postback", webhookEventId: "click-124",
      replyToken: "reply", source: { userId: "user-1" },
      postback: { data: "action=booking&mode=notice" }
    }]));
    expect(res.status).toBe(200);
    expect(lineMocks.replyLineMessage).toHaveBeenCalledWith("reply", expect.stringContaining("預約制"));
    expect(sheetMocks.recordRichMenuClick).toHaveBeenCalledWith(expect.objectContaining({ intent: "browse" }));
    expect(sheetMocks.markRichMenuBookingIntent).not.toHaveBeenCalled();
    expect(lineMocks.notifyGavin).not.toHaveBeenCalled();
  });

  it("does not reply or notify when LINE redelivers the same click", async () => {
    sheetMocks.recordRichMenuClick.mockResolvedValueOnce({ saved: false, notify: false, duplicate: true });
    const { POST } = await import("./route");
    const res = await POST(signedRequest([{
      type: "postback", webhookEventId: "click-124",
      replyToken: "reply", source: { userId: "user-1" },
      postback: { data: "action=booking&mode=immediate" }
    }]));
    expect(res.status).toBe(200);
    expect(lineMocks.replyLineMessage).not.toHaveBeenCalled();
    expect(lineMocks.notifyGavin).not.toHaveBeenCalled();
  });

  it("logs repeated booking taps but avoids alerting on every tap", async () => {
    sheetMocks.recordRichMenuClick.mockResolvedValueOnce({ saved: true, notify: false, duplicate: false });
    const { POST } = await import("./route");
    const res = await POST(signedRequest([{
      type: "postback", webhookEventId: "click-125",
      replyToken: "reply", source: { userId: "user-1" },
      postback: { data: "action=booking&mode=this-week" }
    }]));
    expect(res.status).toBe(200);
    expect(lineMocks.replyLineMessage).toHaveBeenCalledWith("reply", expect.stringContaining("本週可約"));
    expect(lineMocks.notifyGavin).not.toHaveBeenCalled();
    expect(sheetMocks.markRichMenuBookingIntent).not.toHaveBeenCalled();
  });

  it("tracks browsing clicks without falsely counting them as bookings", async () => {
    const { POST } = await import("./route");
    const res = await POST(signedRequest([{
      type: "postback", webhookEventId: "click-126",
      replyToken: "reply", source: { userId: "user-1" },
      postback: { data: "action=service&service=pelvic-core" }
    }]));
    expect(res.status).toBe(200);
    expect(sheetMocks.recordRichMenuClick).toHaveBeenCalledWith(expect.objectContaining({
      action: "service", item: "骨盆核心整理", intent: "browse"
    }));
    expect(lineMocks.replyLineMessages).toHaveBeenCalled();
    expect(lineMocks.notifyGavin).not.toHaveBeenCalled();
  });

});
