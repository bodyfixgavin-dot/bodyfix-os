import { createHmac } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sheetMocks = vi.hoisted(() => ({
  createWelcomeRecord: vi.fn(),
  ensureSheetHeaders: vi.fn(),
  getCrmRecord: vi.fn(),
  upsertCrmRecord: vi.fn()
}));

const openAiMocks = vi.hoisted(() => ({
  generateBodyFixReply: vi.fn()
}));

vi.mock("@/lib/bodyfix-ai/sheets", () => sheetMocks);
vi.mock("@/lib/bodyfix-ai/openai", () => openAiMocks);
vi.mock("@/lib/bodyfix-ai/prompt", () => ({ WELCOME_REPLY: "歡迎訊息" }));

const legacySecret = "legacy-secret-for-tests";
const legacyToken = "legacy-token-for-tests";

function signedRequest(events) {
  const body = JSON.stringify({ events });
  const signature = createHmac("sha256", legacySecret).update(body).digest("base64");

  return new Request("https://example.test/api/line/legacy-webhook", {
    method: "POST",
    headers: { "x-line-signature": signature },
    body
  });
}

describe("legacy LINE webhook", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.LINE_CHANNEL_SECRET;
    delete process.env.LINE_CHANNEL_ACCESS_TOKEN;
    process.env.LINE_LEGACY_CHANNEL_SECRET = legacySecret;
    process.env.LINE_LEGACY_CHANNEL_ACCESS_TOKEN = legacyToken;
    delete process.env.GAVIN_LINE_USER_ID;

    global.fetch = vi.fn(async (url) => {
      if (String(url).includes("/profile/")) {
        return Response.json({ displayName: "Legacy User" });
      }
      return Response.json({ ok: true });
    });

    sheetMocks.ensureSheetHeaders.mockResolvedValue(undefined);
    sheetMocks.getCrmRecord.mockResolvedValue(null);
    sheetMocks.upsertCrmRecord.mockResolvedValue({ displayName: "Legacy User" });
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

  it("verifies requests with the legacy secret", async () => {
    const { POST } = await import("./route");

    const res = await POST(signedRequest([
      {
        type: "message",
        replyToken: "reply-token",
        source: { userId: "legacy-user-1" },
        message: { type: "text", text: "我肩頸很緊" }
      }
    ]));

    expect(res.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.line.me/v2/bot/message/reply",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${legacyToken}` })
      })
    );
  });

  it("returns 200 for signed empty events without touching downstream services", async () => {
    const { POST } = await import("./route");

    const res = await POST(signedRequest([]));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(sheetMocks.ensureSheetHeaders).not.toHaveBeenCalled();
    expect(openAiMocks.generateBodyFixReply).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("uses the fixed coaching reply without OpenAI for one-on-one coaching inquiries", async () => {
    const { POST } = await import("./route");

    const res = await POST(signedRequest([
      {
        type: "message",
        replyToken: "reply-token",
        source: { userId: "legacy-user-1" },
        message: { type: "text", text: "我想了解 BodyFix 1 對 1 教練課" }
      }
    ]));

    const fixedReply = "有的，BodyFix 提供一對一動作整合訓練。課程會依你目前的身體狀態、動作經驗與目標安排，也會留意代償、張力分工與過往不適，不只是帶你把動作做完。你可以先告訴我：目前想改善的目標、平常運動頻率，以及方便的地點與時間。";
    const replyCall = global.fetch.mock.calls.find(([url]) => String(url).includes("/message/reply"));
    expect(res.status).toBe(200);
    expect(openAiMocks.generateBodyFixReply).not.toHaveBeenCalled();
    expect(replyCall[1].body).toContain(fixedReply);
    expect(replyCall[1].body).not.toContain("不包含教練課");
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
        source: { userId: "legacy-user-1" },
        message: { type: "text", text: "我肩頸很緊，想了解身體整理" }
      }
    ]));

    expect(res.status).toBe(200);
    expect(openAiMocks.generateBodyFixReply).toHaveBeenCalledWith("我肩頸很緊，想了解身體整理", undefined);
  });

  it("uses the fallback reply when OpenAI fails", async () => {
    openAiMocks.generateBodyFixReply.mockRejectedValueOnce(new Error("OpenAI unavailable"));
    const { POST } = await import("./route");

    const res = await POST(signedRequest([
      {
        type: "message",
        replyToken: "reply-token",
        source: { userId: "legacy-user-1" },
        message: { type: "text", text: "我肩頸很緊" }
      }
    ]));

    expect(res.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.line.me/v2/bot/message/reply",
      expect.objectContaining({
        body: expect.stringContaining("收到你的訊息。目前自動接待暫時無法完成判讀")
      })
    );
    expect(sheetMocks.upsertCrmRecord).toHaveBeenCalled();
  });
});
