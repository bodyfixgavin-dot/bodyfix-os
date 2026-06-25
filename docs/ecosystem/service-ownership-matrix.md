---
title: "Service Ownership Matrix"
domain: ecosystem
visibility: internal
status: draft
type: ownership-matrix
version: 0.1.0
created_at: 2026-06-25
updated_at: 2026-06-25
source: "phase-2-markdown-calibration"
---

# Service Ownership Matrix｜服務權責矩陣

Allowed `Operational Status` values: `active`, `developing`, `planned`, `paused`, `historical`, `needs-verification`.

> 判定原則：品牌識別圖片、SQL seed `active`、路由存在、SOP 與文件均只能作為證據之一；來源可能過期或不足時使用 `needs-verification`。

| Service / Product | Brand Owner | Service Type | Capability Provider | Operational Status | Evidence Source | Last Verified At | Notes |
| ----------------- | ----------- | ------------ | ------------------- | ------------------ | --------------- | ---------------- | ----- |
| Fascia Chain Reset｜BodyFix 服務 | BodyFix | 真人身體服務 | BodyFix | needs-verification | Phase 1 repository inventory; service naming in ecosystem docs | 2026-06-25 | BodyFix 服務主線明確，但目前文件校準不以品牌圖或單一 seed 推定正式現況。 |
| Pelvic Core Reset｜BodyFix 服務 | BodyFix | 真人身體服務 | BodyFix | needs-verification | Phase 1 repository inventory; service naming in ecosystem docs | 2026-06-25 | 需以最新營運資料確認是否 active。 |
| Strength & Movement Integration｜BodyFix 服務 | BodyFix | 真人身體服務／動作整合 | BodyFix | needs-verification | Phase 1 repository inventory; service naming in ecosystem docs | 2026-06-25 | 可能與教練課、動作整合或既有 BodyFix 服務包重疊。 |
| BodyFix Grooming｜BodyFix 服務 | BodyFix | 真人服務／整理服務 | BodyFix | needs-verification | Phase 1 repository inventory; BodyFix service naming | 2026-06-25 | 名稱與服務內容需人工確認。 |
| Zi Wei Structural Analysis｜BodyFix 真人服務 | BodyFix | 真人諮詢／結構分析服務 | BodyFix, with possible Chart Navigator capability support | needs-verification | Phase 1 repository inventory; `app/gavin-astrology/`; `app/clinic/sop/chart-navigator/` | 2026-06-25 | 不得與 Chart Navigator 排盤、計算與導航能力合併。 |
| Chart Navigator Zi Wei Capability｜排盤、計算與導航能力 | Chart Navigator | 工具能力／計算與導航模組 | Chart Navigator | needs-verification | Phase 1 repository inventory; `app/gavin-astrology/`; `app/clinic/sop/chart-navigator/` | 2026-06-25 | 能力可支援服務，但不等同 BodyFix 真人服務。 |
| Tarot Status Reading｜BodyFix 真人服務與獨立數位產品 | BodyFix | 真人服務／獨立數位產品 | BodyFix | needs-verification | Phase 1 repository inventory; Tarot naming conflict log | 2026-06-25 | 維持 BodyFix 品牌歸屬；BF Tarot 是否為歷史名稱待確認。 |
| Chart Navigator Tarot Module｜導航流程中的當下狀態模組 | Chart Navigator | 工具能力／狀態輸入模組 | Chart Navigator | needs-verification | Phase 1 repository inventory; Tarot naming conflict log | 2026-06-25 | 可用 Tarot 作為導航流程模組，但不擁有 Tarot Status Reading 品牌。 |
| BodyFix Pulse｜BodyFix 營運與決策觀測系統 | BodyFix | 營運與決策觀測系統 | BodyFix | developing | `docs/bodyfix-pulse-v1.md`; `app/admin/pulse/`; `components/pulse/`; `lib/pulse/`; `supabase/pulse-v1.sql` | 2026-06-25 | 現階段只服務 BodyFix；不是全生態中央控制台。 |
