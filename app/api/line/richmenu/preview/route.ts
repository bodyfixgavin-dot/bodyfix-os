import { timingSafeEqual } from "crypto";

export const runtime = "nodejs";

const LINE_API_BASE = "https://api.line.me/v2/bot";
const RICH_MENU_ALIAS = "bodyfix-b";

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

function getGavinUserId() {
  const userId = process.env.GAVIN_LINE_USER_ID;

  if (!userId) {
    throw new Error("GAVIN_LINE_USER_ID is not configured");
  }

  return userId;
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
    Authorization: `Bearer ${getLineToken()}`,
    ...extra
  };
}

async function readJsonSafely(res: Response) {
  const text = await res.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function page(content: string) {
  return new Response(
    `
<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <title>BodyFix Rich Menu Preview</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 40px 20px;
      background: #071d2d;
      color: #f5ead8;
      font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    .card {
      width: min(680px, 100%);
      margin: 0 auto;
      padding: 30px;
      background: #0b263a;
      border: 1px solid #c89d59;
      border-radius: 20px;
    }

    h1 {
      margin: 0 0 20px;
      color: #e8bd78;
      font-size: 30px;
    }

    p {
      line-height: 1.75;
    }

    .note {
      margin: 18px 0 24px;
      font-size: 14px;
      opacity: 0.8;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 700;
    }

    input {
      width: 100%;
      padding: 13px 15px;
      margin-bottom: 20px;
      border: 1px solid #9d7a46;
      border-radius: 10px;
      background: #061824;
      color: white;
      font-size: 16px;
    }

    .actions {
      display: grid;
      gap: 12px;
    }

    button {
      width: 100%;
      padding: 14px 18px;
      border: 0;
      border-radius: 999px;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
    }

    .apply {
      background: #e8bd78;
      color: #071d2d;
    }

    .restore {
      background: transparent;
      color: #f5ead8;
      border: 1px solid #c89d59;
    }

    .success {
      padding: 16px;
      margin-bottom: 20px;
      border-radius: 12px;
      background: rgba(232, 189, 120, 0.12);
      border: 1px solid #c89d59;
    }

    .error {
      padding: 16px;
      margin-bottom: 20px;
      border-radius: 12px;
      background: rgba(255, 100, 100, 0.12);
      border: 1px solid #ff7b7b;
    }

    a {
      color: #e8bd78;
    }
  </style>
</head>

<body>
  <div class="card">
    ${content}
  </div>
</body>
</html>
    `,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      }
    }
  );
}

export async function GET() {
  if (isProduction()) {
    return page(`
      <h1>BodyFix｜Rich Menu Preview</h1>

      <div class="error">
        此測試工具不能在 Production 執行。
      </div>
    `);
  }

  return page(`
    <h1>BodyFix｜Rich Menu B Preview</h1>

    <p>
      這個工具只會修改 Gavin 自己的 LINE Rich Menu。
      其他好友不會受到影響。
    </p>

    <p class="note">
      「套用 B 給 Gavin」會將 bodyfix-b 指派給 Gavin。<br />
      「恢復原本選單」會解除 Gavin 的個人 Rich Menu，
      回到目前官方帳號的預設選單。
    </p>

    <form method="POST">
      <label for="token">Admin Token</label>

      <input
        id="token"
        name="token"
        type="password"
        autocomplete="off"
        required
        placeholder="輸入 BODYFIX_ADMIN_TOKEN"
      />

      <div class="actions">
        <button
          class="apply"
          type="submit"
          name="action"
          value="apply"
        >
          套用 B 給 Gavin 預覽
        </button>

        <button
          class="restore"
          type="submit"
          name="action"
          value="restore"
        >
          恢復原本選單
        </button>
      </div>
    </form>
  `);
}

export async function POST(req: Request) {
  if (isProduction()) {
    return page(`
      <h1>BodyFix｜Rich Menu Preview</h1>

      <div class="error">
        此測試工具不能在 Production 執行。
      </div>
    `);
  }

  try {
    const formData = await req.formData();

    const token = String(formData.get("token") || "");
    const action = String(formData.get("action") || "");

    if (!token || !isValidAdminToken(token)) {
      return page(`
        <h1>BodyFix｜Rich Menu Preview</h1>

        <div class="error">
          Admin Token 不正確。
        </div>

        <p>
          <a href="./preview">← 返回</a>
        </p>
      `);
    }

    const userId = getGavinUserId();

    // ─────────────────────────────
    // 套用 B Rich Menu 給 Gavin
    // ─────────────────────────────
    if (action === "apply") {
      // 先透過 Alias 取得目前 bodyfix-b 指向的 richMenuId
      const aliasRes = await fetch(
        `${LINE_API_BASE}/richmenu/alias/${RICH_MENU_ALIAS}`,
        {
          headers: lineHeaders()
        }
      );

      if (!aliasRes.ok) {
        return page(`
          <h1>BodyFix｜Rich Menu Preview</h1>

          <div class="error">
            找不到 bodyfix-b Alias。<br />
            LINE 回應：${aliasRes.status}
          </div>

          <p>
            <a href="./preview">← 返回</a>
          </p>
        `);
      }

      const aliasData = (await readJsonSafely(aliasRes)) as {
        richMenuId?: string;
      };

      if (!aliasData.richMenuId) {
        throw new Error(
          "bodyfix-b alias exists but richMenuId was not returned"
        );
      }

      const linkRes = await fetch(
        `${LINE_API_BASE}/user/${encodeURIComponent(
          userId
        )}/richmenu/${encodeURIComponent(aliasData.richMenuId)}`,
        {
          method: "POST",
          headers: lineHeaders()
        }
      );

      if (!linkRes.ok) {
        const error = await readJsonSafely(linkRes);

        return page(`
          <h1>BodyFix｜Rich Menu Preview</h1>

          <div class="error">
            無法把 B Rich Menu 指派給 Gavin。<br />
            LINE 回應：${linkRes.status}<br />
            ${JSON.stringify(error)}
          </div>

          <p>
            <a href="./preview">← 返回</a>
          </p>
        `);
      }

      return page(`
        <h1>BodyFix｜Rich Menu Preview</h1>

        <div class="success">
          ✅ bodyfix-b 已成功指派給 Gavin。
        </div>

        <p>
          現在打開手機 LINE → BodyFix 官方帳號，
          應該就會看到新版 B｜服務項目。
        </p>

        <p class="note">
          目前 A、C Alias 尚未完成，
          所以上方「本週預約」與「認識 BodyFix」先不要測切頁。
        </p>

        <p>
          <a href="./preview">← 返回控制頁</a>
        </p>
      `);
    }

    // ─────────────────────────────
    // 解除 Gavin 個人 Rich Menu
    // ─────────────────────────────
    if (action === "restore") {
      const unlinkRes = await fetch(
        `${LINE_API_BASE}/user/${encodeURIComponent(
          userId
        )}/richmenu`,
        {
          method: "DELETE",
          headers: lineHeaders()
        }
      );

      if (!unlinkRes.ok) {
        const error = await readJsonSafely(unlinkRes);

        return page(`
          <h1>BodyFix｜Rich Menu Preview</h1>

          <div class="error">
            無法解除 Gavin 的個人 Rich Menu。<br />
            LINE 回應：${unlinkRes.status}<br />
            ${JSON.stringify(error)}
          </div>

          <p>
            <a href="./preview">← 返回</a>
          </p>
        `);
      }

      return page(`
        <h1>BodyFix｜Rich Menu Preview</h1>

        <div class="success">
          ✅ Gavin 的個人 Rich Menu 已解除。
        </div>

        <p>
          現在 LINE 會回到目前官方帳號設定的預設選單。
        </p>

        <p>
          <a href="./preview">← 返回控制頁</a>
        </p>
      `);
    }

    return page(`
      <h1>BodyFix｜Rich Menu Preview</h1>

      <div class="error">
        未知操作。
      </div>

      <p>
        <a href="./preview">← 返回</a>
      </p>
    `);
  } catch (error) {
    console.error("BodyFix Rich Menu preview failed", error);

    return page(`
      <h1>BodyFix｜Rich Menu Preview</h1>

      <div class="error">
        發生錯誤：${
          error instanceof Error
            ? error.message
            : "Unknown error"
        }
      </div>

      <p>
        <a href="./preview">← 返回</a>
      </p>
    `);
  }
}
