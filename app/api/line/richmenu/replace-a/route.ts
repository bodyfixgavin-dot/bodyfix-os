import { NextResponse } from "next/server";

export const runtime = "nodejs";

const LINE_API_BASE = "https://api.line.me/v2/bot";
const LINE_DATA_API_BASE = "https://api-data.line.me/v2/bot";
const ALIAS = "bodyfix-a";
const ACCESS_KEY = "gavin-a-20261005-8f3c";
const EXPECTED_WIDTH = 2500;
const EXPECTED_HEIGHT = 1686;

function isProduction() {
  return process.env.VERCEL_ENV === "production";
}

function getLineToken() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  return token;
}

function headers(extra?: Record<string, string>) {
  return {
    Authorization: `Bearer ${getLineToken()}`,
    ...extra
  };
}

async function readJson(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function page(content: string, status = 200) {
  return new Response(
    `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>BodyFix A 圖片替換</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:28px 16px;background:#071d2d;color:#f7ecda;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.card{max-width:680px;margin:auto;background:#0b263a;border:1px solid #c89d59;border-radius:18px;padding:24px}
h1{margin:0 0 14px;color:#e8bd78}p{line-height:1.65}.ok,.warn{padding:14px;border-radius:12px;margin:16px 0}.ok{border:1px solid #c89d59;background:#183647}.warn{border:1px solid #d48b72;background:#342b2b}
input[type=file]{width:100%;padding:14px 0}button{width:100%;padding:14px;border:0;border-radius:999px;background:#e8bd78;color:#071d2d;font-weight:800;font-size:16px}
code{word-break:break-all;color:#e8bd78}.small{font-size:13px;opacity:.78}
</style></head><body><div class="card">${content}</div></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );
}

function validKey(url: string) {
  return new URL(url).searchParams.get("key") === ACCESS_KEY;
}

async function getAliasTarget() {
  const res = await fetch(`${LINE_API_BASE}/richmenu/alias/${encodeURIComponent(ALIAS)}`, {
    headers: headers()
  });
  if (!res.ok) throw new Error("找不到 A Alias：" + JSON.stringify(await readJson(res)));
  const data = (await readJson(res)) as { richMenuId?: string };
  if (!data.richMenuId) throw new Error("A Alias 沒有 richMenuId");
  return data.richMenuId;
}

async function getRichMenu(id: string) {
  const res = await fetch(`${LINE_API_BASE}/richmenu/${encodeURIComponent(id)}`, {
    headers: headers()
  });
  if (!res.ok) throw new Error("讀取原 A 失敗：" + JSON.stringify(await readJson(res)));
  return (await readJson(res)) as {
    size: { width: number; height: number };
    selected: boolean;
    name: string;
    chatBarText: string;
    areas: unknown[];
  };
}

async function createClone(original: {
  size: { width: number; height: number };
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: unknown[];
}) {
  const res = await fetch(`${LINE_API_BASE}/richmenu`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      size: original.size,
      selected: original.selected,
      name: original.name,
      chatBarText: original.chatBarText,
      areas: original.areas
    })
  });
  if (!res.ok) throw new Error("建立 A 複本失敗：" + JSON.stringify(await readJson(res)));
  const data = (await readJson(res)) as { richMenuId?: string };
  if (!data.richMenuId) throw new Error("新 A 沒有 richMenuId");
  return data.richMenuId;
}

async function uploadImage(id: string, image: File) {
  const res = await fetch(`${LINE_DATA_API_BASE}/richmenu/${encodeURIComponent(id)}/content`, {
    method: "POST",
    headers: headers({ "Content-Type": image.type }),
    body: Buffer.from(await image.arrayBuffer())
  });
  if (!res.ok) throw new Error("上傳新 A 圖片失敗：" + JSON.stringify(await readJson(res)));
}

async function updateAlias(id: string) {
  const res = await fetch(`${LINE_API_BASE}/richmenu/alias/${encodeURIComponent(ALIAS)}`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ richMenuId: id })
  });
  if (!res.ok) throw new Error("更新 A Alias 失敗：" + JSON.stringify(await readJson(res)));
}

async function setDefault(id: string) {
  const res = await fetch(`${LINE_API_BASE}/user/all/richmenu/${encodeURIComponent(id)}`, {
    method: "POST",
    headers: headers()
  });
  if (!res.ok) throw new Error("發布新版 A 失敗：" + JSON.stringify(await readJson(res)));
}

async function keepGavinOnNewA(oldId: string, newId: string) {
  const userId = process.env.GAVIN_LINE_USER_ID;
  if (!userId) return false;

  const currentRes = await fetch(`${LINE_API_BASE}/user/${encodeURIComponent(userId)}/richmenu`, {
    headers: headers()
  });
  if (!currentRes.ok) return false;

  const current = (await readJson(currentRes)) as { richMenuId?: string };
  if (current.richMenuId !== oldId) return false;

  const linkRes = await fetch(
    `${LINE_API_BASE}/user/${encodeURIComponent(userId)}/richmenu/${encodeURIComponent(newId)}`,
    { method: "POST", headers: headers() }
  );
  return linkRes.ok;
}

export async function GET(req: Request) {
  if (isProduction()) return page("<h1>BodyFix A 圖片替換</h1><div class='warn'>Production 不開放此工具。</div>", 403);
  if (!validKey(req.url)) return page("<h1>BodyFix A 圖片替換</h1><div class='warn'>連結無效。</div>", 403);

  try {
    const oldId = await getAliasTarget();
    const original = await getRichMenu(oldId);

    return page(
      `<h1>只替換 A｜服務・價格</h1>
<p>這個工具會<strong>完整複製目前 A 的所有熱區與 action</strong>，只換背景圖片。B、C 不會修改。</p>
<div class="ok">目前 A：<br><code>${oldId}</code><br>熱區數：<strong>${original.areas.length}</strong><br>座標尺寸：<strong>${original.size.width} × ${original.size.height}</strong></div>
<form method="POST" enctype="multipart/form-data" action="?key=${ACCESS_KEY}">
<input type="file" name="image" accept="image/jpeg,image/png" required>
<button type="submit">替換 A 圖片並立即發布</button>
</form>
<p class="small">建議使用已準備好的 ${EXPECTED_WIDTH} × ${EXPECTED_HEIGHT} JPG。LINE 單張上限 1 MB。</p>`
    );
  } catch (error) {
    return page(`<h1>BodyFix A 圖片替換</h1><div class="warn">${error instanceof Error ? error.message : String(error)}</div>`, 500);
  }
}

export async function POST(req: Request) {
  if (isProduction()) return NextResponse.json({ ok: false, error: "disabled in production" }, { status: 403 });
  if (!validKey(req.url)) return NextResponse.json({ ok: false, error: "invalid link" }, { status: 403 });

  let newId: string | null = null;

  try {
    const form = await req.formData();
    const value = form.get("image");
    if (!(value instanceof File)) throw new Error("請選擇圖片");
    if (!["image/jpeg", "image/png"].includes(value.type)) throw new Error("圖片必須是 JPG 或 PNG");
    if (value.size > 1_000_000) throw new Error("圖片必須小於 1 MB");

    const oldId = await getAliasTarget();
    const original = await getRichMenu(oldId);

    if (original.size.width !== EXPECTED_WIDTH || original.size.height !== EXPECTED_HEIGHT) {
      throw new Error(`原 A 座標尺寸不是 ${EXPECTED_WIDTH} × ${EXPECTED_HEIGHT}，已停止避免熱區位移。`);
    }

    newId = await createClone(original);
    await uploadImage(newId, value);

    const clone = await getRichMenu(newId);
    const sameAreas = JSON.stringify(original.areas) === JSON.stringify(clone.areas);
    const sameSize =
      original.size.width === clone.size.width &&
      original.size.height === clone.size.height;

    if (!sameAreas || !sameSize) {
      throw new Error("新 A 的熱區或尺寸與原 A 不一致，已停止發布");
    }

    await updateAlias(newId);
    await setDefault(newId);
    const gavinRelinked = await keepGavinOnNewA(oldId, newId);

    return page(
      `<h1>新版 A 已發布 ✅</h1>
<div class="ok">
圖片已替換。<br>
A 熱區：<strong>${clone.areas.length} 個，完全一致</strong><br>
座標尺寸：<strong>${clone.size.width} × ${clone.size.height}</strong><br>
B／C：<strong>未修改</strong>
</div>
<p>舊 A：<br><code>${oldId}</code></p>
<p>新 A：<br><code>${newId}</code></p>
<p class="small">Gavin 個人指定選單同步：${gavinRelinked ? "已更新" : "不需更新／未設定個人選單"}。</p>`
    );
  } catch (error) {
    if (newId) {
      try {
        await fetch(`${LINE_API_BASE}/richmenu/${encodeURIComponent(newId)}`, {
          method: "DELETE",
          headers: headers()
        });
      } catch {}
    }

    return page(
      `<h1>替換未完成</h1><div class="warn">${error instanceof Error ? error.message : String(error)}</div><p>原 A、B、C 都保持不變。</p>`,
      500
    );
  }
}
