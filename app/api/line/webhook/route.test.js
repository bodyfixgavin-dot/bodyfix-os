import { beforeEach, describe, expect, it, vi } from "vitest";

const lineMocks = vi.hoisted(() => ({
  getLineDisplayName: vi.fn(),
  notifyGavin: vi.fn(),
  replyLineMessage: vi.fn(),
  verifyLineSignature: vi.fn()
}));

const sheetMocks = vi.hoisted(() => ({
  createWelcomeRecord: vi.fn(),
  ensureSheetHeaders: vi.fn(),
  getCrmRecord: vi.fn(),
  upsertCrmRecord: vi.fn()
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
    lineMocks.notifyGavin.mockResolvedValue(undefined);
    sheetMocks.ensureSheetHeaders.mockResolvedValue(undefined);
    sheetMocks.getCrmRecord.mockResolvedValue(null);
    sheetMocks.upsertCrmRecord.mockResolvedValue({ displayName: "Gavin Test" });
    sheetMocks.createWelcomeRecord.mockResolvedValue(undefined);
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
});
