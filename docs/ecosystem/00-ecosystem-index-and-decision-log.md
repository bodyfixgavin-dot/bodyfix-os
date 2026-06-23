# 00-ecosystem-index-and-decision-log.md

**spec_pack_version:** 0.3.1
**document_version:** 0.3.1
**document_status:** draft
**effective_from:** null
**updated_at:** 2026-06-23
**approved_by:** null

## 文件包目的

作為 Gavin 共根生態的導航、狀態追蹤與決策紀錄中心，確保 00～09 文件維持一致的層級、命名與依賴關係。

本文件不是所有領域的最高權威。每個領域由 Source of Truth Matrix 指定的文件或 Catalog 負責。

## 分領域 Source of Truth Matrix

| 領域 | Source of Truth | 狀態 | 說明 |
|---|---|---|---|
| 生態哲學與不可動原則 | 01-gavin-ecosystem-constitution.md | draft | 最高層原則 |
| Domain 與 Public Identity | 02-domain-and-public-identity-architecture.md | draft | 平行服務系統定位 |
| 服務與 Offer 分類 | 03-service-tree-taxonomy.md | draft | 多維分類模型 |
| 身份、資料與 Consent | 04-shared-root-identity-data-and-consent.md | draft | customer_profile 與 Consent 模型 |
| Referral 與 Permission | 05-cross-domain-referral-and-permission-policy.md | not_yet_authored | 轉介與權限規則 |
| AI Routing 與 Guardrails | 06-ai-reception-routing-and-guardrails.md | not_yet_authored | 多 Domain Router 與 guardrail |
| Pulse 指標 | 07-pulse-ecosystem-dashboard.md | not_yet_authored | 生態決策指標 |
| Website IA | 08-website-information-architecture.md | not_yet_authored | 入口與導覽原則 |
| Governance、版本與遷移 | 09-governance-versioning-and-migration.md | not_yet_authored | 版本控管與流程 |
| 服務代碼、名稱、價格、pricing model、status 與 Catalog 項目 | service-catalog.json | existing / to_be_normalized | 以 catalog_item_type 區分 service_definition、product_definition、offer |

## 文件依賴 DAG

```text
01 ──→ 02 ──→ 03
│      │      ├──→ 06
│      │      ├──→ 07
│      │      └──→ 08
│      ├──→ 05
│      ├──→ 06
│      └──→ 08
└──→ 04 ──→ 05 ──→ 06
       │       └──→ 07
       ├──→ 06
       └──→ 07

09 橫向治理 00～08 與所有 Catalog。
```

## 文件優先級與衝突裁決

1. 先判斷衝突屬於哪一個領域。
2. 依 Source of Truth Matrix 使用該領域正式來源。
3. service code、價格、pricing model、status 以 service-catalog.json 為準。
4. 文件狀態為 approved 的版本優先於 draft。
5. 同狀態衝突時，以較新 document_version 為準。
6. 無法判斷時標記 `REQUIRES_GAVIN_CONFIRMATION`，不得自行推測。

## 已確認決策

- Gavin Ecosystem 是一座持續生長的共根森林。
- BodyFix、Chart Navigator、Space Guide 是同一座森林中的主要服務樹。
- 服務線是主要枝幹，具體服務、方案、工具與內容產品是枝條、果實與種子。
- 核心句：「各自成樹，彼此成林，地下共生。」
- 共根不代表資料無限制互通。
- BodyFix 不是 Chart Navigator 的母品牌。
- Chart Navigator 不是與 BodyFix 完全無關的孤立品牌。
- 品牌隱喻與技術命名必須分離。
- Markdown 規格與機器可讀 Catalog 分開維護。
- service-catalog.json 是目前 service definition、product definition 與 sellable offer 的唯一正式機器可讀來源，並以 catalog_item_type 區分。
- 00～04 可作為 canonical draft 存入 GitHub。
- 05～09 尚未撰寫，不得由 Codex 自行補完。

## 待 Gavin 確認決策

- public_ecosystem_name。
- 共根來源識別的呈現強度與位置。
- Space Guide 升級為 active 的條件。
- Space Guide 自動化工具最終分類。
- 頭眼頸重校準的 audience_scope 與 public_capabilities。
- service-catalog.json 是否以及何時遷移為 offer-catalog.json。
- cross-domain 分享欄位白名單與預設層級。
- 保存期限、Merge / Unlink 權限與 AI Payload 白名單。
- 24＋12 分期金額。
- 36 堂正式優惠價。
- v1.0 簽核流程。
- Pulse 第一階段指標。

## 已棄用或不得引用

- 三座彼此獨立森林的說法。
- Chart Navigator 是 BodyFix 子品牌。
- BodyFix 包含所有命盤與空間服務。
- 共根等於無限制資料互通。
- CRM tag 可作為 Consent 或 Permission 證據。
- 顯示名稱、暱稱或頭像可自動合併身份。
- 單一全域 boolean 可代表所有跨域 Consent。
- forest_id、tree_id、branch_id、root_nutrient、mycelium_customer 等技術欄位。

## 文件狀態管理

- draft
- approved
- deprecated

由 09 Governance 正式管理。在 09 完成前，所有文件維持 draft。

## 與 AI Knowledge、Service Catalog 與 BodyFix OS 的關係

```text
生態規格文件
↓ 定義原則、邊界與責任
機器可讀 Catalog
↓ 保存正式代碼、價格、狀態與 enum
AI Knowledge
↓ 將正式規則轉為接待與分流語言
BodyFix OS / Codex
↓ 實作程式、資料庫、測試與介面
```

目前 Codex 只能進行 docs-only 落地，不得實作 runtime behavior。
