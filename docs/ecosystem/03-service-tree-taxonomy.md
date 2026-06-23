# 03-service-tree-taxonomy.md

**spec_pack_version:** 0.3.1
**document_version:** 0.3.1
**document_status:** draft
**effective_from:** null
**updated_at:** 2026-06-23
**approved_by:** null

## 1. 文件目的

建立 Gavin Ecosystem 的多維分類法，讓同一個項目可以同時擁有：

- 結構歸屬
- 交付類型
- 商業形式
- 客戶旅程角色
- 方案層級
- 可見範圍
- 公開操作能力
- Lifecycle

作為後續服務設計、AI Router、CRM、Entitlement、Pulse 與 Catalog 的共同語言。

## 2. 適用範圍

適用於：

- ecosystem
- domain
- service_line
- service
- product
- content_asset
- internal_protocol
- offer
- package
- addon
- subscription
- free_offer

## 3. 非目標

本文件不：

- 維護價格真值
- 定義 SQL 或資料表
- 決定 Consent 與 Permission 細節
- 直接建立 Catalog
- 自行確認 Space Guide 與頭眼頸重校準的待決狀態

價格、pricing_model、正式代碼與 status 由 service-catalog.json 管理。

## 4. 隱喻與技術實體

| 隱喻 | 技術實體 |
|---|---|
| 整座森林 | ecosystem |
| 主要服務樹 | domain |
| 樹幹與主要枝條 | service_line |
| 客戶實際取得的內容 | deliverable |
| 可購買或取得的商業項目 | offer |

技術欄位不得使用 forest_id、tree_id 或 branch_id。

## 5. Structural Hierarchy

### ecosystem
整體共根生態，目前為 `gavin_ecosystem`。

### domain
具有獨立問題空間、專業邊界與前台識別的服務系統。

### service_line
Domain 內穩定且可重複維護的主要服務方向。

結構關係原則：

```text
ecosystem
└─ domain
   └─ service_line
```

## 6. Deliverable Type

### service
主要依賴人員、時間與服務流程完成的交付單位。

### product
可由系統、文件、內容或實體物相對獨立交付。

`product_type`：

- physical_product
- digital_product
- report_product
- tool_product

正式使用：

```text
deliverable_type = product
product_type = digital_product
```

不得直接把 digital_product 當作 deliverable_type。

### content_asset
可重複使用的教育、溝通或內容資產，例如滑圖、文章、影片、案例與測驗內容。

### internal_protocol
只供內部使用或尚未成為正式公開交付項目的方法、流程與技術模組。

## 7. Offer 正式定義

Offer 是客戶可以購買或取得的商業項目。

Deliverable 回答「客戶得到什麼」。

Offer 回答「客戶目前可以怎麼取得或購買」。

Offer 核心欄位方向：

- offer_id
- internal_entity_id
- owning_domain
- primary_service_line
- commercial_form
- deliverable_ref
- components
- pricing_ref
- customer_journey_role
- offer_tier
- audience_scope
- public_capabilities
- status

## 8. Commercial Form

- single_offer
- package
- addon
- subscription
- free_offer
- not_sellable

Commercial form 是 Offer 的屬性，不是 deliverable type。

## 9. Customer Journey Role

- core_offer
- entry_offer
- lead_magnet
- upsell
- cross_sell
- retention_offer
- nurture

Domain 與 internal_protocol 預設為 null。

不得使用未定義值，例如 core_domain、premium_offer、method_development。

## 10. Offer Tier

- entry
- standard
- premium
- vip

Offer tier 只描述商業層級，不取代 customer_journey_role。

## 11. 成立條件

### Domain

- 有明確且持續的問題空間與客群需求
- 有可獨立運作的方法與 SOP
- 有清楚專業邊界
- 有可衡量指標
- 值得長期維護
- 經 Gavin 核准

### Service Line

- 隸屬單一 Domain
- 有清楚問題焦點
- 有穩定方法論
- 能容納多個 Deliverable 或 Offer
- 不只是單一活動名稱

### Service

- 有穩定 internal_entity_id
- 有明確交付單位
- 有 SOP 與安全邊界
- 可被 Offer 引用
- draft / pilot 階段 catalog_code 可為 null
- 正式進入 Catalog、可預約或可購買前，才必須有 catalog_code 與核准

### Product

- 有穩定 internal_entity_id
- 有明確 product_type 與交付形式
- 可獨立或半獨立交付
- 有品質與版本管理
- draft / pilot 階段 catalog_code 可為 null
- 正式進入 Catalog、可購買前，才必須有 catalog_code 與核准

### Internal Protocol

- 有明確方法與內部 SOP
- 仍在 validating 或只供內部使用
- 不可因被提及就自動成為公開 Service
- 預設 not_sellable

### Content Asset

- 有明確目標客群與使用情境
- 可重複使用
- 可支援多個 Service Line
- 不因是 lead magnet 就改變 deliverable type

### Offer

- 有 owning_domain
- 有明確 commercial_form
- 有 deliverable_ref 或 components
- 有 pricing_ref 或明確 free / not_sellable
- 有 audience_scope、public_capabilities 與 status
- 正式公開前需完成 Catalog 核准

## 12. Structural Owner、Primary Parent 與 Relationship

每個項目可有：

- owning_domain
- optional primary_service_line

同時可有多對多 relationships：

- supports
- related_to
- derived_from
- used_by
- bundled_with
- replaces

parent / owner 表示主要歸屬。

relationship 表示其他支援或關聯，不得只用 parent_id 表達所有關係。

## 13. Package Components

Package 不得被強制隸屬單一 service_line。

`components[]` 至少支援：

- component_ref_type = offer | deliverable | entitlement_grant
- component_ref_id
- quantity
- unit
- entitlement_rule

### 24＋12 範例

```text
owning_domain = bodyfix
commercial_form = package
customer_journey_role = core_offer
offer_tier = premium

entitlement grants:
- training = 24 sessions
- fascia_time = 24 × 30-minute units
```

Package 定義組合。

customer_entitlement 記錄客戶取得的權益。

usage_ledger 記錄實際扣除與剩餘。

## 14. Service、Offer、Entitlement 與 Usage Ledger

### Service / Product
定義交付內容與單位。

### Offer
定義客戶如何取得、購買與組合。

### Customer Entitlement
記錄客戶可使用的 sessions、minutes、credits 或 access rights。

### Usage Ledger
記錄每次使用、扣除、調整、剩餘與來源。

不得把「客戶剩餘幾次」寫在 Service definition 裡。

## 15. Internal Entity ID 與 Catalog Code

- 所有 Entity 必須有穩定 `internal_entity_id`。
- draft / pilot 可以 `catalog_code = null`。
- 正式進入 Catalog、可預約或可購買前，才必須完成：
  - catalog_code
  - SOP
  - 安全邊界
  - Catalog 核准
- 顯示名稱不是穩定識別碼。

## 16. Lifecycle

### Domain
candidate → incubating → active ↔ paused → retired

### Service Line
draft → pilot → active ↔ paused → retired

### Service / Product / Offer
draft → pilot → active ↔ paused → retired

### Internal Protocol
draft → validating → approved → deprecated

### Content Asset
draft → published → archived

- paused 可恢復。
- retired 表示不再接受新交易。
- deprecated 表示方法或版本不再建議使用，但可能需保留歷史。
- archived 表示內容封存。

## 17. Audience Scope

- internal
- restricted
- public

## 18. Public Capabilities

- describable
- bookable
- purchasable

Audience scope 與 public capabilities 分開。

archived 不屬於 Visibility，由 lifecycle 管理。

## 19. Package Domain 邊界

- Package 可以跨同一 Domain 內的多個 service_line。
- 跨 Domain package 預設不允許。
- 跨 Domain package 必須經 Governance、專業邊界、Referral、Consent、Permission 與價格政策個別核准。
- 不得因為共根就自動建立跨 Domain 套票。

## 20. 五問分類模型

對每個新項目，分別回答：

1. 它在生態中的 structural level 是什麼？
2. 客戶或內部實際取得的 deliverable type 是什麼？
3. 它如何被販售、取得或組合？
4. 它在客戶旅程中扮演什麼角色？
5. 它的 offer tier、audience scope、public capabilities 與 lifecycle 是什麼？

不得要求一個項目只能被分類一次。

## 21. 目前項目多維分類表

| 項目 | Structural | Deliverable Type | Product Type | Commercial Form | Journey Role | Offer Tier | Audience Scope | Public Capabilities | 備註 |
|---|---|---|---|---|---|---|---|---|---|
| BodyFix | domain | null | null | null | null | null | public | describable | active |
| Body Reset | service_line | null | null | null | null | null | public | describable | BodyFix |
| Pelvic Core | service_line | null | null | null | null | null | public | describable | BodyFix |
| Movement Integration | service_line | null | null | null | null | null | public | describable | BodyFix |
| 單堂動作整合 | null | service | null | single_offer | core_offer | standard | public | describable, bookable | BF-MI-001 |
| 12 / 24 / 36 堂方案 | null | service entitlement | null | package | core_offer | standard | public | describable, purchasable | 引用 Catalog |
| 24＋12 | null | service entitlements | null | package | core_offer | premium | public | describable, purchasable | BodyFix 內跨 Service Line |
| 頭眼頸重校準 | null | internal_protocol | null | not_sellable | null | null | REQUIRES_GAVIN_CONFIRMATION | REQUIRES_GAVIN_CONFIRMATION | 不可直接購買 |
| 硬撐型身體測驗 | null | content_asset | null | free_offer | lead_magnet | entry | public | describable | BodyFix |
| Chart Navigator | domain | null | null | null | null | null | public | describable | active |
| Space Guide | domain | null | null | null | null | null | restricted | describable | incubating |
| Space Guide 自動解鎖工具 | null | product | digital_product | single_offer | entry_offer | entry | public | describable, purchasable | 暫定，REQUIRES_GAVIN_CONFIRMATION |

## 22. 正確案例與反例

### 24＋12

正確：

- Package Offer
- owning_domain = BodyFix
- 跨 BodyFix 內部 Service Line
- 以 Entitlement Grant 記錄權益

錯誤：

- 當成單一 Service
- 強制隸屬單一 Service Line
- 直接改成 BodyFix + Chart Navigator 跨 Domain 套票

### 身體測驗

正確：

```text
deliverable_type = content_asset
commercial_form = free_offer
customer_journey_role = lead_magnet
```

錯誤：

- 把 lead_magnet 當成 deliverable type

### Space Guide 工具

暫定：

```text
deliverable_type = product
product_type = digital_product
commercial_form = single_offer
customer_journey_role = entry_offer
offer_tier = entry
```

最終分類仍需 Gavin 確認。

## 23. 與 Service Catalog 的關係

`service-catalog.json` 是目前 service definition、product definition 與 sellable offer 的唯一正式機器可讀來源。

使用 `catalog_item_type` 區分：

- service_definition
- product_definition
- offer

03 只定義分類法，不重複維護價格真值。

目前建議 Catalog 支援：

- catalog_item_type
- delivery_type
- product_type
- commercial_form
- customer_journey_role
- offer_tier
- owning_domain
- primary_service_line
- components
- audience_scope
- public_capabilities
- status

是否拆分或遷移為 `offer-catalog.json`，由 09 Governance 決定。

## 24. 驗收條件

Gavin 確認：

- 多維分類模型
- Offer / Deliverable 區分
- Package 組合規則
- Entitlement 邊界
- Visibility 拆分
- Lifecycle
- 跨 Domain Package 預設禁止
- Catalog 關係

## 25. 待確認事項

- Space Guide 自動化工具最終 deliverable_type、product_type 與 journey role。
- 頭眼頸重校準的 audience_scope 與 public_capabilities。
- service-catalog.json 是否以及何時遷移為 offer-catalog.json。
- 各 Offer tier 的正式商業定義。

## 26. 版本紀錄

### 0.3.1
- 改為多維分類模型。
- 補上 Product、Offer、Offer Tier 與 Customer Journey Role。
- 拆分 Audience Scope 與 Public Capabilities。
- 區分 Internal Entity ID 與 Catalog Code。
- Package 支援 Entitlement Grant 與同 Domain 跨 Service Line。
- 鎖定跨 Domain Package 預設不允許。
