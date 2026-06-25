---
title: "正式術語與角色定義"
domain: ecosystem
visibility: internal
status: draft
type: framework
version: 0.1.0
created_at: 2026-06-24
updated_at: 2026-06-25
source: "codex-docs-calibration"
---

# 正式術語與角色定義

## Canonical terms

| Term | 中文 | 正式角色 |
|---|---|---|
| Gavin Shared-Root Ecosystem | Gavin 共根生態架構 | 最高層級跨領域生態架構；不是單一前台產品或服務品牌。 |
| Professional Forests | 專業森林 | BodyFix、Chart Navigator、Space Guide 等平行專業領域。 |
| Service Trees | 服務之樹 | 各專業森林內可被使用、購買或持續培育的服務項目。 |
| Shared Root Network | 地下共根網絡 | 底層連接與資料傳輸層。 |
| Operations & Decision Layer | 營運與決策層 | 觀察營運狀態、資源配置與決策的層級。 |
| BodyFix Pulse | BodyFix Pulse | BodyFix 的營運與決策觀測中心。 |
| Internal Knowledge Base | 正式內部知識庫 | 保存目前正式怎麼做的現行規則。 |
| Gavin Loam | 知識腐植層 | 保存累積材料、觀察、未成熟框架與未定稿內容。 |
| Published Works | 正式出版功能名稱 | 現階段 canonical 功能名稱，包含專題作品、方法手冊、數位小書、白皮書、教材與公開工具包。 |
| Gavin Books | 歷史出版提案／待確認品牌名稱 | 保留既有演進脈絡；是否升級為正式出版品牌需另立決策。 |
| Public Content | 公開內容 | 文章、圖卡、影片或公開工具。 |

## Gavin Library 收攏規則

Gavin Library 不再作為整體知識系統的最高層名稱。

如果現有文件中使用 Gavin Library，依內容判斷：

- 未成熟材料、觀察與草稿 → Gavin Loam
- 已整理且可閱讀的正式內容集合 → 可保留為 Library 或 Public Shelf 的功能名稱
- 正式 SOP 與規則 → Internal Knowledge Base

不要直接刪除歷史內容。

## Gavin Lab 收攏規則

Gavin Lab 不再作為最高層知識系統名稱。

如果內容強調實驗、測試或研究流程，可保留為內容類型或欄目名稱；否則收攏到 Gavin Loam 或各專業森林的研究文件。

## Metadata 最小建議

如 repository 中已有 Markdown Front Matter，沿用現有格式。若沒有，可使用：

```yaml
---
title: ""
domain: ecosystem
visibility: internal
status: draft
type: framework
version: 0.1.0
created_at: 2026-06-24
updated_at: 2026-06-25
source: ""
---
```

欄位定義：

- `domain`：bodyfix、chart-navigator、space-guide、ecosystem
- `visibility`：internal、public
- `status`：raw、draft、distilled、canonical、archived
- `type`：observation、research、framework、sop、spec、article、book
- `version`：文件版本
- `source`：原始來源，例如 chat-session、client-observation、book、research


## Tarot 與 Zi Wei 層級規則

- Tarot Status Reading 作為真人服務與獨立數位產品時維持 BodyFix 品牌歸屬。
- Chart Navigator 可以使用 Tarot 當下狀態模組，但不擁有 Tarot Status Reading 品牌。
- Zi Wei Structural Analysis 真人服務歸 BodyFix。
- 排盤、計算與導航能力可由 Chart Navigator 提供。
