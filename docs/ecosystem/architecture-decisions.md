---
title: "Architecture Decisions"
domain: ecosystem
visibility: internal
status: canonical
type: decision-record
version: 0.1.0
created_at: 2026-06-25
updated_at: 2026-06-25
source: "phase-2-markdown-calibration"
---

# Architecture Decisions｜目前有效架構決策

本文件只記錄已接受且目前有效的決策。未決、衝突或待人工確認事項記錄於 [`conflicts.md`](./conflicts.md)。

```yaml
decision_id: ADR-001
title: Gavin Shared-Root Ecosystem｜共根森林為最高層架構
status: accepted
date: 2026-06-25
context: BodyFix、Chart Navigator、Space Guide 與未來專業領域需要共同的最高層語言，但不能被任一單一品牌吸收。
decision: Gavin Shared-Root Ecosystem 是最高層跨領域架構；共根森林是其主要隱喻與組織方式。
consequences: BodyFix OS、BodyFix Pulse、Chart Navigator 或 Space Guide 不得被描述為整個生態的最高層。
evidence: docs/ecosystem/shared-root-ecosystem.md; docs/ecosystem/README.md
```

```yaml
decision_id: ADR-002
title: Canopy & Forests → Gavin Loam → Shared Root Network 三層垂直關係
status: accepted
date: 2026-06-25
context: 既有文件曾將品牌、知識層與底層能力並列，造成責任層級不清。
decision: 採用 Canopy & Forests、Gavin Loam、Shared Root Network 的垂直三層關係描述完整架構。
consequences: 對外敘事應先呈現品牌林，再說明知識腐植層，最後說明底層共根能力。
evidence: docs/ecosystem/web-presentation.md; docs/loam/README.md; docs/ecosystem/shared-root-network.md
```

```yaml
decision_id: ADR-003
title: 現階段對外品牌林只有 BodyFix、Chart Navigator、Space Guide
status: accepted
date: 2026-06-25
context: repository 中存在多個歷史名稱與工具名稱，但對外品牌林需要保持清楚。
decision: 現階段對外品牌林限定為 BodyFix、Chart Navigator、Space Guide。
consequences: Gavin Loam、Shared Root Network、BodyFix Pulse、Internal Knowledge Base 與 Published Works 不作為首頁品牌林。
evidence: docs/ecosystem/shared-root-ecosystem.md; docs/ecosystem/web-presentation.md
```

```yaml
decision_id: ADR-004
title: Tarot Status Reading 維持 BodyFix 品牌歸屬
status: accepted
date: 2026-06-25
context: Tarot 相關名稱同時出現在 BodyFix 服務與 Chart Navigator 導航能力語境中。
decision: Tarot Status Reading 作為真人服務與獨立數位產品時維持 BodyFix 品牌歸屬。
consequences: Chart Navigator 不擁有 Tarot Status Reading 品牌；若提供 Tarot 能力，需另以模組或流程能力描述。
evidence: docs/ecosystem/service-ownership-matrix.md; docs/ecosystem/conflicts.md
```

```yaml
decision_id: ADR-005
title: Chart Navigator 可使用 Tarot 當下狀態模組但不擁有 Tarot Status Reading 品牌
status: accepted
date: 2026-06-25
context: Chart Navigator 可能需要在導航流程中使用塔羅作為當下狀態輸入。
decision: Chart Navigator 可以使用 Tarot 當下狀態模組，但不得將 Tarot Status Reading 品牌收編為 Chart Navigator 服務。
consequences: 文件與矩陣需分開列出 BodyFix Tarot Status Reading 與 Chart Navigator Tarot Module。
evidence: docs/ecosystem/service-ownership-matrix.md; docs/ecosystem/conflicts.md
```

```yaml
decision_id: ADR-006
title: Zi Wei Structural Analysis 真人服務歸 BodyFix；排盤、計算與導航能力可由 Chart Navigator 提供
status: accepted
date: 2026-06-25
context: 紫微相關內容可能同時屬於真人服務與工具能力。
decision: Zi Wei Structural Analysis 真人服務歸 BodyFix；排盤、計算與導航能力可由 Chart Navigator 提供。
consequences: 矩陣不得把 BodyFix 真人服務與 Chart Navigator 能力合併為同一列。
evidence: docs/ecosystem/service-ownership-matrix.md; docs/ecosystem/conflicts.md
```

```yaml
decision_id: ADR-007
title: Shared Root Network 只提供底層能力
status: accepted
date: 2026-06-25
context: 共根網絡容易被誤解為前台品牌或無限制資料互通。
decision: Shared Root Network 只提供帳號、資料、權限、付款與報告等底層能力。
consequences: 跨品牌資料使用仍需目的、同意、權限、分類與最小必要原則。
evidence: docs/ecosystem/shared-root-network.md; docs/loam/README.md
```

```yaml
decision_id: ADR-008
title: BodyFix Pulse 現階段只服務 BodyFix
status: accepted
date: 2026-06-25
context: Pulse 具備營運觀測特徵，但目前主要實作與語境落在 BodyFix。
decision: BodyFix Pulse 現階段只服務 BodyFix，不是全生態中央控制台。
consequences: Chart Navigator 或 Space Guide 若需要儀表板，需另立需求與資料邊界。
evidence: docs/ecosystem/service-ownership-matrix.md; docs/bodyfix-pulse-v1.md
```

```yaml
decision_id: ADR-009
title: Gavin Loam 是知識腐植與方法代謝層
status: accepted
date: 2026-06-25
context: Loam 容易被誤解為公開品牌或原始個人資料儲存區。
decision: Gavin Loam 是知識腐植與方法代謝層，不是公開品牌或個人資料儲存區。
consequences: Loam 僅接收合法用途、適當授權、資料最小化、去識別化並經人工審核的材料。
evidence: docs/loam/README.md
```

```yaml
decision_id: ADR-010
title: Published Works 是現階段 canonical 功能名稱
status: accepted
date: 2026-06-25
context: Gavin Books 既有文件存在，但目前需區分功能名稱與可能品牌名稱。
decision: Published Works 是現階段 canonical 功能名稱；Gavin Books 保留歷史脈絡。
consequences: 不刪除、不重新命名、不覆寫 docs/publishing/gavin-books.md；未來是否升級 Gavin Books 需另立決策。
evidence: docs/publishing/published-works.md; docs/publishing/gavin-books.md
```

```yaml
decision_id: ADR-011
title: 原始個人資料不得自動進入 Gavin Loam
status: accepted
date: 2026-06-25
context: 服務與工具互動紀錄可能包含身體、健康、命盤、抽牌與敏感服務資料。
decision: 原始個人資料不得自動進入 Gavin Loam。
consequences: 任何進入 Loam 的材料必須先完成隱私權、目的、同意、最小化、去識別化與人工審核。
evidence: docs/loam/README.md
```

```yaml
decision_id: ADR-012
title: Loam 內容不得自動升級為 Internal Knowledge Base
status: accepted
date: 2026-06-25
context: Loam 保存沉澱材料與未成熟框架，Internal Knowledge Base 保存正式現行規則。
decision: Loam 內容不得自動升級為 Internal Knowledge Base。
consequences: Internal Knowledge Base 內容需人工審核、驗證與定稿；未經審核不得直接公開。
evidence: docs/loam/README.md; docs/knowledge-base/README.md
```
