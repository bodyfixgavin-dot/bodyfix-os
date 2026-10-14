import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REDIRECT_URI = "https://bodyfix-os.vercel.app/api/google/calendar/oauth/callback";

function page(content: string) {
  return new Response(
    [
      "<!doctype html>",
      '<html lang="zh-Hant">',
      "<head>",
      '<meta charset="utf-8" />',
      '<meta name="viewport" content="width=device-width, initial-scale=1" />',
      "<title>BodyFix Google Calendar OAuth</title>",
      "<style>",
      "*{box-sizing:border-box}",
      "body{margin:0;padding:32px 18px;background:#071d2d;color:#f5ead8;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}",
      ".card{max-width:760px;margin:0 auto;background:#0b263a;border:1px solid #c89d59;border-radius:18px;padding:28px}",
      "h1{color:#e8bd78;margin-top:0}",
      "p{line-height:1.7}",
      ".box{padding:16px;border:1px solid #c89d59;border-radius:12px;background:rgba(232,189,120,.08);word-break:break-all}",
      ".warn{padding:16px;border:1px solid #d48b72;border-radius:12px;background:rgba(212,139,114,.10)}",
      "code{color:#e8bd78}",
      "</style>",
      "</head><body><div class=\"card\">",
      content,
      "</div></body></html>"
    ].join(""),
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const error = url.searchParams.get("error");
  if (error) {
    return page("<h1>Google Calendar 授權未完成</h1><div class=\"warn\">" + error + "</div>");
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = req.headers.get("cookie") || "";
  const expected = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("bodyfix_google_oauth_state="))
    ?.split("=")[1];

  if (!code || !state || !expected || state !== expected) {
    return page("<h1>Google Calendar 授權失敗</h1><div class=\"warn\">OAuth state 驗證失敗，請重新從 BodyFix 授權入口開始。</div>");
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return page("<h1>尚未完成 Vercel 設定</h1><div class=\"warn\">GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET 尚未設定。</div>");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code"
    }),
    cache: "no-store"
  });

  if (!tokenRes.ok) {
    return page("<h1>Token 交換失敗</h1><div class=\"warn\">" + (await tokenRes.text()) + "</div>");
  }

  const data = (await tokenRes.json()) as {
    refresh_token?: string;
    access_token?: string;
    expires_in?: number;
    scope?: string;
  };

  if (!data.refresh_token) {
    return page(
      "<h1>已授權，但沒有取得 refresh token</h1>" +
      "<p>請重新從授權入口操作一次；系統會使用 <code>prompt=consent</code> 要求 Google 再次提供長期授權。</p>"
    );
  }

  return page(
    "<h1>Google Calendar 已授權 ✅</h1>" +
    "<p>下一步：把下面這段值直接貼到 Vercel 的 <code>GOOGLE_OAUTH_REFRESH_TOKEN</code>。<strong>不要貼到聊天室。</strong></p>" +
    '<div class="box"><code>' + data.refresh_token + "</code></div>" +
    "<p>完成後就可以關閉這個頁面。</p>"
  );
}
