---
title: "Gavin Shared-Root Ecosystem 文件入口"
domain: ecosystem
visibility: internal
status: draft
type: framework-index
version: 0.2.0
created_at: 2026-06-24
updated_at: 2026-06-25
source: "phase-2-markdown-calibration"
---

# Gavin Shared-Root Ecosystem 文件入口

本文件是目前 ecosystem 文件入口。它只整理 Markdown 文件、名稱邊界、歷史脈絡與後續治理方向，不建立或修改 Supabase schema、API、登入、付款、預約、前台 UI、路由或任何現有營運功能。

## 現行 canonical 文件

| 文件 | 角色 |
|---|---|
| [`shared-root-ecosystem.md`](./shared-root-ecosystem.md) | Gavin Shared-Root Ecosystem 最高層架構與三座對外品牌林。 |
| [`shared-root-network.md`](./shared-root-network.md) | 帳號、資料、權限、付款與報告等底層能力邊界。 |
| [`operations-decision-layer.md`](./operations-decision-layer.md) | 營運與決策層的角色邊界。 |
| [`terminology.md`](./terminology.md) | 正式術語、歷史名稱收攏與層級規則。 |
| [`architecture-decisions.md`](./architecture-decisions.md) | 已接受且目前有效的架構決策。 |
| [`service-ownership-matrix.md`](./service-ownership-matrix.md) | 服務、品牌歸屬、能力提供者與營運狀態矩陣。 |
| [`web-presentation.md`](./web-presentation.md) | 首頁與未來 `/ecosystem` 頁面呈現規格。 |
| [`../loam/README.md`](../loam/README.md) | Gavin Loam 知識腐植層與資料治理流程。 |
| [`../knowledge-base/README.md`](../knowledge-base/README.md) | Internal Knowledge Base 正式知識庫邊界。 |
| [`../publishing/published-works.md`](../publishing/published-works.md) | Published Works canonical 出版功能名稱。 |

## 未決問題與衝突

| 文件 | 角色 |
|---|---|
| [`conflicts.md`](./conflicts.md) | 歷史名稱衝突、責任層級重疊、證據路徑與建議未來決策方向。 |

## 歷史文件與演進證據

下列文件保留既有演進脈絡，不因本次校準刪除、搬移或重新命名：

- [`00-ecosystem-index-and-decision-log.md`](./00-ecosystem-index-and-decision-log.md)
- [`01-gavin-ecosystem-constitution.md`](./01-gavin-ecosystem-constitution.md)
- [`02-domain-and-public-identity-architecture.md`](./02-domain-and-public-identity-architecture.md)
- [`03-service-tree-taxonomy.md`](./03-service-tree-taxonomy.md)
- [`04-shared-root-identity-data-and-consent.md`](./04-shared-root-identity-data-and-consent.md)
- [`10-gavin-loam-and-knowledge-lifecycle.md`](./10-gavin-loam-and-knowledge-lifecycle.md)
- [`architecture-rationale-and-decision-history.md`](./architecture-rationale-and-decision-history.md)
- [`../publishing/gavin-books.md`](../publishing/gavin-books.md)

## 待確認名稱

- **Gavin Books**：保留為歷史出版提案或待確認公開品牌名稱；現階段 canonical 功能名稱是 Published Works。
- **Gavin Library**：不作為最高層知識系統；依內容成熟度收攏到 Gavin Loam、Internal Knowledge Base 或公開內容功能。
- **Gavin Lab**：不作為最高層知識系統；可作為實驗、測試、研究流程的歷史或內容類型名稱。
- **BF Tarot**：需確認是否為歷史名稱、內部簡稱或曾經的產品名。

## 當前架構摘要

```text
Gavin Shared-Root Ecosystem
└─ Canopy & Forests｜對外品牌林
   ├─ BodyFix
   ├─ Chart Navigator
   └─ Space Guide
      ↓
   Gavin Loam｜知識腐植與方法代謝層
      ↓
   Shared Root Network｜帳號、資料、權限、付款與報告等底層能力
```

現階段對外品牌林只有 BodyFix、Chart Navigator、Space Guide。BodyFix Pulse 只服務 BodyFix，不是全生態中央控制台。Published Works 是目前正式出版功能名稱，Gavin Books 保留歷史脈絡。

## 本階段範圍聲明

本階段只建立與校準 Markdown 文件。不修改程式碼、資料庫、UI、路由、API、設定、部署或營運功能。
