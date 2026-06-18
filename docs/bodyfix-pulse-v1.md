# BodyFix Pulse v1

## 結構
- `/`：手機優先今日戰況；未連 Supabase 時使用 seed 同款示範資料。
- `/income`、`/appointments`：快速登錄介面。
- `/followups`：建議回訪池。
- `/settings`：目標與工作日設定。
- `/api/pulse/today`：未來 Widget 共用 JSON。
- `supabase/pulse-v1.sql`：資料表、索引、RLS 與 seed。

## 本機啟動
1. `cp .env.example .env.local` 並填入 Supabase 變數。
2. 在 Supabase SQL Editor 執行 `supabase/pulse-v1.sql`。
3. `npm install && npm run dev`，開啟 `http://localhost:3000`。

## Vercel
在 Vercel 設定 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY` 與只供 server 使用的 `SUPABASE_SERVICE_ROLE_KEY`。部署後以 Safari 開啟，使用「分享 → 加入主畫面」。Pulse API 使用 service role，請勿把該 key 暴露到瀏覽器。

## 真正 iOS Widget
以 SwiftUI + WidgetKit 建立原生 Widget Extension，透過 App Group/Keychain 安全保存使用者憑證，定時讀取 `GET /api/pulse/today`，並用 TimelineProvider 更新。正式上線前應為 API 加入 owner authentication、rate limiting 與適合 Widget 的快取策略。

## v1 邊界
本版刻意不包含員工帳號、權限後台、LINE/IG/Google Calendar API、金流、發票、完整 CRM、多店、原生 Widget 或 App Store 流程。
