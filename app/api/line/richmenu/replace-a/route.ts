import { NextResponse } from "next/server";

export const runtime = "nodejs";

const LINE_API_BASE = "https://api.line.me/v2/bot";
const LINE_DATA_API_BASE = "https://api-data.line.me/v2/bot";
const WIDTH = 2500;
const HEIGHT = 1686;
const ALIAS = "bodyfix-a";

function isProduction() {
  return process.env.VERCEL_ENV === "production";
}

function getLineToken() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  return token;
}

function lineHeaders(extra?: Record<string, string>) {
  return {
    Authorization: "Bearer " + getLineToken(),
    ...extra
  };
}

async function readLineResponse(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
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
    action: {
      type: "postback",
      label,
      data,
      displayText
    }
  };
}

const TAB_B = { x: 833, y: 0, width: 834, height: 165 };
const TAB_C = { x: 1667, y: 0, width: 833, height: 165 };

const A_AREAS = [
  richMenuSwitch(TAB_B, "預約・據點", "bodyfix-b"),
  richMenuSwitch(TAB_C, "更多", "bodyfix-c"),
  postback(
    { x: 30, y: 490, width: 850, height: 820 },
    "Body Reset",
    "action=service&service=body-reset",
    "我想了解筋膜整理系列"
  ),
  postback(
    { x: 890, y: 490, width: 800, height: 420 },
    "骨盆核心整理",
    "action=service&service=pelvic-core",
    "我想了解骨盆核心整理"
  ),
  postback(
    { x: 890, y: 910, width: 800, height: 400 },
    "VIP 骨盆核心深層",
    "action=service&service=vip-pelvic",
    "我想了解 VIP 骨盆核心深層整理"
  ),
  postback(
    { x: 1700, y: 490, width: 770, height: 600 },
    "1 對 1 教練課",
    "action=service&service=personal-training",
    "我想了解 1 對 1 教練課"
  ),
  postback(
    { x: 1700, y: 1090, width: 770, height: 220 },
    "教練課方案",
    "action=service&service=training-plans",
    "我想看教練課方案"
  ),
  postback(
    { x: 550, y: 1345, width: 780, height: 200 },
    "紫微斗數解析",
    "action=service&service=ziwei",
    "我想了解紫微斗數解析"
  ),
  postback(
    { x: 1330, y: 1345, width: 700, height: 200 },
    "塔羅占卜",
    "action=service&service=tarot",
    "我想了解塔羅占卜"
  ),
  richMenuSwitch(
    { x: 2030, y: 1345, width: 440, height: 200 },
    "更多詳細選項",
    "bodyfix-c"
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
      "<title>BodyFix A 圖片替換</title>",
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
      ".note{font-size:14px;opacity:.82}",
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
  if (!(value instanceof File)) throw new Error("請選擇 A 圖片。");
  if (!["image/png", "image/jpeg"].includes(value.type)) {
    throw new Error("圖片必須是 PNG 或 JPEG。");
  }
  if (value.size > 1_000_000) {
    throw new Error("圖片超過 1 MB，請使用已壓縮的 2500 × 1686 版本。");
  }
  return value;
}

async function createRichMenu(image: File) {
  const createRes = await fetch(LINE_API_BASE + "/richmenu", {
    method: "POST",
    headers: lineHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      size: { width: WIDTH, height: HEIGHT },
      selected: true,
      name: "BodyFix A｜服務・價格",
      chatBarText: "BodyFix 選單",
      areas: A_AREAS
    })
  });

  if (!createRes.ok) {
    throw new Error("A 建立失敗：" + JSON.stringify(await readLineResponse(createRes)));
  }

  const data: any = await readLineResponse(createRes);
  const richMenuId = data.richMenuId;
  if (!richMenuId) throw new Error("A 未取得 richMenuId。");

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
    await fetch(LINE_API_BASE + "/richmenu/" + richMenuId, {
      method: "DELETE",
      headers: lineHeaders()
    });
    throw new Error("A 圖片上傳失敗：" + JSON.stringify(err));
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
    if (!updateRes.ok) {
      throw new Error("A Alias 更新失敗：" + JSON.stringify(await readLineResponse(updateRes)));
    }
    return;
  }

  if (lookupRes.status !== 404) {
    throw new Error("A Alias 查詢失敗：" + JSON.stringify(await readLineResponse(lookupRes)));
  }

  const createRes = await fetch(LINE_API_BASE + "/richmenu/alias", {
    method: "POST",
    headers: lineHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ richMenuAliasId: ALIAS, richMenuId })
  });

  if (!createRes.ok) {
    throw new Error("A Alias 建立失敗：" + JSON.stringify(await readLineResponse(createRes)));
  }
}

async function setDefault(richMenuId: string) {
  const res = await fetch(
    LINE_API_BASE + "/user/all/richmenu/" + encodeURIComponent(richMenuId),
    { method: "POST", headers: lineHeaders() }
  );
  if (!res.ok) {
    throw new Error("A 設為預設失敗：" + JSON.stringify(await readLineResponse(res)));
  }
}

export async function GET() {
  if (isProduction()) {
    return page('<h1>BodyFix｜只換 A 圖片</h1><div class="warn">此工具只允許在 Preview 執行。</div>');
  }

  return page(
    "<h1>BodyFix｜只換 A 圖片</h1>" +
    "<p><strong>只處理 A｜服務・價格。</strong> B、C 完全不修改。</p>" +
    '<div class="ok">流程：建立新版 A → 套用原 A 完全相同的熱區/action → 更新 <code>bodyfix-a</code> Alias → 將新版 A 設為所有好友預設。</div>' +
    '<div class="warn">圖片必須是 2500 × 1686，且小於 1 MB。</div>' +
    '<form method="POST" enctype="multipart/form-data">' +
    '<input type="file" name="image" accept="image/png,image/jpeg" required />' +
    '<button type="submit">只替換 A 並發布</button>' +
    "</form>"
  );
}

export async function POST(req: Request) {
  if (isProduction()) {
    return NextResponse.json({ ok:false, error:"Disabled in production" }, { status:403 });
  }

  let createdId: string | null = null;

  try {
    const form = await req.formData();
    const image = validateImage(form.get("image"));

    createdId = await createRichMenu(image);
    await upsertAlias(createdId);
    await setDefault(createdId);

    return page(
      "<h1>BodyFix｜A 已更新 ✅</h1>" +
      '<div class="ok">A｜服務・價格已替換並發布。<br><br>Alias：<code>bodyfix-a</code><br>Rich Menu ID：<code>' + createdId + "</code></div>" +
      "<p>B｜預約・據點與 C｜更多沒有修改。</p>" +
      "<p>原本 A 的熱區座標與 action 已原樣套用。</p>"
    );
  } catch (error) {
    if (createdId) {
      try {
        await fetch(LINE_API_BASE + "/richmenu/" + createdId, {
          method: "DELETE",
          headers: lineHeaders()
        });
      } catch {}
    }

    return page(
      '<h1>BodyFix｜A 更新失敗</h1><div class="warn">' +
      (error instanceof Error ? error.message : String(error)) +
      "</div>"
    );
  }
}
