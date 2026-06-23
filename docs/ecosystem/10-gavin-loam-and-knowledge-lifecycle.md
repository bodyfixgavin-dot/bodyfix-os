# 10-gavin-loam-and-knowledge-lifecycle.md

**spec_pack_version:** 0.3.1
**document_version:** 0.1.0
**document_status:** draft
**effective_from:** null
**updated_at:** 2026-06-23
**approved_by:** null

## 文件目的

定義 Gavin Loam 在 Gavin Shared-Root Ecosystem 中的正式位置，並區分 Internal Knowledge Base、Gavin Loam、Gavin Books、BodyFix Pulse 與 Shared Root Network 的責任邊界。

本文件只定義知識生命週期與架構語意，不建立前台頁面、不修改 Catalog、不實作 Pulse、不建立 AI Router。

## Gavin Loam 定義

Gavin Loam 是共根生態中的知識腐植層。

它保存 Gavin 在多個專業森林與服務之樹中累積、觀察、拆解、沉澱與等待成熟的知識材料，包含尚未整理成正式 SOP、正式出版作品或正式商業 Offer 的主題。

核心句：

> 有些想法會長成作品，有些先留在土裡。

## 與 Internal Knowledge Base 的區分

Internal Knowledge Base 保存「目前正式怎麼做」。

Gavin Loam 保存「我們累積了什麼，以及未來可能長出什麼」。

| 層級 | 主要用途 | 狀態語意 |
|---|---|---|
| Internal Knowledge Base | 保存已確認、目前正式使用的流程、話術、規則與操作方式 | operational / current |
| Gavin Loam | 保存觀察、素材、主題、未成熟方法、跨題目連結與未來可能長出的作品或服務 | composting / emerging |

Gavin Loam 的內容不得因為被保存就自動成為正式 SOP、正式服務、正式產品、正式 Offer 或正式 Catalog 項目。

## 與 Gavin Books 的區分

Gavin Books 是由 Gavin Loam 中成熟主題整理出的完整出版作品。

Gavin Books 可以來自 Gavin Loam，但不是 Gavin Loam 本身。當某一主題被整理為完整出版作品時，應保留其來源脈絡，但出版作品的版本、編輯、引用與公開責任需另行管理。

## 與 BodyFix Pulse 的區分

BodyFix Pulse 是營運觀測與決策中心，不是服務樹或腐植層。

Pulse 的責任是觀測營運、服務使用、客戶旅程與決策指標；它可以提示哪些主題值得回到 Gavin Loam 沉澱，也可以引用已正式化的 Internal Knowledge Base 規則，但不取代 Gavin Loam。

## 與 Shared Root Network 的區分

Shared Root Network 是資料與系統連接網絡，不是知識倉庫。

Shared Root Network 支撐身份、資料、權限、預約、付款、紀錄、分析與必要系統整合。它可以承載經核准的資料流與系統流，但不等同於 Gavin Loam，也不得把知識腐植層的隱喻轉成未核准的資料庫欄位或 runtime 行為。

## 知識生命週期

```text
observation / note / case signal
→ Gavin Loam composting topic
→ mature theme
→ Internal Knowledge Base rule, service material, content asset, Gavin Book, or Catalog candidate
→ governance / approval before formal use
```

- 進入 Gavin Loam：代表值得保存、連結與沉澱。
- 成熟主題：代表可以被整理、審稿或提案。
- 進入 Internal Knowledge Base：代表成為目前正式做法。
- 進入 Gavin Books：代表整理成完整出版作品。
- 進入 Catalog candidate：仍需依 03 與 Catalog governance 核准，不得自行成為正式 Offer。

## 不可動原則

- Gavin Loam 不修改正式程式、資料庫或 Catalog。
- Gavin Loam 不等於 AI Router 記憶庫。
- Gavin Loam 不得繞過 Consent、Permission、Data Classification 或 Payload Minimization。
- Gavin Loam 中的客戶案例或觀察若涉及個資、敏感資料或跨 Domain context，必須遵守 04 與後續 05、06 的資料邊界。
- Gavin Loam 的隱喻不得污染資料庫與程式語意。

## 驗收條件

Gavin 確認以下內容後，本文件才可升為 approved：

- Gavin Loam 是共根生態中的知識腐植層。
- Internal Knowledge Base 保存目前正式怎麼做。
- Gavin Loam 保存我們累積了什麼，以及未來可能長出什麼。
- Gavin Books 是由 Gavin Loam 中成熟主題整理出的完整出版作品。
- BodyFix Pulse 是營運觀測與決策中心，不是服務樹或腐植層。
- Shared Root Network 是資料與系統連接網絡，不是知識倉庫。
