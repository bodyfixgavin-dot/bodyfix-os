# BodyFix Foundation v0
這是 BodyFix 地基工程 v0。
## 目前包含
1. 產品階梯
2. 人才階梯
3. 客戶歸屬規則
4. 員工抽成比例
5. 轉介獎金規則
6. 服務權限檢查
7. 單次服務淨利試算
8. 月營收試算
## 暫時不要先做
先不要做漂亮前端。  
先不要把資料寫死在頁面裡。  
先不要做完整 CRM。  
先不要做完整預約系統。  
先不要做完整薪資系統。
先把地基資料結構穩住。
## 核心句
BodyFix 不是一個服務清單，而是一套分層系統。
Grooming 是低門檻入口。  
筋膜鏈指定整理是專業入口。  
多線整合是進階整理。  
骨盆核心整理是深度旗艦。  
12 次完整計畫是長期系統。  
培訓、認證、授權是未來槓桿收入。
## 品牌語言
讓身體回到更穩定、有韌性、有彈性的系統。
## 人才原則
BodyFix 不培養全能員工，而是用同一套品牌主幹，培養不同分支專才。
## 客戶歸屬原則
抽成可以大方，但客戶主檔、預約、收款、紀錄與 CRM 必須進 BodyFix 系統。

## Part 8｜BodyFix Real Operation Pilot

Part 8 是真實營運測試期：前台先用 Google 預約頁降低來回訊息與撞時段風險，後台用 BodyFix OS 手動建立客戶、服務紀錄、追蹤、方案候選與地區需求資料。詳細 SOP、手動匯入流程、AI Copilot 測試項目與驗收表見 `docs/part-8-real-operation-pilot.md`。

## BodyFix AI 接待員 v1.0

這個版本新增 LINE 官方帳號的 AI 接待員流程：LINE Messaging API webhook 接收文字訊息，後端呼叫 OpenAI Responses API 產生自然回覆與分類 JSON，並把客戶狀態寫入 Google Sheet CRM。系統定位不是關鍵字自動回覆，而是先把客人整理到可預約的位置，再由 Gavin 收尾。

### API routes

- `POST /api/line/webhook`：LINE Messaging API webhook。
  - 驗證 `x-line-signature`。
  - 支援 `follow` event 的新客歡迎訊息。
  - 支援文字 `message` event 的 AI 回覆、意圖分類、CRM upsert。
  - 高意願或安全邊界客戶會透過選填的 `GAVIN_LINE_USER_ID` 推播給 Gavin。
- `GET /api/cron/followup`：三天未回覆追蹤與七天未預約提醒。
  - 需帶 `Authorization: Bearer $CRON_SECRET` 或 `?secret=$CRON_SECRET`。
  - Vercel cron 預設每天 UTC 03:00 執行。

### 環境變數

必要：

```bash
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
OPENAI_API_KEY=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=
CRON_SECRET=
```

選填：

```bash
OPENAI_MODEL=gpt-4.1-mini
GAVIN_LINE_USER_ID=
FOLLOWUP_TEST_MODE=false
```

`FOLLOWUP_TEST_MODE=true` 時，追蹤門檻會從 3 天／7 天改成 3 分鐘／7 分鐘，方便上線前測試。

### Google Sheet CRM 欄位

建立一張 Google Sheet，例如 `BodyFix AI 接待員 CRM`，並把 service account email 加入該試算表的分享名單。系統會自動確認第一列欄位為：

```text
userId, displayName, firstSeenAt, lastUserMessageAt, lastBotMessageAt,
lastUserMessage, lastBotReply, lastIntent, bodyIssue, bodyArea,
preferredService, bookingStage, leadTemperature, nextAction, needHuman,
preferredLocation, preferredTime, followupCount, lastFollowupAt, notes
```

### LINE 設定步驟

1. 在 LINE Developers 建立 Messaging API channel，取得 `LINE_CHANNEL_SECRET` 與 `LINE_CHANNEL_ACCESS_TOKEN`。
2. 部署到 Vercel。
3. 把 webhook URL 設為：`https://你的專案.vercel.app/api/line/webhook`。
4. 開啟 webhook。
5. 用自己的 LINE 測試：
   - `肩頸很緊可以嗎？`
   - `多少錢？`
   - `有油壓嗎？`
   - `我想預約明天`
   - `跟一般按摩差在哪？`
   - `可以直接約 90 分鐘嗎？`
6. 檢查 Google Sheet 是否有寫入 `userId`、`lastIntent`、`leadTemperature`、`needHuman` 與 `lastBotReply`。
7. 測追蹤時可先設 `FOLLOWUP_TEST_MODE=true`，用 `/api/cron/followup?secret=你的CRON_SECRET` 手動觸發。

### BodyFix AI 價格與安排規則

- 標準筋膜整理 60 分鐘｜NT$2,200
- 骨盆核心整理 60 分鐘｜NT$2,500
- 筋膜鏈延長整理 +30 分鐘｜NT$1,000
- 骨盆核心延長整理 +30 分鐘｜NT$1,200
- 所有新客預設先安排 60 分鐘。
- 60 分鐘是標準整理時段，不是體驗版，也不是簡化版。
- AI 不主動推 90 分鐘，也不讓客人一開始在 60 與 90 分鐘之間選擇。
- 現場判讀後，如果狀況需要、客人同意、後續時段允許，可以加 30 分鐘延伸整理。
- 延長整理可以混搭。
- 到府服務需依地點、距離、時段與空間條件另外確認。
- 城市巡迴價格與台北相同。
