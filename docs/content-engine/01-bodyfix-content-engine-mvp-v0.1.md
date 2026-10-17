# BodyFix Content Engine MVP v0.1 技術規格

**文件版本**：v0.1  
**日期**：2026-07-02  
**目標專案**：`bodyfixgavin-dot/bodyfix-os`  
**部署環境**：Vercel  
**資料層**：Supabase `bodyfix-database`  
**AI 文字層**：OpenAI Responses API  
**製作協作層**：Manus API／Manus Connector

---

## 0. 決策摘要

BodyFix Content Engine 的第一版，不做「全自動社群機器人」，而是做一套有人工核准節點的內容生產系統。

核心流程：

```text
主題／素材輸入
→ OpenAI 產生結構化草稿
→ Gavin 文字審核
→ 送交 Manus 製作
→ Manus 回傳成果
→ Gavin 視覺審核
→ 手動發布
→ 回填成效
```

### v0.1 的三個原則

1. **人類核准優先**：所有文字與視覺都必須經 Gavin 核准。
2. **資料最小化**：不把姓名、聯絡方式、預約資訊或可識別客戶資料送給 OpenAI 或 Manus。
3. **可追溯**：保存 AI 原始輸出、人工修改版、送交 Manus 版本與最終核准版。

---

## 1. 現況基礎

目前 `bodyfix-os` 已具備：

- Next.js App Router
- TypeScript
- Supabase SDK
- Zod
- Vitest
- Vercel 部署
- OpenAI Responses API
- LINE Webhook 與 AI fallback 模式
- 結構化 JSON Schema 輸出經驗

因此 Content Engine 應沿用現有技術，不另建獨立服務。

### 模組隔離

現有 `lib/bodyfix-ai/` 主要服務 LINE AI 接待員，不應直接塞入 Content Engine 邏輯。

建議新增：

```text
lib/content-engine/
├── schemas.ts
├── types.ts
├── openai.ts
├── prompts.ts
├── repository.ts
├── redaction.ts
├── state-machine.ts
└── manus/
    ├── client.ts
    ├── types.ts
    └── verify-webhook.ts
```

---

## 2. 使用者與權限

### v0.1 使用者

僅 Gavin／Owner 使用。

### UI 路徑

```text
/owner-mode/content-engine
/owner-mode/content-engine/new
/owner-mode/content-engine/[projectId]
```

不建議第一版使用公開的 `/admin/content-engine`，原因：

- BodyFix 已有 Owner Mode 的產品語言。
- 避免再造一套名稱與權限概念。
- 不可使用只有前端隱藏的「假登入」。

### 存取要求

- 頁面與 API 都必須在伺服器端驗證 Owner 身分。
- 瀏覽器不得直接持有 `SUPABASE_SERVICE_ROLE_KEY`。
- v0.1 的資料寫入統一經 Next.js API／Server Action。
- Supabase Content Engine 資料表啟用 RLS，且不開放 anon 直接寫入。

---

## 3. MVP 功能範圍

### 3.1 新增內容任務

必填欄位：

- 標題
- 內容類型
- 平台
- 目標受眾
- 核心問題
- 內容目的
- 素材／來源摘要
- 是否含個案素材
- 品牌注意事項

支援的第一版內容類型：

```text
instagram_carousel
instagram_reel
instagram_caption
story_sequence
article_outline
```

### 3.2 OpenAI 產生結構化草稿

輸出必須符合固定 JSON Schema，包括：

- 內容標題
- Hook
- 頁面／鏡頭結構
- Caption
- CTA
- 視覺方向
- 品牌檢查
- 安全檢查
- 不確定事項

禁止只回傳自由格式長文。

### 3.3 文字版本管理

至少保存：

- AI 原始版本
- Gavin 修改版本
- 文字核准版本
- 實際送交 Manus 版本

任何修改不得覆蓋舊版本。

### 3.4 送交 Manus

只有狀態為 `TEXT_APPROVED` 才能送交。

送出內容包括：

- 核准文字版本
- JSON Content Package
- BodyFix 視覺規範
- 指定版型
- 輸出比例
- 禁止事項
- 任務冪等鍵

### 3.5 Manus 任務追蹤

記錄：

- 外部 task ID
- 任務狀態
- request snapshot
- response snapshot
- 錯誤摘要
- 嘗試次數
- 建立與完成時間

### 3.6 成果審核

支援：

- 核准
- 退回視覺修改
- 退回文字修改
- 作廢

### 3.7 手動發布與成效回填

v0.1 不自動發布。

發布後可手動輸入：

- 發布網址
- 發布時間
- 24 小時觸及
- 24 小時收藏
- 24 小時分享
- 7 天觸及
- 7 天收藏
- 7 天分享
- 私訊／預約轉化

---

## 4. 狀態機

```text
IDEA
→ DRAFTING
→ TEXT_REVIEW
→ TEXT_APPROVED
→ SENT_TO_MANUS
→ VISUAL_REVIEW
→ APPROVED
→ PUBLISHED
→ ARCHIVED
```

分支狀態：

```text
TEXT_REVIEW → REVISION_REQUIRED → DRAFTING
VISUAL_REVIEW → REVISION_REQUIRED → TEXT_REVIEW 或 SENT_TO_MANUS
任一處理階段 → FAILED
任一未發布階段 → CANCELLED
```

### 狀態轉移規則

| 目前狀態 | 可轉移狀態 | 必要條件 |
|---|---|---|
| IDEA | DRAFTING | 已填必要欄位 |
| DRAFTING | TEXT_REVIEW | AI 輸出通過 Schema 驗證 |
| TEXT_REVIEW | TEXT_APPROVED | Gavin 明確核准指定版本 |
| TEXT_APPROVED | SENT_TO_MANUS | Manus payload 建立成功 |
| SENT_TO_MANUS | VISUAL_REVIEW | 收到完成成果 |
| VISUAL_REVIEW | APPROVED | Gavin 明確核准 |
| APPROVED | PUBLISHED | 手動填入發布紀錄 |
| PUBLISHED | ARCHIVED | 完成成效回填或手動歸檔 |

---

## 5. 資料模型

### 5.1 `content_projects`

一筆內容任務的主檔。

主要欄位：

- `id`
- `project_code`
- `title`
- `content_type`
- `platform`
- `status`
- `audience`
- `objective`
- `source_summary`
- `contains_case_material`
- `created_by`
- `created_at`
- `updated_at`

### 5.2 `content_versions`

不可覆寫的版本紀錄。

主要欄位：

- `id`
- `project_id`
- `version_number`
- `version_type`
- `content_json`
- `content_text`
- `change_summary`
- `created_by`
- `created_at`

`version_type`：

```text
AI_ORIGINAL
HUMAN_EDIT
TEXT_APPROVED
MANUS_PAYLOAD
FINAL_APPROVED
PUBLISHED_COPY
```

### 5.3 `ai_generations`

保存 AI 使用紀錄。

主要欄位：

- `id`
- `project_id`
- `version_id`
- `provider`
- `model`
- `prompt_version`
- `input_snapshot`
- `output_snapshot`
- `status`
- `error_message`
- `usage_input_tokens`
- `usage_output_tokens`
- `estimated_cost`
- `created_at`

### 5.4 `approval_logs`

保存人工核准與退回決策。

主要欄位：

- `id`
- `project_id`
- `version_id`
- `action`
- `from_status`
- `to_status`
- `comment`
- `approved_by`
- `created_at`

### 5.5 `manus_tasks`

保存 Manus 任務與回傳。

主要欄位：

- `id`
- `project_id`
- `version_id`
- `external_task_id`
- `idempotency_key`
- `status`
- `request_snapshot`
- `response_snapshot`
- `error_message`
- `attempt_count`
- `submitted_at`
- `completed_at`
- `created_at`
- `updated_at`

### 5.6 `content_assets`

保存成果檔案資訊。

主要欄位：

- `id`
- `project_id`
- `manus_task_id`
- `asset_type`
- `storage_path`
- `external_url`
- `mime_type`
- `metadata`
- `created_at`

### 5.7 `publication_metrics`

保存發布與成效資料。

主要欄位：

- `id`
- `project_id`
- `platform`
- `published_url`
- `published_at`
- `metrics_24h`
- `metrics_7d`
- `conversion_notes`
- `created_at`
- `updated_at`

---

## 6. API 設計

### 專案

```text
POST /api/content-engine/projects
GET  /api/content-engine/projects
GET  /api/content-engine/projects/[projectId]
PATCH /api/content-engine/projects/[projectId]
```

### 生成與版本

```text
POST /api/content-engine/projects/[projectId]/generate
POST /api/content-engine/projects/[projectId]/versions
GET  /api/content-engine/projects/[projectId]/versions
```

### 核准

```text
POST /api/content-engine/projects/[projectId]/approve-text
POST /api/content-engine/projects/[projectId]/request-revision
POST /api/content-engine/projects/[projectId]/approve-visual
```

### Manus

```text
POST /api/content-engine/projects/[projectId]/submit-manus
GET  /api/content-engine/projects/[projectId]/manus-tasks
POST /api/webhooks/manus
```

### 發布

```text
POST /api/content-engine/projects/[projectId]/publish
POST /api/content-engine/projects/[projectId]/metrics
```

### API 通用要求

- Zod 驗證所有輸入。
- 所有寫入須驗證 Owner。
- 所有狀態轉移須呼叫 state machine，不得由前端任意指定。
- 錯誤回應不得包含 Secret、完整第三方 response 或客戶資料。
- 外部呼叫必須有 timeout、重試上限與 idempotency key。

---

## 7. OpenAI 設計

### 7.1 模組

```text
lib/content-engine/openai.ts
lib/content-engine/prompts.ts
lib/content-engine/schemas.ts
```

### 7.2 使用方式

沿用 OpenAI Responses API 與 strict JSON Schema。

### 7.3 Prompt 分層

1. `system`：BodyFix 角色、品牌邊界與醫療用語限制。
2. `brand_context`：品牌核心句、4R、視覺規範。
3. `task_context`：平台、受眾、目的、素材。
4. `source_context`：已去識別化的來源摘要。
5. `output_contract`：JSON Schema。

### 7.4 資料去識別化

送出前必須移除：

- 姓名
- LINE／IG／Email／電話
- 地址
- 精確預約時間
- 可辨識職場與單位
- 具唯一性的個案細節
- 任何使用者未同意公開的內容

v0.1 不直接讀取 `clients` 或 `service_records` 建立貼文。

如需個案內容，先由 Gavin 建立「公開用去識別摘要」，再餵給 Content Engine。

---

## 8. Manus 整合設計

### 8.1 重要區分

Manus Connector 的 OAuth 連線，供 Manus 工作代理存取 GitHub／Vercel／Supabase。

BodyFix OS 在正式環境自動呼叫 Manus，仍需獨立的 Manus API 存取方式與憑證。兩者不能視為同一件事。

### 8.2 Adapter 介面

```ts
interface ManusClient {
  createTask(input: ManusTaskInput): Promise<ManusTaskResult>;
  getTask(taskId: string): Promise<ManusTaskStatus>;
  cancelTask?(taskId: string): Promise<void>;
}
```

### 8.3 建議環境變數

以下名稱是 BodyFix 端建議命名，實作時依 Manus 官方憑證格式對應：

```text
MANUS_API_KEY
MANUS_WEBHOOK_SECRET
MANUS_API_BASE_URL
```

全部只能放在 Vercel Server Environment，不得使用 `NEXT_PUBLIC_`。

### 8.4 Webhook

Webhook 必須：

- 驗證簽章
- 保存 event ID
- 防止重送
- 使用 idempotency key
- 不信任外部傳來的 project ID
- 以資料庫中的 task 對應關係查回 project
- 不因單次失敗讓整個 webhook 回傳敏感錯誤

---

## 9. UI 規格

### 9.1 列表頁

顯示：

- project code
- 標題
- 類型
- 目前狀態
- 最後修改時間
- Manus 狀態
- 下一個可執行動作

### 9.2 詳情頁

區塊：

1. 任務摘要
2. 素材與來源
3. AI 草稿
4. 版本差異
5. 品牌／安全檢查
6. 文字核准
7. Manus 任務
8. 視覺成果
9. 發布與成效

### 9.3 第一版按鈕

```text
產生草稿
儲存人工修改
核准文字
送交 Manus
要求修改
核准視覺
記錄發布
歸檔
```

所有危險操作都要有確認視窗，並顯示即將使用的版本編號。

---

## 10. 測試案例：BF-IG-001

### 主題

為什麼按摩完，隔天又緊回來？

### 驗收內容

- 可建立 `BF-IG-001`
- 可產生符合 Schema 的 7 頁 Carousel 草稿
- 可保存 AI 原始版
- 可建立 Gavin 修改版
- 可核准指定版本
- 未核准前不可送 Manus
- 可建立 Manus task
- 可接收模擬 webhook
- 可顯示回傳 asset
- 可核准視覺
- 可手動記錄發布 URL 與成效

---

## 11. v0.1 暫時不要做

- Instagram 自動發布
- Instagram Connector 自動抓數據
- Meta Ads 自動投放
- 多使用者協作
- 完整角色權限系統
- 自動讀取客戶服務紀錄產文
- 自動把客戶資料送給外部 AI
- 複雜圖片合成器
- Canva 自動套版
- 自動重寫已核准內容
- 自動選擇是否發布
- 以 AI 預測「一定會爆」
- 直接部署到 Production
- 修改既有 LINE AI 接待員流程

---

## 12. 分階段施工

### Phase 0：文件與型別

- 新增規格文件
- 新增 TypeScript types
- 新增 Zod schema
- 新增 state machine
- 不接外部 API

### Phase 1：本地 MVP

- Supabase migration
- CRUD API
- Owner Mode UI
- 版本與核准流程
- 使用 mock Manus client

### Phase 2：OpenAI

- Content prompt
- strict JSON Schema
- usage 紀錄
- failure fallback

### Phase 3：Manus

- 真實 API adapter
- webhook 驗證
- task tracking
- asset 回傳

### Phase 4：發布後資料

- 手動發布紀錄
- 手動成效回填
- 基準比較

---

## 13. 驗收標準

### 功能

- 一筆內容可完整走完 IDEA 到 PUBLISHED。
- 每次修改都形成新版本。
- 核准紀錄不可被一般更新覆蓋。
- 未核准文字不得送 Manus。
- 同一 idempotency key 不得建立兩筆外部任務。
- webhook 重送不得重複建立 asset。

### 安全

- 前端 bundle 不含 Service Role Key、OpenAI Key 或 Manus Key。
- anon 不可直接寫入 Content Engine 資料表。
- 日誌不輸出 Secret 或完整個資。
- API 拒絕非法狀態跳轉。
- Content Engine 不讀取 `clients`／`service_records` 的資料列。

### 品牌

- 使用繁體中文。
- 不宣稱診斷、治療或醫療效果。
- 保留 BodyFix 4R 與核心語言。
- AI 產出需標示不確定內容，禁止自行杜撰科學證據。

---

## 14. 成功定義

v0.1 成功，不是「能自動發文」。

而是 Gavin 可以在同一個系統裡清楚看到：

```text
這篇內容從哪裡來
AI 原本寫了什麼
Gavin 改了什麼
哪一版被核准
哪一版送給 Manus
Manus 回傳了什麼
最後發布的是哪一版
發布後表現如何
```

這才是可累積、可稽核、可逐步自動化的 BodyFix Content Engine。
