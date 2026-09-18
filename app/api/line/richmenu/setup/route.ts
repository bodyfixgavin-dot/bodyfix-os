import { NextResponse } from "next/server";

export const runtime = "nodejs";

const LINE_API_BASE = "https://api.line.me/v2/bot";
const LINE_DATA_API_BASE = "https://api-data.line.me/v2/bot";

const RICH_MENU_ALIAS = "bodyfix-b";
const RICH_MENU_NAME = "BodyFix B｜服務項目";

const WIDTH = 2500;
const HEIGHT = 843;

// 只讓這個臨時工具跑在 Vercel Preview / Local。
// 正式 production 一律禁止執行。
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

function lineHeaders(extra?: Record<string, string>) {
  return {
    Authorization: `Bearer ${getLineToken()}`,
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

/**
 * GET
 * 顯示一個簡單的 B 圖上傳頁面。
 */
export async function GET() {
  if (isProduction()) {
    return NextResponse.json(
      {
        ok: false,
        error: "This setup tool is disabled in production."
      },
      { status: 403 }
    );
  }

  const html = `
<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>BodyFix Rich Menu B Setup</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #071d2d;
      color: #f5ead8;
      margin: 0;
      padding: 40px 20px;
    }

    .card {
      max-width: 640px;
      margin: 0 auto;
      background: #0b263a;
      border: 1px solid #c89d59;
      border-radius: 18px;
      padding: 28px;
    }

    h1 {
      margin-top: 0;
      color: #e8bd78;
    }

    p {
      line-height: 1.7;
    }

    input[type="file"] {
      display: block;
      width: 100%;
      margin: 20px 0;
    }

    button {
      width: 100%;
      padding: 14px 18px;
      border: 0;
      border-radius: 999px;
      background: #e8bd78;
      color: #071d2d;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
    }

    .note {
      font-size: 14px;
      opacity: 0.8;
    }
  </style>
</head>

<body>
  <div class="card">
    <h1>BodyFix｜Rich Menu B</h1>

    <p>
      建立「B｜服務項目」Messaging API Rich Menu，
      並建立 Alias：
      <strong>bodyfix-b</strong>
    </p>

    <p class="note">
      圖片請使用 2500 × 843 PNG／JPEG，檔案需小於 1 MB。
      此操作不會把 B 設成正式預設選單。
    </p>

    <form method="POST" enctype="multipart/form-data">
      <input
        type="file"
        name="image"
        accept="image/png,image/jpeg"
        required
      />

      <button type="submit">
        建立 B｜服務項目
      </button>
    </form>
  </div>
</body>
</html>
`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}

/**
 * POST
 * 1. 確認 bodyfix-b 是否已存在
 * 2. 建立 Rich Menu B
 * 3. 上傳圖片
 * 4. 建立 bodyfix-b Alias
 *
 * 注意：
 * 不會設定成 default rich menu。
 */
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

  try {
    /**
     * STEP 1
     * 先確認 alias 是否已經存在。
     * 避免重新整理頁面時一直建立重複 Rich Menu。
     */
    const existingAliasRes = await fetch(
      `${LINE_API_BASE}/richmenu/alias/${RICH_MENU_ALIAS}`,
      {
        headers: lineHeaders()
      }
    );

    if (existingAliasRes.ok) {
      const existingAlias = await readLineResponse(existingAliasRes);

      return NextResponse.json({
        ok: true,
        alreadyExists: true,
        message: "bodyfix-b 已存在，沒有重複建立。",
        alias: RICH_MENU_ALIAS,
        ...existingAlias
      });
    }

    // 404 = alias 尚未建立，這是正常狀況。
    if (existingAliasRes.status !== 404) {
      return NextResponse.json(
        {
          ok: false,
          step: "check-alias",
          status: existingAliasRes.status,
          error: await readLineResponse(existingAliasRes)
        },
        { status: 500 }
      );
    }

    /**
     * STEP 2
     * 取得使用者剛選擇的 B 圖。
     */
    const formData = await req.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          error: "請選擇 Rich Menu B 圖片。"
        },
        { status: 400 }
      );
    }

    if (!["image/png", "image/jpeg"].includes(image.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: "圖片必須是 PNG 或 JPEG。"
        },
        { status: 400 }
      );
    }

    // LINE Rich Menu 圖片上限 1 MB。
    if (image.size > 1_000_000) {
      return NextResponse.json(
        {
          ok: false,
          error: "圖片超過 1 MB，請先壓縮後再上傳。",
          size: image.size
        },
        { status: 400 }
      );
    }

    /**
     * STEP 3
     * 建立 B Rich Menu。
     *
     * 上方：
     * A 本週預約 → bodyfix-a
     * B 服務項目 → Active，不設 action
     * C 認識 BodyFix → bodyfix-c
     *
     * 中間五張服務卡：
     * 各自送出 postback，之後由 webhook 回 Flex Message。
     */
    const richMenuPayload = {
      size: {
        width: WIDTH,
        height: HEIGHT
      },

      selected: true,

      name: RICH_MENU_NAME,

      chatBarText: "BodyFix 服務項目",

      areas: [
        // ─────────────────────────────
        // TOP TAB｜A 本週預約
        // ─────────────────────────────
        {
          bounds: {
            x: 0,
            y: 0,
            width: 833,
            height: 145
          },
          action: {
            type: "richmenuswitch",
            label: "本週預約",
            richMenuAliasId: "bodyfix-a",
            data: "richmenu=bodyfix-a"
          }
        },

        // 中間 B 為目前 active page，
        // 故意不建立點擊區。

        // ─────────────────────────────
        // TOP TAB｜C 認識 BodyFix
        // ─────────────────────────────
        {
          bounds: {
            x: 1667,
            y: 0,
            width: 833,
            height: 145
          },
          action: {
            type: "richmenuswitch",
            label: "認識 BodyFix",
            richMenuAliasId: "bodyfix-c",
            data: "richmenu=bodyfix-c"
          }
        },

        // ─────────────────────────────
        // SERVICE 1｜筋膜鏈整理
        // ─────────────────────────────
        {
          bounds: {
            x: 0,
            y: 145,
            width: 500,
            height: 560
          },
          action: {
            type: "postback",
            label: "筋膜鏈整理",
            data: "action=service&service=fascia-chain",
            displayText: "筋膜鏈整理"
          }
        },

        // ─────────────────────────────
        // SERVICE 2｜骨盆核心整理
        // ─────────────────────────────
        {
          bounds: {
            x: 500,
            y: 145,
            width: 500,
            height: 560
          },
          action: {
            type: "postback",
            label: "骨盆核心整理",
            data: "action=service&service=pelvic-core",
            displayText: "骨盆核心整理"
          }
        },

        // ─────────────────────────────
        // SERVICE 3｜1 對 1 教練課
        // ─────────────────────────────
        {
          bounds: {
            x: 1000,
            y: 145,
            width: 500,
            height: 560
          },
          action: {
            type: "postback",
            label: "1 對 1 教練課",
            data: "action=service&service=personal-training",
            displayText: "1 對 1 教練課"
          }
        },

        // ─────────────────────────────
        // SERVICE 4｜紫微斗數解析
        // ─────────────────────────────
        {
          bounds: {
            x: 1500,
            y: 145,
            width: 500,
            height: 560
          },
          action: {
            type: "postback",
            label: "紫微斗數解析",
            data: "action=service&service=ziwei",
            displayText: "紫微斗數解析"
          }
        },

        // ─────────────────────────────
        // SERVICE 5｜塔羅占卜
        // ─────────────────────────────
        {
          bounds: {
            x: 2000,
            y: 145,
            width: 500,
            height: 560
          },
          action: {
            type: "postback",
            label: "塔羅占卜",
            data: "action=service&service=tarot",
            displayText: "塔羅占卜"
          }
        }
      ]
    };

    const createRes = await fetch(`${LINE_API_BASE}/richmenu`, {
      method: "POST",
      headers: lineHeaders({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(richMenuPayload)
    });

    if (!createRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          step: "create-rich-menu",
          status: createRes.status,
          error: await readLineResponse(createRes)
        },
        { status: 500 }
      );
    }

    const createResult = (await readLineResponse(createRes)) as {
      richMenuId?: string;
    };

    const richMenuId = createResult.richMenuId;

    if (!richMenuId) {
      return NextResponse.json(
        {
          ok: false,
          step: "create-rich-menu",
          error: "LINE did not return richMenuId."
        },
        { status: 500 }
      );
    }

    /**
     * STEP 4
     * 把選擇的圖片上傳到剛建立的 Rich Menu。
     */
    const imageBuffer = await image.arrayBuffer();

    const uploadRes = await fetch(
      `${LINE_DATA_API_BASE}/richmenu/${richMenuId}/content`,
      {
        method: "POST",
        headers: lineHeaders({
          "Content-Type": image.type
        }),
        body: imageBuffer
      }
    );

    if (!uploadRes.ok) {
      const uploadError = await readLineResponse(uploadRes);

      // 上傳失敗就把剛建立、但沒有圖片的 menu 清掉。
      await fetch(`${LINE_API_BASE}/richmenu/${richMenuId}`, {
        method: "DELETE",
        headers: lineHeaders()
      });

      return NextResponse.json(
        {
          ok: false,
          step: "upload-image",
          status: uploadRes.status,
          error: uploadError
        },
        { status: 500 }
      );
    }

    /**
     * STEP 5
     * 建立 Alias：bodyfix-b
     */
    const aliasRes = await fetch(`${LINE_API_BASE}/richmenu/alias`, {
      method: "POST",
      headers: lineHeaders({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({
        richMenuAliasId: RICH_MENU_ALIAS,
        richMenuId
      })
    });

    if (!aliasRes.ok) {
      const aliasError = await readLineResponse(aliasRes);

      // Alias 建立失敗就清理 Rich Menu，
      // 避免留下孤兒 Menu。
      await fetch(`${LINE_API_BASE}/richmenu/${richMenuId}`, {
        method: "DELETE",
        headers: lineHeaders()
      });

      return NextResponse.json(
        {
          ok: false,
          step: "create-alias",
          status: aliasRes.status,
          error: aliasError
        },
        { status: 500 }
      );
    }

    /**
     * 完成。
     * 注意：這裡沒有設定 default，
     * 所以目前好友不會突然看到新版。
     */
    return NextResponse.json({
      ok: true,
      message: "BodyFix B｜服務項目建立完成。",
      richMenuId,
      alias: RICH_MENU_ALIAS,
      defaultMenuChanged: false,
      next: "接下來可建立 bodyfix-a 與 bodyfix-c，再進行手機切頁測試。"
    });
  } catch (error) {
    console.error("Rich Menu B setup failed", error);

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
