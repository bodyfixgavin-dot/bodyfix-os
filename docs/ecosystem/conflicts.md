---
title: "Ecosystem Conflicts and Open Questions"
domain: ecosystem
visibility: internal
status: draft
type: conflict-log
version: 0.1.0
created_at: 2026-06-25
updated_at: 2026-06-25
source: "phase-2-markdown-calibration"
---

# Conflicts｜衝突、重疊與未決問題

本文件只記錄歷史名稱衝突、責任層級重疊、尚未解決的問題、證據來源與實際路徑，以及建議未來決策方向。本文件不寫入正式決策；正式決策記錄於 [`architecture-decisions.md`](./architecture-decisions.md)。

## 1. BF Tarot / Tarot Status Reading / Chart Navigator Tarot Module

- **衝突類型**：歷史名稱衝突與責任層級重疊。
- **問題**：BF Tarot、Tarot Status Reading 與 Chart Navigator Tarot Module 可能同時指向塔羅相關能力，但層級不同：真人服務、獨立數位產品、導航流程中的當下狀態模組不應互相覆蓋。
- **證據來源與路徑**：`docs/ecosystem/service-ownership-matrix.md`；需後續用程式、路由、SOP 與品牌文件逐一比對。
- **未決問題**：BF Tarot 是否只是歷史名稱、內部簡稱或曾經的產品名，仍需人工確認。
- **建議未來決策方向**：建立 Tarot 命名對照表，分開確認品牌歸屬、服務交付方式與工具能力邊界。

## 2. Zi Wei Structural Analysis / Chart Navigator Zi Wei Capability

- **衝突類型**：責任層級重疊。
- **問題**：Zi Wei Structural Analysis 可作為 BodyFix 真人服務；排盤、計算與導航能力則可由 Chart Navigator 提供。兩者若合併描述，會混淆服務品牌與工具能力。
- **證據來源與路徑**：`docs/ecosystem/service-ownership-matrix.md`；`app/gavin-astrology/` 與 `app/clinic/sop/chart-navigator/` 等路徑需後續按實際內容驗證。
- **未決問題**：哪些紫微相關路由或 SOP 已正式營運，哪些仍為 prototype 或學習材料。
- **建議未來決策方向**：以「真人服務」與「計算／導航能力」兩層建立正式命名規則。

## 3. `app/tests/page.tsx` 混合命名訊號

- **衝突類型**：品牌與測試工具命名混合。
- **問題**：`app/tests/page.tsx` 中出現「BodyFix / Gavin Lab · Public Tools」訊號，可能把 BodyFix、Gavin Lab 與公開工具混在同一層。
- **證據來源與路徑**：`app/tests/page.tsx`。
- **未決問題**：該頁是測試工具、公開工具入口、歷史 prototype 或內部實驗頁，需產品決策確認。
- **建議未來決策方向**：若保留，應明確標註為測試／實驗／公開工具其中之一，並避免誤導為現行對外品牌架構。

## 4. Gavin Books / Published Works canonical 名稱衝突

- **衝突類型**：待確認名稱與歷史名稱衝突。
- **問題**：`docs/publishing/gavin-books.md` 保留 Gavin Books 歷史提案；本階段需要 Published Works 作為現行 canonical 功能名稱。
- **證據來源與路徑**：`docs/publishing/gavin-books.md`；`docs/publishing/published-works.md`。
- **未決問題**：Gavin Books 是否未來升級為正式出版品牌，尚未決定。
- **建議未來決策方向**：另立出版品牌決策，確認 Gavin Books 是否為公開品牌、系列名稱或歷史概念。

## 5. `shared-root-ecosystem.md` 層級並列問題

- **衝突類型**：架構層級重疊。
- **問題**：既有 `shared-root-ecosystem.md` 曾將 Professional Forests、Shared Root Network、Operations & Decision Layer、Internal Knowledge Base、Gavin Loam、Gavin Books / Public Content 並列，可能讓品牌、知識層、底層能力與出版結果看起來同級。
- **證據來源與路徑**：`docs/ecosystem/shared-root-ecosystem.md`。
- **未決問題**：歷史文件是否需要保留原圖作為演進證據，或在未來另建新版架構圖。
- **建議未來決策方向**：以 Canopy & Forests → Gavin Loam → Shared Root Network 作為主要垂直敘事，將 Operations、Knowledge Base 與 Published Works 放回各自責任層。

## 6. SQL seed、路由、SOP 與品牌文件的時間差

- **衝突類型**：證據來源與時間狀態不一致。
- **問題**：SQL seed 的 `active`、路由存在、SOP 文件與品牌文件可能代表不同時間、不同測試階段或不同營運狀態，不能互相直接覆蓋。
- **證據來源與路徑**：`supabase/` SQL 文件、`app/` 路由、`docs/` SOP 與品牌文件。
- **未決問題**：各服務目前是否正式營運，需要最新人工或營運資料確認。
- **建議未來決策方向**：建立 evidence policy，分別記錄來源類型、最後驗證日期與可信度；證據不足時使用 `needs-verification`。
