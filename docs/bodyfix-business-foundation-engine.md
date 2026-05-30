# BodyFix Business Foundation Engine

BodyFix Business Foundation Engine 是 BodyFix 內部可重複使用的 TypeScript 商業規則層。它把產品階梯、人才階梯、員工權限、客戶來源與歸屬、抽成、轉介獎金、單次服務試算與月營收試算集中成一組純規則模組。

## 本模組用途

本模組的定位是「商業規則腦」，不是新的前台或後台功能。它提供：

1. 產品階梯與服務定義。
2. 人才階梯與操作權限。
3. 客戶來源與歸屬規則。
4. 員工抽成規則。
5. 轉介獎金規則。
6. 單次服務淨利試算。
7. 月營收與損益試算。

## 目前不接資料庫

目前所有設定都放在 `src/bodyfix-foundation/config.ts`，以 TypeScript 常數表示。不讀寫 Supabase、不建立 migration、不依賴任何資料表。

## 目前不做前端

本模組沒有新增頁面、表單、後台或前台 UI。範例只放在 `examples/bodyfix-foundation-example.ts`，用 `console.log` 示範計算結果。

## service_code 對齊 Booking / Clinic / Location Demand

本模組使用既有系統的 `service_code` 命名方式，例如：

- `fascia_chain_reset_60`
- `fascia_line_selected_reset_60`
- `multi_line_reset_90`
- `pelvic_core_reset_60`
- `pelvic_core_advanced_120`
- `training_24_plus_12_bundle`
- `grooming_interest`

這些代碼避免回到舊版大寫 `ServiceId`，讓 Booking、Clinic、Location Demand 與商業規則層可以用同一套服務代碼溝通。

## Grooming 目前是 interest only

`grooming_interest` 目前只代表「熱蠟除毛 / Grooming 興趣登記」。它的狀態是 `interest_only`，營收模式是 `not_open`，不是正式可操作或可試算的收費服務。

因此：

- L1 Grooming 籌備助理不能操作 `grooming_interest`。
- 權限檢查會擋下非 `active` 服務。
- 計算器會拒絕自動計算 `grooming_interest`。

## 員工權限邏輯

權限模組提供：

- `getStaffRank(staffLevelId)`
- `canOperateService(staffLevelId, serviceCode)`
- `listAllowedServices(staffLevelId)`
- `assertCanOperateService(staffLevelId, serviceCode)`

判斷原則：

1. 服務狀態必須是 `active`。
2. `grooming_interest` 即使存在於產品階梯，也不可視為正式可操作服務。
3. 員工 rank 必須大於或等於服務最低 rank。
4. `GAVIN_ONLY` 服務只有 `GAVIN_ONLY` 層級可以自動通過。
5. `CASE_BY_CASE` 不會被自動授權。
6. 員工層級的 `canOperateServiceCodes` 必須包含該服務代碼。

## 客戶歸屬原則

客戶歸屬規則由 `CUSTOMER_OWNERSHIP_RULES` 管理：

- `bodyfix_official`：官方 IG、官網、LINE、預約系統導入者，客戶主檔歸 BodyFix，必須進 CRM 與官方收款。
- `staff_own`：員工自帶客為共享歸屬；可提高抽成，但只要使用 BodyFix 場域、品牌或系統，就必須進 BodyFix CRM 與官方收款。
- `partner_referral`：合作講師或外部合作導入者，依合作合約個案拆分。
- `student_own`：學員回自己場域服務自己的客戶，客戶歸學員，BodyFix 收課程、認證或授權費。

核心原則是：抽成可以大方，但客戶主檔、預約、收款、紀錄與 CRM 必須進 BodyFix 系統。

## 抽成邏輯

抽成規則由 `COMMISSION_RULES` 管理。一般可自動計算的服務使用 `service_commission`，且 `employeeRate + bodyfixRate` 必須等於 1。

若任一比例為 `null`，代表該規則是 `case_by_case`，不可由計算器自動計算，例如：

- `pelvic_core_advanced_120`
- `training_24_plus_12_bundle`

## 轉介獎金邏輯

轉介獎金規則由 `REFERRAL_BONUS_RULES` 管理，目前提供每個目標服務的最低、最高與建議獎金：

- 轉成 `fascia_chain_reset_60`：建議 500 TWD。
- 轉成 `multi_line_reset_90`：建議 1000 TWD。
- 轉成 `pelvic_core_reset_60`：建議 1200 TWD。
- 轉成 `training_24_plus_12_bundle`：建議 3000 TWD。

計算器支援在單次服務輸入 `referralBonusTwd`，並從 BodyFix 毛分潤中扣除。

## 單次與月營收試算邏輯

`calculateServiceProfit(input)` 會：

1. 找到服務。
2. 確認服務為 `active`。
3. 確認服務營收模式為 `service_commission`。
4. 拒絕 `grooming_interest`。
5. 檢查員工是否可操作服務。
6. 找到可用抽成規則。
7. 計算員工支出與 BodyFix 毛分潤。
8. 扣除材料、行政、場地與轉介獎金。
9. 回傳 BodyFix 單次淨利。

`calculateMonthlyProjection(input)` 會：

1. 先用 `calculateServiceProfit` 算單次結果。
2. 乘上 `monthlySessions`。
3. 扣除 `monthlyFixedCostTwd`。
4. 計算損益兩平堂數 `breakEvenSessions`。
5. 回傳每月總收入、員工支出、變動成本、固定成本與 BodyFix 月淨利。
