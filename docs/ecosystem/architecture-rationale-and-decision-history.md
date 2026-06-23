# Architecture Rationale and Decision History
**spec_pack_version:** 0.3.1
**document_status:** draft
**updated_at:** 2026-06-23

## 1. 最初問題

早期描述曾把 BodyFix、Chart Navigator、Space Guide 稱為三座森林。這會造成尺度失真：

```text
生態 → 森林 → 三座森林 → 每座森林再有樹
```

因此曾改為「一座森林、多棵服務樹」，後續再遷移為 Gavin Shared-Root Ecosystem、多個平行專業森林與 service_line 服務之樹。

## 2. 鎖定架構

```text
Gavin Shared-Root Ecosystem
├─ BodyFix domain / parallel professional forest
│  └─ service_line as service trees
├─ Chart Navigator domain / parallel professional forest
│  └─ service_line as service trees
├─ Space Guide domain / parallel professional forest
│  └─ service_line as service trees
├─ Gavin Loam / knowledge humus layer
└─ Future Domains
```

- Gavin Ecosystem 是整體共根生態。
- BodyFix、Chart Navigator、Space Guide 是平行專業森林，且 domain 仍是正式技術實體名稱。
- BodyFix 不是 Chart Navigator 的母品牌。
- Chart Navigator 不是與 BodyFix 完全無關的孤立品牌。
- Space Guide 目前為 incubating。
- 未來服務樹數量不寫死。

## 3. 文件架構演進

初期八份文件缺少：

- 總索引與裁決規則
- 身份、同意、權限與稽核
- 治理、版本與遷移
- 機器可讀 Catalog
- 正確依賴順序

因此擴充為 00～09：

1. 00 索引與決策紀錄
2. 01 生態憲法
3. 02 Domain 與 Public Identity
4. 03 服務與 Offer 分類
5. 04 身份、資料與 Consent
6. 05 Referral 與 Permission
7. 06 AI Routing 與 Guardrails
8. 07 Pulse Dashboard
9. 08 Website IA
10. 09 Governance、版本與遷移

## 4. Source of Truth 改為分領域管理

00 是導航與決策紀錄，不是凌駕所有文件的最高權威。

各領域由對應文件或 Catalog 管理：

- 生態哲學：01
- Domain 與公開識別：02
- 分類法：03
- 身份與 Consent：04
- Referral 與 Permission：05
- AI Routing：06
- Pulse：07
- Website IA：08
- Governance：09
- 代碼、價格、pricing model、status：service-catalog.json

## 5. 依賴關係改為 DAG

不是單一直線。主要內容依賴：

- 01 → 02、04
- 02 → 03、05、06、08
- 03 → 06、07、08
- 04 → 05、06、07
- 05 → 06、07
- 06 → 07、08
- 09 橫向治理 00～08 與所有 Catalog

## 6. 03 分類法的核心修正

初版把 domain、service、package、content_asset、lead_magnet 混成單一 entity_type。

最終改為多維模型：

- Structural hierarchy
- Deliverable type
- Commercial form
- Customer journey role
- Offer tier
- Audience scope
- Public capabilities
- Lifecycle

同一個項目可以同時是：

```text
deliverable_type = content_asset
commercial_form = free_offer
customer_journey_role = lead_magnet
```

Package 可跨同一 Domain 內多個 service line，但跨 Domain package 預設不允許。

## 7. 04 身份與 Consent 的核心修正

統一身份不等於資料自動互通。

正式分離：

- customer_profile
- customer_identity
- customer_alias
- customer_contact_point
- customer_domain_context
- duplicate_candidate
- customer_identity_link
- profile_merge_event
- consent_record
- referral_record
- audit_log
- access_log

新舊 LINE OA 必須保留不同 provider_account_id 與 source_channel。

Identity 來源至少以以下組合識別：

```text
identity_provider
+ provider_account_id
+ external_user_id
```

顯示名稱、暱稱或頭像只能產生 duplicate_candidate，不可自動連結或合併。

## 8. Consent 與 Permission 原則

- 跨 Domain 分享預設 false。
- unknown、expired、revoked 視為不可分享。
- AI 不得推測 Consent。
- Permission 採 deny by default。
- Profile Merge 不得擴張 Consent。
- 有效存取必須同時符合 purpose、Consent、Permission、Data Classification、最小必要與 Domain 範圍。
- AI 與 Log 均採 Payload Minimization。

## 9. Codex 分階段進場

### 第一階段
00～04 docs-only PR。

### 第二階段
05、06 核准後，建立機器可讀 Catalog 與測試資料。

### 第三階段
Router、Consent、Identity 與 Webhook 規格核准後，才修改正式程式與資料庫。

## 10. 已棄用說法

不得再引用：

- BodyFix、Chart Navigator、Space Guide 是三座獨立森林。
- Chart Navigator 是 BodyFix 子品牌。
- 共根表示所有資料無限制互通。
- CRM tag 可作為 Consent 或 Permission 證據。
- 相似姓名或暱稱可自動合併客戶。
- 一個全域 boolean 可代表所有跨域 Consent。
- forest_id、tree_id、mycelium_customer 等技術欄位。
