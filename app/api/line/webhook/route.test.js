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

  it("sends the fallback reply when OpenAI fails", async () => {
    openAiMocks.generateBodyFixReply.mockRejectedValueOnce(new Error("OpenAI unavailable"));
    const { POST } = await import("./route");

    const res = await POST(signedRequest([
      {
        type: "message",
        replyToken: "reply-token",
        source: { userId: "user-1" },
        message: { type: "text", text: "我肩頸很緊" }
      }
    ]));

    expect(res.status).toBe(200);
    expect(lineMocks.replyLineMessage).toHaveBeenCalledWith(
      "reply-token",
      "收到你的訊息。目前自動接待暫時無法完成判讀，我已保留你的需求。你可以直接留下想處理的狀況、方便地點與時間，Gavin 會在工作空檔親自確認。"
    );
    expect(sheetMocks.upsertCrmRecord).toHaveBeenCalled();
  });

  it("uses the fixed coaching reply without OpenAI for one-on-one coaching inquiries", async () => {
    const { POST } = await import("./route");

    const res = await POST(signedRequest([
      {
        type: "message",
        replyToken: "reply-token",
        source: { userId: "user-1" },
        message: { type: "text", text: "我想了解 BodyFix 1 對 1 教練課" }
      }
    ]));

    const fixedReply = "有的，BodyFix 提供一對一動作整合訓練。課程會依你目前的身體狀態、動作經驗與目標安排，也會留意代償、張力分工與過往不適，不只是帶你把動作做完。你可以先告訴我：目前想改善的目標、平常運動頻率，以及方便的地點與時間。";
    expect(res.status).toBe(200);
    expect(openAiMocks.generateBodyFixReply).not.toHaveBeenCalled();
    expect(lineMocks.replyLineMessage).toHaveBeenCalledWith("reply-token", fixedReply);
    expect(lineMocks.replyLineMessage.mock.calls[0][1]).not.toContain("不包含教練課");
    expect(sheetMocks.upsertCrmRecord).toHaveBeenCalledWith(expect.objectContaining({
      aiResult: expect.objectContaining({
        classification: expect.objectContaining({ intent: "coaching" })
      })
    }));
  });

  it("keeps body reset inquiries on the OpenAI flow", async () => {
    const { POST } = await import("./route");

    const res = await POST(signedRequest([
      {
        type: "message",
        replyToken: "reply-token",
        source: { userId: "user-1" },
        message: { type: "text", text: "我肩頸很緊，想了解身體整理" }
      }
    ]));

    expect(res.status).toBe(200);
    expect(openAiMocks.generateBodyFixReply).toHaveBeenCalledWith("我肩頸很緊，想了解身體整理", undefined);
    expect(lineMocks.replyLineMessage).toHaveBeenCalledWith("reply-token", "正常 AI 回覆");
  });

  it("returns 200 when Sheet write and Gavin notification fail", async () => {
    sheetMocks.upsertCrmRecord.mockRejectedValueOnce(new Error("sheet write failed"));
    lineMocks.notifyGavin.mockRejectedValueOnce(new Error("notify failed"));
    openAiMocks.generateBodyFixReply.mockResolvedValueOnce({
      replyText: "我請 Gavin 協助確認。",
      classification: {
        intent: "unclear",
        leadTemperature: "C",
        bookingStage: "human_takeover",
        preferredService: "unknown",
        needHuman: true,
        bodyIssue: "",
        bodyArea: "",
        preferredLocation: "",
        preferredTime: "",
        nextAction: "human_takeover",
        notes: ""
      }
    });
    const { POST } = await import("./route");

    const res = await POST(signedRequest([
      {
        type: "message",
        replyToken: "reply-token",
        source: { userId: "user-1" },
        message: { type: "text", text: "需要真人協助" }
      }
    ]));

    expect(res.status).toBe(200);
    expect(lineMocks.replyLineMessage).toHaveBeenCalledWith("reply-token", "我請 Gavin 協助確認。");
    expect(sheetMocks.upsertCrmRecord).toHaveBeenCalled();
    expect(lineMocks.notifyGavin).toHaveBeenCalled();
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
