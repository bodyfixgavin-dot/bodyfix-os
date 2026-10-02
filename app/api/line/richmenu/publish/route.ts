import { NextResponse } from "next/server";

export const runtime = "nodejs";

const LINE_API_BASE = "https://api.line.me/v2/bot";
const TARGET_ALIAS = "bodyfix-a";

function isProduction() {
  return process.env.VERCEL_ENV === "production";
}

function getLineToken() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  return token;
}

function lineHeaders(extra?: Record<string,string>) {
  return {
    Authorization: "Bearer " + getLineToken(),
    ...extra
  };
}

async function readJson(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

function page(content: string) {
  return new Response(
    [
      "<!doctype html>",
      '<html lang="zh-Hant">',
      "<head>",
      '<meta charset="utf-8" />',
      '<meta name="viewport" content="width=device-width, initial-scale=1" />',
      "<title>BodyFix Rich Menu Publish</title>",
      "<style>",
      "*{box-sizing:border-box}",
      "body{margin:0;padding:36px 18px;background:#071d2d;color:#f5ead8;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}",
      ".card{max-width:680px;margin:0 auto;padding:28px;background:#0b263a;border:1px solid #c89d59;border-radius:18px}",
      "h1{margin-top:0;color:#e8bd78}",
      "p{line-height:1.7}",
      ".note{font-size:14px;opacity:.82}",
      ".ok{padding:14px;border:1px solid #c89d59;border-radius:12px;background:rgba(232,189,120,.12);margin:16px 0}",
      ".warn{padding:14px;border:1px solid #d48b72;border-radius:12px;background:rgba(212,139,114,.10);margin:16px 0}",
      "button{width:100%;margin-top:18px;padding:14px 18px;border:0;border-radius:999px;background:#e8bd78;color:#071d2d;font-size:16px;font-weight:800;cursor:pointer}",
      "code{color:#e8bd78;word-break:break-all}",
      "</style>",
      "</head><body><div class=\"card\">",
      content,
      "</div></body></html>"
    ].join(""),
    { headers: { "Content-Type":"text/html; charset=utf-8", "Cache-Control":"no-store" } }
  );
}

async function getAliasRichMenuId() {
  const res = await fetch(
    LINE_API_BASE + "/richmenu/alias/" + encodeURIComponent(TARGET_ALIAS),
    { headers: lineHeaders() }
  );
  if (!res.ok) {
    throw new Error("找不到 " + TARGET_ALIAS + "：" + JSON.stringify(await readJson(res)));
  }
  const data = await readJson(res) as { richMenuId?: string };
  if (!data.richMenuId) throw new Error("Alias 沒有回傳 richMenuId");
  return data.richMenuId;
}

async function getCurrentDefaultId() {
  const res = await fetch(LINE_API_BASE + "/user/all/richmenu", {
    headers: lineHeaders()
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error("無法讀取目前預設 Rich Menu：" + JSON.stringify(await readJson(res)));
  }
  const data = await readJson(res) as { richMenuId?: string };
  return data.richMenuId || null;
}

async function setDefaultRichMenu(richMenuId: string) {
  const res = await fetch(
    LINE_API_BASE + "/user/all/richmenu/" + encodeURIComponent(richMenuId),
    { method:"POST", headers: lineHeaders() }
  );
  if (!res.ok) {
    throw new Error("設定預設 Rich Menu 失敗：" + JSON.stringify(await readJson(res)));
  }
}

export async function GET() {
  if (isProduction()) {
    return page('<h1>BodyFix｜公開 Rich Menu</h1><div class="warn">此工具不能在 Production 執行。</div>');
  }

  try {
    const [currentId, targetId] = await Promise.all([
      getCurrentDefaultId(),
      getAliasRichMenuId()
    ]);

    return page(
      "<h1>BodyFix｜公開新版 ABC</h1>" +
      "<p>把 <strong>A｜服務・價格</strong> 設成所有好友的預設 Rich Menu。A 頁上的 Tab 可切換到 B／C。</p>" +
      '<div class="ok">新版 A ID：<br><code>' + targetId + "</code></div>" +
      '<p class="note">目前預設 ID：<br><code>' + (currentId || "目前沒有預設 Rich Menu") + "</code></p>" +
      '<div class="warn">這會影響所有好友。現階段 postback 會先顯示客戶點擊的文字；完整 Flex／Google Calendar 可再逐步補上。</div>' +
      '<form method="POST">' +
      '<input type="hidden" name="action" value="publish" />' +
      '<input type="hidden" name="previousId" value="' + (currentId || "") + '" />' +
      '<button type="submit">正式公開新版 ABC 給所有好友</button>' +
      "</form>"
    );
  } catch (error) {
    return page(
      '<h1>BodyFix｜公開 Rich Menu</h1><div class="warn">發生錯誤：' +
      (error instanceof Error ? error.message : String(error)) +
      "</div>"
    );
  }
}

export async function POST(req: Request) {
  if (isProduction()) {
    return NextResponse.json({ ok:false, error:"Disabled in production" }, { status:403 });
  }

  try {
    const form = await req.formData();
    const action = String(form.get("action") || "");
    const previousId = String(form.get("previousId") || "");

    if (action !== "publish") {
      throw new Error("未知操作");
    }

    const targetId = await getAliasRichMenuId();
    await setDefaultRichMenu(targetId);

    return page(
      "<h1>BodyFix｜已公開 ✅</h1>" +
      '<div class="ok">新版 ABC 已正式開放給所有好友。<br><br>預設頁：<strong>A｜服務・價格</strong></div>' +
      "<p>所有沒有個人指定 Rich Menu 的好友，現在會看到新版 A，並可切換 B／C。</p>" +
      '<p class="note">切換前預設 ID：<br><code>' + (previousId || "無") + "</code></p>"
    );
  } catch (error) {
    return page(
      '<h1>BodyFix｜公開 Rich Menu</h1><div class="warn">發生錯誤：' +
      (error instanceof Error ? error.message : String(error)) +
      "</div>"
    );
  }
}
