---
title: "Gavin Shared-Root Ecosystem 文件架構總覽"
domain: ecosystem
visibility: internal
status: draft
type: framework
version: 0.1.0
created_at: 2026-06-24
updated_at: 2026-06-24
source: "codex-docs-calibration"
---

# Gavin Shared-Root Ecosystem 文件架構總覽

本文件是本次文件層級校準的入口。它只定義名稱、角色、文件邊界與後續整理建議，不建立或修改 Supabase schema、API、登入、付款、預約、前台 UI 或任何現有營運功能。

## 1. 本次實際檢查範圍

使用 `rg` 檢查以下名稱在 repository 中的使用狀況：BodyFix、Chart Navigator、Space Guide、Shared Root Network、BodyFix Pulse、Internal Knowledge Base、Gavin Library、Gavin Lab、Gavin Loam、Gavin Books、Shared-Root Ecosystem。

實際檢查到的主要目錄與文件類型：

- `docs/`：既有文件包、BodyFix Pulse、AI Copilot、Codebook、部署與公開品牌邊界文件。
- `docs/ecosystem/`：既有 Gavin Ecosystem / Shared-Root Ecosystem 架構草案與 Gavin Loam 文件。
- `app/`：前台頁面、後台頁面、Pulse、Clinic、Chart Navigator、Space Guide 相關路由文字。
- `components/`：Pulse 與 Space Guide 元件文字。
- `lib/`：BodyFix AI prompt、BodyFix payment、Pulse、Space Guide 相關程式文字。
- `supabase/`：BodyFix schema、Codebook、Pulse、Booking、Clinic、Location Demand 等 SQL 文件。
- `public/`：BodyFix 靜態頁、品牌資產與字型說明。

本次修改只落在 `docs/` 下的 Markdown 文件。

## 2. 名稱使用狀況盤點摘要

| 名稱 | 目前觀察到的主要位置 | 目前判斷 |
|---|---|---|
| BodyFix | `docs/`、`app/`、`lib/`、`supabase/`、`public/` 大量出現 | 已是 active 專業森林與目前正式開放服務主線；同時也是現有 OS、Clinic、Pulse 的主要實作範圍。 |
| Chart Navigator | `docs/ecosystem/`、`app/website/`、`app/gavin-astrology/`、`app/clinic/sop/chart-navigator/`、`supabase/codebook-*` | 是平行專業森林；前台仍多處標記 Coming Soon 或測試/學習階段，不能被 BodyFix 吸收成子品牌。 |
| Space Guide | `docs/ecosystem/`、`app/space-june/`、`components/space-june/`、`lib/space-june/` | 是平行專業森林；目前多以 Space June / Space Guide incubating 工具形式存在。 |
| Shared Root Network | `docs/ecosystem/` 既有文件提及 | 應明確限定為底層連接與資料傳輸，不是前台服務品牌，也不是無限制資料互通。 |
| BodyFix Pulse | `docs/bodyfix-pulse-v1.md`、`docs/ecosystem/`、`app/admin/pulse/`、`components/pulse/`、`lib/pulse/`、`supabase/pulse-v1.sql` | 目前應定義為 BodyFix 的營運與決策觀測中心；不升格成全生態唯一控制台。 |
| Internal Knowledge Base | `docs/ecosystem/10-gavin-loam-and-knowledge-lifecycle.md` | 應定義為正式現行規則的保存處；需人工審核與定稿。 |
| Gavin Loam | `docs/ecosystem/10-gavin-loam-and-knowledge-lifecycle.md` | 是知識腐植層；保存沉澱材料與未成熟框架，不等同正式規格。 |
| Gavin Books | `docs/ecosystem/10-gavin-loam-and-knowledge-lifecycle.md` | 是成熟出版結果，不是原始資料庫。 |
| Gavin Library | 本次 `rg` 未在非 `node_modules` 範圍找到正式使用 | 可保留為歷史名稱收攏規則；不得作為最高層知識系統名稱。 |
| Gavin Lab | 本次 `rg` 未在非 `node_modules` 範圍找到正式使用 | 可保留為實驗、測試、研究流程的內容類型或欄目名稱；不得作為最高層知識系統名稱。 |
| Shared-Root Ecosystem / Shared Root Ecosystem | `docs/ecosystem/` | 已有概念基礎，但需新增簡明入口與術語統一文件。 |

## 3. 名稱衝突與角色重疊清單

1. **Gavin Ecosystem vs Gavin Shared-Root Ecosystem**：既有文件仍使用 Gavin Ecosystem 作為簡稱；正式最高層名稱應校準為 Gavin Shared-Root Ecosystem，Gavin Ecosystem 只可作為內部簡稱或歷史語境。
2. **BodyFix OS vs Gavin Shared-Root Ecosystem**：BodyFix OS 是現有產品與後台實作語境，不應被理解為整個跨領域生態的最高層。
3. **BodyFix Pulse vs ecosystem dashboard**：既有文件曾規劃 Pulse dashboard 類主題；現階段 BodyFix Pulse 只代表 BodyFix 的營運與決策觀測中心，其他森林是否共用需後續評估。
4. **Shared Root Network vs CRM / AI Router / Login / Payment 實作**：Shared Root Network 只定義底層連接與傳輸角色；本次不建立技術實作，也不代表資料無限制互通。
5. **Gavin Loam vs Internal Knowledge Base**：Loam 是沉澱與養分層，Internal Knowledge Base 是正式現行規則層；Loam 內容不得自動成為正式 SOP、價格或資料規格。
6. **Gavin Books vs Library / Loam**：Gavin Books 是經編輯、驗證與定稿的出版結果，不是原始材料存放區，也不是所有可讀內容的總稱。
7. **Gavin Library / Gavin Lab 歷史名稱**：不得作為最高層知識系統；需依內容成熟度分流到 Gavin Loam、Internal Knowledge Base、Public Shelf / Library 功能名稱或各森林研究文件。

## 4. 建議文件目錄結構

目前 `docs/ecosystem/` 已存在 00～10 文件包，因此本次不大規模搬移既有檔案，只新增入口與邊界文件：

```text
docs/
├─ ecosystem/
│  ├─ README.md
│  ├─ shared-root-ecosystem.md
│  ├─ shared-root-network.md
│  ├─ operations-decision-layer.md
│  └─ terminology.md
│
├─ knowledge-base/
│  └─ README.md
│
├─ loam/
│  └─ README.md
│
└─ publishing/
   └─ gavin-books.md
```

## 5. 本次修改檔案列表

- `docs/ecosystem/README.md`
- `docs/ecosystem/shared-root-ecosystem.md`
- `docs/ecosystem/shared-root-network.md`
- `docs/ecosystem/operations-decision-layer.md`
- `docs/ecosystem/terminology.md`
- `docs/knowledge-base/README.md`
- `docs/loam/README.md`
- `docs/publishing/gavin-books.md`

## 6. 後續建議但本次未執行

- 不自動搬移既有 00～10 ecosystem 文件；下一階段可由 Gavin 決定是否重新編號或合併。
- 不修改任何 `app/`、`lib/`、`supabase/`、`components/` 或 `public/` 內容；下一階段如需前台文字調整，應另開 UI / product copy 任務。
- 不把 BodyFix Pulse 擴充為全生態控制台；若 Chart Navigator 或 Space Guide 需要營運儀表板，應先建立各自需求與資料邊界。
- 不建立 Gavin Loam 公開網站；若要公開內容，應先經人工審核並分流到 Public Content 或 Gavin Books。
- 不把 Gavin Library / Gavin Lab 歷史內容批次搬移；下一階段可先做逐檔 mapping 表，再人工確認。
