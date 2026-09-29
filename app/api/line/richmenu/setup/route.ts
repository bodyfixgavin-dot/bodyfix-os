import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const LINE_API_BASE = "https://api.line.me/v2/bot";
const LINE_DATA_API_BASE = "https://api-data.line.me/v2/bot";

const WIDTH = 2500;
const HEIGHT = 1686;
const MAX_IMAGE_BYTES = 1_000_000;

type MenuKey = "a" | "b" | "c";

type RichMenuArea = {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: Record<string, unknown>;
};

type MenuConfig = {
  key: MenuKey;
  alias: string;
  name: string;
  fileField: string;
  areas: RichMenuArea[];
};

function isProduction() {
  return process.env.VERCEL_ENV === "production";
}

function getLineToken() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!token) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  }

  return token;
}

function getAdminToken() {
  const token = process.env.BODYFIX_ADMIN_TOKEN;

  if (!token) {
    throw new Error("BODYFIX_ADMIN_TOKEN is not configured");
  }

  return token;
}

function isValidAdminToken(input: string) {
  const expected = Buffer.from(getAdminToken());
  const actual = Buffer.from(input);

  return (
    expected.length === actual.length &&
    timingSafeEqual(expected, actual)
  );
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

function switchArea(
  bounds: RichMenuArea["bounds"],
  label: string,
  alias: string
): RichMenuArea {
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

function postbackArea(
  bounds: RichMenuArea["bounds"],
  label: string,
  data: string,
  displayText: string
): RichMenuArea {
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

function uriArea(
  bounds: RichMenuArea["bounds"],
  label: string,
  uri: string
): RichMenuArea {
  return {
    bounds,
    action: {
      type: "uri",
      label,
      uri
    }
  };
}

const TAB_A = { x: 0, y: 0, width: 833, height: 165 };
const TAB_B = { x: 833, y: 0, width: 834, height: 165 };
const TAB_C = { x: 1667, y: 0, width: 833, height: 165 };

const menus: MenuConfig[] = [
  {
    key: "a",
    alias: "bodyfix-a",
    name: "BodyFix A｜服務・價格",
    fileField: "imageA",
    areas: [
      switchArea(TAB_B, "預約・據點", "bodyfix-b"),
      switchArea(TAB_C, "更多", "bodyfix-c"),

      postbackArea(
        { x: 30, y: 490, width: 850, height: 820 },
        "Body Reset",
        "action=service&service=body-reset",
        "我想了解筋膜整理系列"
      ),
      postbackArea(
        { x: 890, y: 490, width: 800, height: 420 },
        "骨盆核心整理",
        "action=service&service=pelvic-core",
        "我想了解骨盆核心整理"
      ),
      postbackArea(
        { x: 890, y: 910, width: 800, height: 400 },
        "VIP 骨盆核心深層",
        "action=service&service=vip-pelvic",
        "我想了解 VIP 骨盆核心深層整理"
      ),
      postbackArea(
        { x: 1700, y: 490, width: 770, height: 600 },
        "1 對 1 教練課",
        "action=service&service=personal-training",
        "我想了解 1 對 1 教練課"
      ),
      postbackArea(
        { x: 1700, y: 1090, width: 770, height: 220 },
        "教練課方案",
        "action=service&service=training-plans",
        "我想看教練課方案"
      ),
      postbackArea(
        { x: 550, y: 1345, width: 780, height: 200 },
        "紫微斗數解析",
        "action=service&service=ziwei",
        "我想了解紫微斗數解析"
      ),
      postbackArea(
        { x: 1330, y: 1345, width: 700, height: 200 },
        "塔羅占卜",
        "action=service&service=tarot",
        "我想了解塔羅占卜"
      ),
      switchArea(
        { x: 2030, y: 1345, width: 440, height: 200 },
        "更多詳細選項",
        "bodyfix-c"
      )
    ]
  },
  {
    key: "b",
    alias: "bodyfix-b",
    name: "BodyFix B｜預約・據點",
    fileField: "imageB",
    areas: [
      switchArea(TAB_A, "服務・價格", "bodyfix-a"),
      switchArea(TAB_C, "更多", "bodyfix-c"),

      // 六張犁主據點：只讓標題與地址區可點。
      // 「筋膜整理／骨盆核心／運動按摩」三個小標籤純介紹，不設熱區。
      postbackArea(
        { x: 1220, y: 500, width: 920, height: 230 },
        "六張犁工作室",
        "action=location&location=luzhangli",
        "BodyFix・六張犁工作室"
      ),
      postbackArea(
        { x: 1220, y: 875, width: 920, height: 155 },
        "六張犁地址",
        "action=location&location=luzhangli",
        "BodyFix・六張犁工作室"
      ),

      postbackArea(
        { x: 30, y: 1090, width: 800, height: 315 },
        "西門共享工作室",
        "action=location&location=ximen",
        "我想了解西門共享工作室"
      ),
      postbackArea(
        { x: 850, y: 1090, width: 810, height: 315 },
        "國父紀念館共享工作室",
        "action=location&location=sunyatsen",
        "我想了解國父紀念館共享工作室"
      ),
      postbackArea(
        { x: 1680, y: 1090, width: 790, height: 315 },
        "指定地點服務",
        "action=location&location=custom",
        "我想詢問指定地點服務"
      ),

      postbackArea(
        { x: 30, y: 1420, width: 800, height: 185 },
        "立即預約",
        "action=booking&mode=immediate",
        "我想預約 BodyFix"
      ),
      postbackArea(
        { x: 850, y: 1420, width: 810, height: 185 },
        "本週可約時段",
        "action=booking&mode=this-week",
        "查看本週可約時段"
      ),
      postbackArea(
        { x: 1680, y: 1420, width: 790, height: 185 },
        "預約須知",
        "action=booking&mode=notice",
        "我想看預約須知"
      )
    ]
  },
  {
    key: "c",
    alias: "bodyfix-c",
    name: "BodyFix C｜更多",
    fileField: "imageC",
    areas: [
      switchArea(TAB_A, "服務・價格", "bodyfix-a"),
      switchArea(TAB_B, "預約・據點", "bodyfix-b"),

      postbackArea(
        { x: 820, y: 500, width: 840, height: 390 },
        "認識 Gavin",
        "action=content&content=gavin",
        "我想認識 Gavin"
      ),
      postbackArea(
        { x: 1680, y: 500, width: 790, height: 390 },
        "第一次來",
        "action=content&content=first-visit",
        "我想看第一次來流程"
      ),
      postbackArea(
        { x: 820, y: 900, width: 760, height: 370 },
        "FAQ",
        "action=content&content=faq",
        "我想看常見問題"
      ),
      postbackArea(
        { x: 1590, y: 900, width: 880, height: 370 },
        "4R Method",
        "action=content&content=4r",
        "我想了解 4R Method"
      ),
      postbackArea(
        { x: 820, y: 1280, width: 830, height: 300 },
        "BodyFix 是什麼",
        "action=content&content=about-bodyfix",
        "我想了解 BodyFix 是什麼"
      ),
      uriArea(
        { x: 1660, y: 1280, width: 400, height: 300 },
        "IG / 作品",
        "https://www.instagram.com/bodyfixgavin/"
      ),
      uriArea(
        { x: 2070, y: 1280, width: 400, height: 300 },
        "官方網站",
        "https://bodyfix-os.vercel.app/"
      )
    ]
  }
];

function renderPage(content: string) {
  return new Response(
    "<!doctype html>" +
      '<html lang="zh-Hant">' +
      "<head>" +
      '<meta charset="utf-8" />' +
      '<meta name="viewport" content="width=device-width, initial-scale=1" />' +
      "<title>BodyFix Rich Menu ABC Setup</title>" +
      "<style>" +
      "*{box-sizing:border-box}" +
      "body{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#071d2d;color:#f5ead8;margin:0;padding:40px 20px}" +
      ".card{max-width:760px;margin:0 auto;background:#0b263a;border:1px solid #c89d59;border-radius:18px;padding:28px}" +
      "h1{margin-top:0;color:#e8bd78}" +
      "p{line-height:1.7}" +
      "label{display:block;margin:18px 0 8px;font-weight:700}" +
      "input{width:100%}" +
      'input[type="password"]{padding:12px 14px;border-radius:10px;border:1px solid #9d7a46;background:#061824;color:white;font-size:16px}' +
      'input[type="file"]{padding:10px 0}' +
      "button{width:100%;margin-top:24px;padding:14px 18px;border:0;border-radius:999px;background:#e8bd78;color:#071d2d;font-weight:800;font-size:16px;cursor:pointer}" +
      ".note{font-size:14px;opacity:.82}" +
      ".success{padding:16px;border:1px solid #c89d59;border-radius:12px;background:rgba(232,189,120,.12)}" +
      ".error{padding:16px;border:1px solid #ff7b7b;border-radius:12px;background:rgba(255,100,100,.12)}" +
      "code{color:#e8bd78}" +
      "</style>" +
      "</head><body><div class="card">" +
      content +
      "</div></body></html>",
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      }
    }
  );
}

function validateImage(image: FormDataEntryValue | null, label: string) {
  if (!(image instanceof File)) {
    throw new Error("請選擇 " + label + " 圖片。");
  }

  if (!["image/png", "image/jpeg"].includes(image.type)) {
    throw new Error(label + " 圖片必須是 PNG 或 JPEG。");
  }

  if (image.size > MAX_IMAGE_BYTES) {
    throw new Error(label + " 圖片超過 1 MB，請先壓縮後再上傳。");
  }

  return image;
}

async function createRichMenu(config: MenuConfig, image: File) {
  const createRes = await fetch(LINE_API_BASE + "/richmenu", {
    method: "POST",
    headers: lineHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({
      size: {
        width: WIDTH,
        height: HEIGHT
      },
      selected: true,
      name: config.name,
      chatBarText: "BodyFix 選單",
      areas: config.areas
    })
  });

  if (!createRes.ok) {
    throw new Error(
      config.alias +
        " 建立失敗：" +
        JSON.stringify(await readLineResponse(createRes))
    );
  }

  const createData = (await readLineResponse(createRes)) as {
    richMenuId?: string;
  };

  if (!createData.richMenuId) {
    throw new Error(config.alias + " 未取得 richMenuId。");
  }

  const richMenuId = createData.richMenuId;

  const uploadRes = await fetch(
    LINE_DATA_API_BASE + "/richmenu/" + richMenuId + "/content",
    {
      method: "POST",
      headers: lineHeaders({
        "Content-Type": image.type
      }),
      body: await image.arrayBuffer()
    }
  );

  if (!uploadRes.ok) {
    const uploadError = await readLineResponse(uploadRes);

    await fetch(LINE_API_BASE + "/richmenu/" + richMenuId, {
      method: "DELETE",
      headers: lineHeaders()
    });

    throw new Error(
      config.alias +
        " 圖片上傳失敗：" +
        JSON.stringify(uploadError)
    );
  }

  return richMenuId;
}

async function upsertAlias(alias: string, richMenuId: string) {
  const lookupRes = await fetch(
    LINE_API_BASE + "/richmenu/alias/" + encodeURIComponent(alias),
    {
      headers: lineHeaders()
    }
  );

  if (lookupRes.ok) {
    const updateRes = await fetch(
      LINE_API_BASE + "/richmenu/alias/" + encodeURIComponent(alias),
      {
        method: "POST",
        headers: lineHeaders({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ richMenuId })
      }
    );

    if (!updateRes.ok) {
      throw new Error(
        alias +
          " Alias 更新失敗：" +
          JSON.stringify(await readLineResponse(updateRes))
      );
    }

    return;
  }

  if (lookupRes.status !== 404) {
    throw new Error(
      alias +
        " Alias 查詢失敗：" +
        JSON.stringify(await readLineResponse(lookupRes))
    );
  }

  const createRes = await fetch(LINE_API_BASE + "/richmenu/alias", {
    method: "POST",
    headers: lineHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({
      richMenuAliasId: alias,
      richMenuId
    })
  });

  if (!createRes.ok) {
    throw new Error(
      alias +
        " Alias 建立失敗：" +
        JSON.stringify(await readLineResponse(createRes))
    );
  }
}

export async function GET() {
  if (isProduction()) {
    return renderPage(
      '<h1>BodyFix｜Rich Menu ABC Setup</h1><div class="error">此工具不能在 Production 執行。</div>'
    );
  }

  return renderPage(
    "<h1>BodyFix｜Rich Menu ABC Setup</h1>" +
      "<p>一次建立新版 A／B／C 三頁 Rich Menu，尺寸固定 <strong>2500 × 1686</strong>，並建立或更新 <code>bodyfix-a</code>、<code>bodyfix-b</code>、<code>bodyfix-c</code> Alias。</p>" +
      '<p class="note">此工具不會設定 default rich menu，所以其他好友不會突然看到新版。先建立完成，再到 Preview 只套給 Gavin 測試。</p>' +
      '<form method="POST" enctype="multipart/form-data">' +
      '<label for="token">Admin Token</label>' +
      '<input id="token" name="token" type="password" autocomplete="off" required placeholder="輸入 BODYFIX_ADMIN_TOKEN" />' +
      '<label for="imageA">A｜服務・價格</label>' +
      '<input id="imageA" type="file" name="imageA" accept="image/png,image/jpeg" required />' +
      '<label for="imageB">B｜預約・據點</label>' +
      '<input id="imageB" type="file" name="imageB" accept="image/png,image/jpeg" required />' +
      '<label for="imageC">C｜更多</label>' +
      '<input id="imageC" type="file" name="imageC" accept="image/png,image/jpeg" required />' +
      "<button type="submit">建立／更新 ABC Rich Menu</button>" +
      "</form>"
  );
}

export async function POST(req: Request) {
  if (isProduction()) {
    return NextResponse.json(
      {
        ok: false,
        error: "This setup tool is disabled in production."
      },
      { status: 403 }
    );
  }

  const createdIds: string[] = [];

  try {
    const formData = await req.formData();
    const token = String(formData.get("token") || "");

    if (!token || !isValidAdminToken(token)) {
      return renderPage(
        '<h1>BodyFix｜Rich Menu ABC Setup</h1><div class="error">Admin Token 不正確。</div>'
      );
    }

    const images: Record<MenuKey, File> = {
      a: validateImage(formData.get("imageA"), "A｜服務・價格"),
      b: validateImage(formData.get("imageB"), "B｜預約・據點"),
      c: validateImage(formData.get("imageC"), "C｜更多")
    };

    const results: Array<{
      key: MenuKey;
      alias: string;
      richMenuId: string;
    }> = [];

    // 先建立三張 Menu 並上傳圖片。
    for (const config of menus) {
      const richMenuId = await createRichMenu(
        config,
        images[config.key]
      );

      createdIds.push(richMenuId);
      results.push({
        key: config.key,
        alias: config.alias,
        richMenuId
      });
    }

    // 三張都成功後才切換 Alias，避免只完成一半。
    for (const result of results) {
      await upsertAlias(result.alias, result.richMenuId);
    }

    return NextResponse.json({
      ok: true,
      message: "BodyFix A／B／C Rich Menu 已建立並更新 Alias。",
      size: {
        width: WIDTH,
        height: HEIGHT
      },
      menus: results,
      defaultMenuChanged: false,
      next:
        "前往 /api/line/richmenu/preview，只套給 Gavin 測試 A/B/C 切頁與熱區。"
    });
  } catch (error) {
    console.error("Rich Menu ABC setup failed", error);

    // 如果 Alias 尚未切換、建立途中失敗，盡量清掉本次新建 Menu。
    // 若 Alias 已經更新成功，LINE 可能拒絕刪除關聯中的 Menu；
    // 此清理動作失敗也不影響錯誤回傳。
    for (const richMenuId of createdIds) {
      try {
        await fetch(LINE_API_BASE + "/richmenu/" + richMenuId, {
          method: "DELETE",
          headers: lineHeaders()
        });
      } catch {
        // best-effort cleanup
      }
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown Rich Menu setup error"
      },
      { status: 500 }
    );
  }
}
