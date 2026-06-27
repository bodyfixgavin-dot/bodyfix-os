# Gavin OS Core｜Chart Navigator MVP 工程規格

## 1. 文件目的

本文件把 Chart Navigator 第一版整理成可估工、可開發、可驗收的工程規格。

Chart Navigator 是 Gavin OS Core 的第一個品牌實作，但必須建立在**獨立的程式部署與 Supabase 專案**。本階段不把 Chart Navigator 的使用者、出生資料、訂單或報告寫入 BodyFix 資料庫。

核心原則：

- 共用的是架構模式、命名邏輯與可移植模組，不是跨品牌共用資料庫。
- 第一版是個人化工具引擎，不是原生 App。
- 第一版報告是入門觀察，不宣稱完整吠陀占星解讀。
- 第一版先驗證使用者是否願意完成流程與付費，不先投入自動金流。

## 2. MVP 成功條件

MVP 上線後，使用者可以：

1. 使用 Google 或 LINE 登入。
2. 建立並修改自己的出生資料。
3. 產生免費「三盞燈摘要」。
4. 對指定報告建立 NT$100 待付款訂單。
5. 在管理員人工確認付款後，查看已解鎖的 Rahu / Ketu 慣性入口報告。

管理員可以：

1. 查看使用者、身份來源、出生資料、訂單與報告。
2. 將待付款訂單標記為已付款。
3. 在同一個不可分割的後端操作中解鎖對應報告。
4. 留下管理備註與操作稽核紀錄。

## 3. 範圍

### 3.1 第一版包含

- Next.js 響應式網站。
- Chart Navigator 獨立 Supabase 專案。
- Google Login。
- LINE Login；若在 LIFF browser 中開啟，支援 LIFF 初始化與身份取得。
- LINE 官方帳號加入引導與 friendship status 紀錄。
- 使用者個人資料與出生資料 CRUD。
- 免費三盞燈摘要產生、儲存與版本紀錄。
- Rahu / Ketu 慣性入口報告建立、鎖定與解鎖。
- 人工付款確認。
- 管理後台。
- Row Level Security、管理員權限與稽核紀錄。

### 3.2 第一版不包含

- 原生 iOS / Android App。
- BodyFix 或 Space Guide 資料。
- 自動串接綠界、LINE Pay 或付款 webhook。
- 自動寄信、LINE 推播與行銷自動化。
- SADM 關係決策報告。
- 完整個人命盤或完整吠陀占星解讀。
- 跨品牌單一登入或跨品牌會員資料合併。

## 4. 建議系統邊界

| 邊界 | 第一版決策 |
| --- | --- |
| Web application | 獨立 Next.js 專案與部署 |
| Database / Auth | Chart Navigator 獨立 Supabase 專案 |
| Google identity | Supabase Auth Google provider |
| LINE identity | LIFF / LINE Login callback 經 server route 驗證後綁定 |
| Report engine | Server-only 模組；輸入、輸出與規則版本均須保存 |
| Payment | 建立 pending order，由管理員人工確認 |
| Admin | 僅 `admin_users` 中啟用的帳號可進入 |

任何 service-role key、LINE channel secret 或報告完整解鎖操作，都不得在瀏覽器端執行。

## 5. 使用者流程

### 5.1 登入與身份綁定

1. 使用者進入 Chart Navigator。
2. 系統判斷是否在 LIFF browser。
3. 使用者選擇 LINE 或 Google 登入。
4. 後端驗證 provider token / callback，建立或取得 Supabase auth user。
5. 建立 `app_users`，並 upsert 對應 `user_identities`。
6. LINE 登入後顯示加入官方帳號引導，取得並記錄 friendship status。
7. 導向出生資料頁。

約束：

- LINE 登入不代表已加入官方帳號。
- `provider + provider_user_id` 必須唯一。
- 不可只依 display name 或 email 合併不同身份。
- 身份合併需由已登入使用者主動完成，並留下稽核紀錄。

### 5.2 免費摘要

1. 使用者建立出生資料。
2. 後端驗證日期、時間、地點與 timezone。
3. 後端建立 `three_lights_summary` 報告。
4. 報告保存輸入快照、結果與 `report_version`。
5. 免費摘要建立後即可查看。

### 5.3 人工付款解鎖

1. 使用者在 Rahu / Ketu 報告頁點擊「解鎖 NT$100」。
2. 後端建立一筆 `pending` order，並建立或關聯一筆鎖定報告。
3. 前台顯示付款說明與訂單編號。
4. 管理員確認收到款項。
5. 後端 transaction 將 order 改為 `paid`，並將關聯 report 改為 `unlocked`。
6. 使用者重新整理後可查看完整內容。

同一位使用者、同一份出生資料、同一商品，在仍有有效 `pending` 或 `paid` 訂單時，不應重複建立訂單。

## 6. 狀態定義

### 6.1 Order status

| 狀態 | 說明 | 可轉換至 |
| --- | --- | --- |
| `pending` | 等待人工付款確認 | `paid`, `cancelled`, `expired` |
| `paid` | 已付款且應完成報告解鎖 | `refunded` |
| `cancelled` | 管理員取消 | 無 |
| `expired` | 超過付款期限 | 無 |
| `refunded` | 已退款；是否撤銷報告權限由營運規則決定 | 無 |

不得由前端直接將 order 改為 `paid`。

### 6.2 Report access status

使用 `access_status` 取代單一 boolean，避免未來無法表達狀態：

- `free`
- `locked`
- `unlocked`
- `revoked`

## 7. 資料模型

所有主鍵使用 UUID；所有時間欄位使用 `timestamptz`；所有資料表至少包含 `created_at` 與 `updated_at`。個人資料刪除採明確政策，不以 cascade 意外刪除付款稽核資料。

### 7.1 `app_users`

| 欄位 | 型別 / 約束 |
| --- | --- |
| `id` | uuid, PK |
| `auth_user_id` | uuid, unique, FK → auth.users |
| `display_name` | text |
| `email` | text, nullable |
| `avatar_url` | text, nullable |
| `locale` | text, default `zh-TW` |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

### 7.2 `user_identities`

| 欄位 | 型別 / 約束 |
| --- | --- |
| `id` | uuid, PK |
| `user_id` | uuid, FK → app_users |
| `provider` | text, check: `google`, `line` |
| `provider_user_id` | text |
| `provider_display_name` | text, nullable |
| `provider_avatar_url` | text, nullable |
| `friendship_status` | text, check: `unknown`, `friend`, `not_friend`, nullable for non-LINE |
| `friendship_checked_at` | timestamptz, nullable |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

唯一約束：`(provider, provider_user_id)`。

### 7.3 `astrology_profiles`

| 欄位 | 型別 / 約束 |
| --- | --- |
| `id` | uuid, PK |
| `user_id` | uuid, FK → app_users |
| `name` | text |
| `birth_date` | date |
| `birth_time` | time, nullable |
| `birth_time_known` | boolean |
| `birth_place` | text |
| `timezone` | text，必須是 IANA timezone |
| `gender_optional` | text, nullable |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

若 `birth_time_known = false`，`birth_time` 必須為 null，報告引擎也必須清楚標示精度限制。

### 7.4 `reports`

| 欄位 | 型別 / 約束 |
| --- | --- |
| `id` | uuid, PK |
| `user_id` | uuid, FK → app_users |
| `astrology_profile_id` | uuid, FK → astrology_profiles |
| `report_type` | text, check: `three_lights_summary`, `rahu_ketu_entry` |
| `input_data_json` | jsonb，產生當下的不可變輸入快照 |
| `result_summary` | text |
| `result_full` | text, nullable |
| `access_status` | text |
| `report_version` | text |
| `generated_at` | timestamptz |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

前台查詢鎖定報告時，API 不得回傳 `result_full`；不能只靠 CSS 隱藏。

### 7.5 `orders`

| 欄位 | 型別 / 約束 |
| --- | --- |
| `id` | uuid, PK |
| `order_number` | text, unique，供人工對帳 |
| `user_id` | uuid, FK → app_users |
| `product_type` | text, check: `rahu_ketu_entry` |
| `amount` | integer，最小貨幣單位；NT$100 儲存為 `100` |
| `currency` | text, default `TWD` |
| `payment_method` | text, check: `manual_transfer` |
| `payment_status` | text |
| `unlocked_report_id` | uuid, FK → reports |
| `paid_at` | timestamptz, nullable |
| `confirmed_by` | uuid, nullable, FK → admin_users |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

### 7.6 `admin_users`

| 欄位 | 型別 / 約束 |
| --- | --- |
| `id` | uuid, PK |
| `auth_user_id` | uuid, unique, FK → auth.users |
| `role` | text, check: `admin`, `owner` |
| `active` | boolean |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

### 7.7 `admin_notes`

| 欄位 | 型別 / 約束 |
| --- | --- |
| `id` | uuid, PK |
| `user_id` | uuid, FK → app_users |
| `admin_user_id` | uuid, FK → admin_users |
| `note` | text |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

### 7.8 `audit_logs`

至少記錄人工付款確認、身份綁定、管理員修改與報告權限變更。

| 欄位 | 型別 / 約束 |
| --- | --- |
| `id` | uuid, PK |
| `actor_auth_user_id` | uuid |
| `action` | text |
| `entity_type` | text |
| `entity_id` | uuid |
| `before_json` | jsonb, nullable |
| `after_json` | jsonb, nullable |
| `created_at` | timestamptz |

## 8. 權限與安全

### 8.1 RLS 原則

- `app_users`：使用者只能讀寫自己的資料；不可自行更改 `auth_user_id`。
- `user_identities`：使用者只能讀自己的身份；新增與修改只能經可信任 server route。
- `astrology_profiles`：使用者只能 CRUD 自己的資料。
- `reports`：使用者只能讀自己的報告；建立與修改只能經報告 server route。
- `orders`：使用者只能讀自己的訂單；建立只能經 server route；付款狀態不可由使用者修改。
- `admin_notes`、`audit_logs`：一般使用者完全不可讀寫。
- 管理員權限由 `admin_users.active = true` 判斷，不依 email 字串硬編碼。

### 8.2 個人資料保護

- 日誌不得輸出 provider access token、完整出生資料或報告全文。
- 所有 provider callback 必須驗證 state / nonce。
- LINE ID token 必須驗證簽章、issuer、audience 與 expiry。
- 管理後台必須有伺服器端授權檢查。
- `.env` 只保存專案識別與秘密，不提交真實 secret。
- 應提供資料匯出與刪除的營運流程；付款與稽核紀錄依法務需求保留。

## 9. Server actions / API 契約

| 操作 | 授權 | 行為 |
| --- | --- | --- |
| `POST /api/auth/line/callback` | LINE callback | 驗證 LINE 身份並建立 / 綁定 identity |
| `POST /api/profiles` | user | 建立自己的出生資料 |
| `PATCH /api/profiles/:id` | owner | 修改自己的出生資料 |
| `POST /api/reports/three-lights` | owner | 產生免費摘要 |
| `POST /api/orders` | owner | 建立 pending order 與鎖定報告 |
| `GET /api/reports/:id` | owner/admin | 鎖定時不回傳全文 |
| `POST /api/admin/orders/:id/confirm` | admin | transaction 付款確認、報告解鎖、寫 audit log |

所有寫入操作都必須在 server 端重新驗證輸入與所有權，不能信任前端傳入的 `user_id`、金額或解鎖狀態。

## 10. 頁面清單

### 使用者端

- `/`：產品說明與開始按鈕。
- `/login`：LINE / Google 登入。
- `/profile`：出生資料輸入與修改。
- `/summary/:reportId`：免費三盞燈摘要。
- `/reports/:reportId`：鎖定提示或完整報告。
- `/checkout/:reportId`：建立 / 顯示待付款訂單與付款說明。
- `/account`：個人資料、身份、訂單與報告列表。

### 管理端

- `/admin`：摘要數字與待處理訂單。
- `/admin/users`：使用者列表與明細。
- `/admin/orders`：訂單篩選與人工付款確認。
- `/admin/reports`：報告版本、狀態與關聯資料。

## 11. 報告內容規則

- 產品名稱固定使用「Rahu / Ketu 慣性入口報告」。
- 顯著標示這是入門觀察工具，不是完整命盤解讀，也不取代專業建議。
- 每次產生報告都保存 `report_version` 與輸入快照。
- 規則更新後不得靜默覆蓋既有報告；需建立新版本。
- 出生時間未知時，免費摘要與付費報告都必須提示結果限制。

## 12. 驗收條件

### Auth

- [ ] Google 登入成功後只建立一個 app user 與一筆 Google identity。
- [ ] LINE 登入成功後保存 LINE user ID、display name 與 avatar URL。
- [ ] 未加入官方帳號的 LINE 使用者仍可登入，且 friendship status 正確保存。
- [ ] 重複登入不建立重複 identity。

### Profile 與報告

- [ ] 使用者不能讀取或修改其他使用者的出生資料。
- [ ] 免費摘要保存輸入快照與 report version。
- [ ] 未解鎖報告的 API response 不包含 `result_full`。
- [ ] 出生時間未知時，頁面清楚顯示精度限制。

### Orders 與 Admin

- [ ] 使用者建立解鎖請求後產生 `pending` order。
- [ ] 使用者不能自行把 order 改為 `paid` 或 report 改為 `unlocked`。
- [ ] 管理員確認付款時，order 與 report 在同一 transaction 更新。
- [ ] 付款確認後建立 audit log。
- [ ] 非管理員無法進入 admin route 或讀取 admin-only tables。

### 品牌隔離

- [ ] Chart Navigator 的環境變數只指向 Chart Navigator Supabase 專案。
- [ ] Schema 與應用程式不含 BodyFix / Space Guide 的個人資料表或查詢。
- [ ] 文件與部署設定不要求跨品牌 service-role key。

## 13. 實作順序

### Phase 0｜專案地基

1. 建立獨立 Chart Navigator repo、Supabase project 與環境。
2. 建立 schema、migration、RLS 與 RLS 測試。
3. 建立 admin bootstrap 流程。

### Phase 1｜免費閉環

1. Google Login。
2. 出生資料表單。
3. 三盞燈摘要產生、版本保存與查看。
4. 個人帳戶頁。

### Phase 2｜LINE 與付費驗證

1. LINE / LIFF 登入與 friendship status。
2. Rahu / Ketu 鎖定報告。
3. Pending order 與人工付款確認。
4. Admin 訂單頁與 audit log。

### Phase 3｜驗證後再做

1. 綠界付款連結。
2. 自動 webhook 解鎖。
3. LINE Pay。
4. SADM 與其他報告。

進入 Phase 3 前，至少應先檢視完成出生資料率、免費摘要完成率、解鎖點擊率、付款率與人工處理成本。

## 14. 明確不做的架構捷徑

- 不把 Chart Navigator 表新增進 BodyFix Supabase project。
- 不把 LINE Login 描述為自動加好友。
- 不讓前端持有 service-role key 或直接解鎖報告。
- 不以 `unlocked: boolean` 作為唯一付款與權限紀錄。
- 不在付款尚未驗證前先做多家金流。
- 不把報告描述為完整吠陀占星論命。

