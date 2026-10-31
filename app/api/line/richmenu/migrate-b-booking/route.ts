import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";
import { convertBBookingActions, type MenuArea } from "@/lib/bodyfix-ai/richmenu-b-migration";

export const runtime = "nodejs";

const API = "https://api.line.me/v2/bot";
const DATA_API = "https://api-data.line.me/v2/bot";
const ALIAS = "bodyfix-b";

function allowed() {
  // A/B/C admin operations must never be exposed on production.
  return process.env.VERCEL_ENV === "preview";
}

async function authorized() {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value);
}

function page(title: string, details: string) {
  return new Response(
    '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8" />' +
      '<meta name="viewport" content="width=device-width,initial-scale=1" />' +
      '<title>BodyFix｜B 頁預約修正</title><style>' +
      '*{box-sizing:border-box}body{background:#0b1d34;color:#f4efe7;padding:24px 15px;' +
      'font-family:system-ui,-apple-system,sans-serif}main{max-width:720px;margin:auto;' +
      'border:1px solid #c9b59a;padding:24px;border-radius:16px}h1{color:#e3ba80}' +
      'p{line-height:1.8}button{background:#d5ad73;border:0;border-radius:14px;' +
      'padding:16px 20px;font-size:17px;font-weight:700;color:#0b1d34;width:100%}' +
      'code{word-break:break-all;color:#e3ba80}</style></head><body><main>' +
      '<h1>' + title + '</h1>' + details + '</main></body></html>',
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );
}

function safe(value: unknown) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function headers(extra: Record<string, string> = {}) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN 未設定");
  return { Authorization: "Bearer " + token, ...extra };
}

async function checked(res: Response, name: string) {
  if (!res.ok) throw new Error(name + "失敗：" + res.status + " " + (await res.text()).slice(0, 350));
  return res;
}

type Menu = {
  size: { width: number; height: number };
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: MenuArea[];
};

export async function GET() {
  if (!allowed()) return page("不提供此功能", "<p>僅能從受保護的 Vercel Preview 環境操作。</p>");
  if (!(await authorized())) return page("需要登入", '<p>請先登入 BodyFix OS 管理後台，再回到這個頁面操作。</p><p><a href="/admin">前往管理登入</a></p>');
  return page("BodyFix｜只修 B 頁兩個預約按鈕",
    "<p><strong>不更換圖片，不碰 A、C 頁。</strong>直接從 LINE 讀取目前 B 頁原始圖片與所有熱區；" +
    "只把「立即預約」及「本週可約時段」從 postback 改成真正傳送文字訊息。</p>" +
    "<p>其餘工作室介紹、預約須知與 A／C 切換全部保持不變。按鈕按下後，客人的真實訊息才會出現在官方聊天室。</p>" +
    '<form method="POST"><input type="hidden" name="confirm" value="YES_CHANGE_B" />' +
    '<button type="submit">確認只更新 B 頁預約按鈕</button></form>' +
    "<p>系統會保留舊 Rich Menu ID 供必要時復原。這個功能只執行一次，若已更新不會重複新增。</p>");
}

export async function POST(req: Request) {
  if (!allowed()) return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
  if (!(await authorized())) return NextResponse.json({ error: "Admin login required" }, { status: 401 });

  // No cross-origin POSTs: the owner must explicitly submit from the preview page.
  const origin = req.headers.get("origin");
  if (!origin || origin !== new URL(req.url).origin) {
    return NextResponse.json({ error: "Origin mismatch" }, { status: 403 });
  }
  const form = await req.formData();
  if (form.get("confirm") !== "YES_CHANGE_B") {
    return NextResponse.json({ error: "Not confirmed" }, { status: 400 });
  }
  let newId = "";
  let aliasUpdated = false;
  try {
    const aliasRes = await checked(await fetch(API + "/richmenu/alias/" + ALIAS, { headers: headers(), cache: "no-store" }), "讀取 B Alias");
    const { richMenuId: oldId } = (await aliasRes.json()) as { richMenuId: string };
    if (!oldId) throw new Error("找不到原 B Rich Menu ID");

    const menuRes = await checked(await fetch(API + "/richmenu/" + encodeURIComponent(oldId), { headers: headers(), cache: "no-store" }), "取得 B 設定");
    const oldMenu = (await menuRes.json()) as Menu;
    if (oldMenu.size?.width !== 2500 || oldMenu.size?.height !== 1686 || !Array.isArray(oldMenu.areas)) {
      throw new Error("B 頁版型與預期不符，已停止更新");
    }
    const areas = convertBBookingActions(oldMenu.areas);

    const imageRes = await checked(await fetch(
      DATA_API + "/richmenu/" + encodeURIComponent(oldId) + "/content",
      { headers: headers(), cache: "no-store" }
    ), "讀取原 B 圖片");
    const bytes = Buffer.from(await imageRes.arrayBuffer());
    const mime = imageRes.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
    if (!["image/png", "image/jpeg"].includes(mime) || bytes.length < 1000 || bytes.length > 1_000_000) {
      throw new Error("原 B 圖片格式或大小不符合 LINE 上傳規格");
    }

    const create = await checked(await fetch(API + "/richmenu", {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        size: oldMenu.size,
        selected: oldMenu.selected,
        name: "BodyFix B｜預約・據點（可見訊息版）",
        chatBarText: oldMenu.chatBarText,
        areas
      })
    }), "建立新 B");
    newId = ((await create.json()) as { richMenuId: string }).richMenuId;
    if (!newId) throw new Error("建立新 B 後沒有回傳 ID");
    await checked(await fetch(
      DATA_API + "/richmenu/" + encodeURIComponent(newId) + "/content",
      { method: "POST", headers: headers({ "Content-Type": mime }), body: bytes }
    ), "複製 B 原圖");
    await checked(await fetch(API + "/richmenu/alias/" + ALIAS, {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ richMenuId: newId })
    }), "切換 B Alias");
    aliasUpdated = true;
    return page("B 預約按鈕已更新 ✅",
      "<p>保留原始 B 圖片與其他所有熱區。現在點「立即預約／本週可約時段」會傳送真正的文字訊息。</p>" +
      "<p>Alias：<code>" + ALIAS + "</code></p>" +
      "<p>原 B ID（復原用）：<code>" + safe(oldId) + "</code></p>" +
      "<p>新 B ID：<code>" + safe(newId) + "</code></p>" +
      "<p>請回 LINE 切到 A 再切回 B，用一般 LINE 點一次「立即預約」，確認官方後台聊天列表更新。</p>");
  } catch (error) {
    if (newId && !aliasUpdated) {
      try {
        await fetch(API + "/richmenu/" + encodeURIComponent(newId), {
          method: "DELETE", headers: headers()
        });
      } catch { /* preserve original error */ }
    }
    return page("B 頁未能完成更新",
      "<p>" + safe(error instanceof Error ? error.message : String(error)) +
      "</p><p>請不要連續提交；先檢查錯誤訊息。原有 A／B／C 未被主動修改。</p>");
  }
}
