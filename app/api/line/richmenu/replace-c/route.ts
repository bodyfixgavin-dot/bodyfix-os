import { NextResponse } from "next/server";

export const runtime = "nodejs";

const LINE_API_BASE = "https://api.line.me/v2/bot";
const LINE_DATA_API_BASE = "https://api-data.line.me/v2/bot";
const WIDTH = 2500;
const HEIGHT = 1686;
const ALIAS = "bodyfix-c";

function isProduction() {
  return process.env.VERCEL_ENV === "production";
}

function getLineToken() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  return token;
}

function lineHeaders(extra?: Record<string, string>) {
  return { Authorization: "Bearer " + getLineToken(), ...extra };
}

async function readLineResponse(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

function richMenuSwitch(bounds: any, label: string, alias: string) {
  return {
    bounds,
    action: {
      type: "richmenuswitch",
      label,
      richMenuAliasId: alias,
      data: "richmenu=" + alias
    }
  };
}

function postback(bounds: any, label: string, data: string, displayText: string) {
  return {
    bounds,
    action: { type: "postback", label, data, displayText }
  };
}

function uri(bounds: any, label: string, target: string) {
  return { bounds, action: { type: "uri", label, uri: target } };
}

const TAB_A = { x: 0, y: 0, width: 833, height: 165 };
const TAB_B = { x: 833, y: 0, width: 834, height: 165 };

/*
 * C v2 layout (2500 x 1686)
 * New artwork changed the tile positions, so these bounds are deliberately
 * remapped to the visible cards instead of copying the legacy C coordinates.
 */
const C_AREAS = [
  richMenuSwitch(TAB_A, "服務・價格", "bodyfix-a"),
  richMenuSwitch(TAB_B, "預約・據點", "bodyfix-b"),

  postback(
    { x: 40, y: 440, width: 842, height: 1070 },
    "認識 Gavin",
    "action=content&content=gavin",
    "我想認識 Gavin"
  ),
  postback(
    { x: 900, y: 440, width: 730, height: 510 },
    "第一次來",
    "action=content&content=first-visit",
    "我想看第一次來流程"
  ),
  postback(
    { x: 1640, y: 440, width: 775, height: 510 },
    "客人回饋",
    "action=content&content=reviews",
    "我想看客人回饋"
  ),
  postback(
    { x: 900, y: 955, width: 730, height: 555 },
    "常見問題 FAQ",
    "action=content&content=faq",
    "我想看常見問題"
  ),
  uri(
    { x: 1640, y: 955, width: 775, height: 340 },
    "IG / 作品",
    "https://www.instagram.com/bodyfixgavin/"
  ),
  uri(
    { x: 1640, y: 1305, width: 775, height: 205 },
    "官方網站",
    "https://bodyfix-os.vercel.app/"
  )
];

function page(content: string) {
  return new Response(
    [
      "<!doctype html>",
      '<html lang="zh-Hant">',
      "<head>",
      '<meta charset="utf-8" />',
      '<meta name="viewport" content="width=device-width, initial-scale=1" />',
      "<title>BodyFix C 更新</title>",
      "<style>",
      "*{box-sizing:border-box}",
      "body{margin:0;padding:36px 18px;background:#071d2d;color:#f5ead8;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}",
      ".card{max-width:720px;margin:0 auto;padding:28px;background:#0b263a;border:1px solid #c89d59;border-radius:18px}",
      "h1{margin-top:0;color:#e8bd78}",
      "p{line-height:1.7}",
      ".ok,.warn{padding:14px;border-radius:12px;margin:16px 0}",
      ".ok{border:1px solid #c89d59;background:rgba(232,189,120,.12)}",
      ".warn{border:1px solid #d48b72;background:rgba(212,139,114,.10)}",
      "input{width:100%;margin:12px 0}",
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

function validateImage(value: any) {
  if (!(value instanceof File)) throw new Error("請選擇 C 圖片。");
  if (!["image/png", "image/jpeg"].includes(value.type)) throw new Error("圖片必須是 PNG 或 JPEG。");
  if (value.size > 1_000_000) throw new Error("圖片超過 1 MB，請使用已壓縮的 2500 × 1686 版本。");
  return value;
}

async function createRichMenu(image: File) {
  const createRes = await fetch(LINE_API_BASE + "/richmenu", {
    method: "POST",
    headers: lineHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      size: { width: WIDTH, height: HEIGHT },
      selected: true,
      name: "BodyFix C｜更多",
      chatBarText: "BodyFix 選單",
      areas: C_AREAS
    })
  });

  if (!createRes.ok) throw new Error("C 建立失敗：" + JSON.stringify(await readLineResponse(createRes)));
  const data: any = await readLineResponse(createRes);
  const richMenuId = data.richMenuId;
  if (!richMenuId) throw new Error("C 未取得 richMenuId。");

  const uploadRes = await fetch(
    LINE_DATA_API_BASE + "/richmenu/" + richMenuId + "/content",
    {
      method: "POST",
      headers: lineHeaders({ "Content-Type": image.type }),
      body: Buffer.from(await image.arrayBuffer())
    }
  );

  if (!uploadRes.ok) {
    const err = await readLineResponse(uploadRes);
    await fetch(LINE_API_BASE + "/richmenu/" + richMenuId, { method:"DELETE", headers:lineHeaders() });
    throw new Error("C 圖片上傳失敗：" + JSON.stringify(err));
  }
  return richMenuId;
}

async function upsertAlias(richMenuId: string) {
  const lookupRes = await fetch(
    LINE_API_BASE + "/richmenu/alias/" + encodeURIComponent(ALIAS),
    { headers: lineHeaders() }
  );

  if (lookupRes.ok) {
    const updateRes = await fetch(
      LINE_API_BASE + "/richmenu/alias/" + encodeURIComponent(ALIAS),
      {
        method: "POST",
        headers: lineHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ richMenuId })
      }
    );
    if (!updateRes.ok) throw new Error("C Alias 更新失敗：" + JSON.stringify(await readLineResponse(updateRes)));
    return;
  }

  if (lookupRes.status !== 404) throw new Error("C Alias 查詢失敗：" + JSON.stringify(await readLineResponse(lookupRes)));

  const createRes = await fetch(LINE_API_BASE + "/richmenu/alias", {
    method: "POST",
    headers: lineHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ richMenuAliasId: ALIAS, richMenuId })
  });
  if (!createRes.ok) throw new Error("C Alias 建立失敗：" + JSON.stringify(await readLineResponse(createRes)));
}

export async function GET() {
  if (isProduction()) {
    return page('<h1>BodyFix｜更新 C</h1><div class="warn">此工具只允許在 Preview 執行。</div>');
  }
  return page(
    "<h1>BodyFix｜更新 C「更多」</h1>" +
    "<p><strong>只處理 C。</strong> A、B 與預設首頁完全不修改。</p>" +
    '<div class="ok">新版版面已重新對齊熱區：認識 Gavin／第一次來／客人回饋／FAQ／IG／官網。上方 A、B 分頁切換保留。</div>' +
    '<div class="warn">請上傳 2500 × 1686、1 MB 以下的圖片。</div>' +
    '<form method="POST" enctype="multipart/form-data">' +
    '<input type="file" name="image" accept="image/png,image/jpeg" required />' +
    '<button type="submit">更新 C 並套用</button>' +
    "</form>"
  );
}

export async function POST(req: Request) {
  if (isProduction()) return NextResponse.json({ ok:false, error:"Disabled in production" }, { status:403 });

  let createdId: string | null = null;
  try {
    const form = await req.formData();
    const image = validateImage(form.get("image"));
    createdId = await createRichMenu(image);
    await upsertAlias(createdId);

    return page(
      "<h1>BodyFix｜C 已更新 ✅</h1>" +
      '<div class="ok">C｜更多已更新 Alias：<code>bodyfix-c</code><br>Rich Menu ID：<code>' + createdId + "</code></div>" +
      "<p>A｜服務・價格、B｜預約・據點與預設首頁均未修改。</p>" +
      "<p>請回 LINE 切到「更多」，測試六個區塊。</p>"
    );
  } catch (error) {
    if (createdId) {
      try {
        await fetch(LINE_API_BASE + "/richmenu/" + createdId, { method:"DELETE", headers:lineHeaders() });
      } catch {}
    }
    return page('<h1>BodyFix｜C 更新失敗</h1><div class="warn">' + (error instanceof Error ? error.message : String(error)) + "</div>");
  }
}
