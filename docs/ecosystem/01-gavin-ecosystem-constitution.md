# 01-gavin-ecosystem-constitution.md

**spec_pack_version:** 0.3.1
**document_version:** 0.2.1
**document_status:** draft
**effective_from:** null
**updated_at:** 2026-06-23
**approved_by:** null

## 文件目的

定義 Gavin Ecosystem 的最高層世界觀、不可動原則與邊界，作為後續 Domain、系統、內容、合作與產品決策的根本依據。

## 適用範圍

適用於 Gavin 負責的所有服務、系統、內容、團隊培訓、合作提案與未來新 Domain 的加入審核。

## 非目標

本文件不定義：

- 具體價格與服務代碼
- 資料庫欄位與 SQL
- AI Router 細節
- 網站版面
- 個別服務 SOP
- AI 工具分工

## Gavin Ecosystem 定義

Gavin Ecosystem 是由 Gavin 建立與維護的共根生態，包含已運作、孵化中與未來新增的多個服務系統。

這些服務系統共享底層能力與共根網絡，但各自保持專業邊界、服務方法與前台識別。

## 唯一生態層級

```text
Gavin Ecosystem
└─ 一座持續生長的森林
   ├─ BodyFix 服務樹
   ├─ Chart Navigator 服務樹
   ├─ Space Guide 服務樹
   └─ 未來可新增的服務樹
```

- 整座森林是 Gavin Ecosystem。
- BodyFix、Chart Navigator、Space Guide 是主要服務樹。
- 各服務線是樹幹與主要枝條。
- 服務、方案、報告、工具與內容產品是枝條、果實與種子。
- CRM、身份識別、AI、付款、預約、紀錄與分析是地下共根網絡。

## 核心哲學

> 各自成樹，彼此成林，地下共生。

### 各自成樹

每個服務系統有自己的：

- 客群
- 核心問題
- 方法與 SOP
- 專業語言
- 安全邊界
- 內容與案例
- 追蹤指標

### 彼此成林

多個服務系統同屬一個生態。客戶可以在不同人生階段進入不同服務系統，但不必同時使用所有服務。

### 地下共生

在合法且必要的範圍內共享身份辨識與系統基礎。

任何 Domain-specific context、服務內容與敏感資料的跨域揭露，必須依 Data Classification、Consent Policy 與 Permission Policy 處理。

## 共根不等於混合專業

共根允許多個需求並存，不代表不同專業可以互相替代。

- 身體問題不能用命盤因果取代身體判讀。
- 命盤問題不能用身體整理取代。
- 空間判讀不能替代醫療、法律或其他專業判斷。

## 專業邊界

不得以其他 Domain 的框架取代本 Domain 的專業判讀，也不得自行宣稱跨領域因果。

即使客戶同意跨域處理，也只能：

- 辨識多項需求同時存在
- 分別判讀
- 提供有邊界的分流
- 在符合 Consent 與 Permission 時進行轉介

## 共根不等於資料無限制互通

維護統一 customer_profile 不等於所有 Domain 資料互通。

同一 customer_profile 不代表另一 Domain 可以讀取完整紀錄。

customer_domain_context、服務內容、摘要與敏感資料的跨域揭露，必須依資料分類、目的、Consent 與 Permission 判斷。

## 客戶選擇權

客戶有權：

- 只使用一個 Domain
- 不了解其他 Domain
- 拒絕跨域轉介
- 拒絕跨域資料分享
- 撤回可撤回的 Consent
- 要求查閱、更正或提出資料處理請求

系統不得因為共根就預設客戶願意接受其他服務。

## 新 Domain 成立的原則級條件

新 Domain 原則上必須具備：

- 明確且持續的需求
- 可獨立運作的專業方法
- 可建立 SOP 與安全邊界
- 可衡量的追蹤指標
- 不與既有 Domain 產生不必要的定位混淆
- 經 Gavin 核准

細部 checklist 由 03 與 09 定義。

## 不可動原則

- 跨 Domain 分享預設為 false。
- unknown Consent 視為未同意。
- AI 不得推測客戶已同意。
- Permission 採 deny by default。
- 同一 customer_profile 不代表 Domain context 自動互通。
- 敏感與高敏感資料需更高層級控制。
- Profile Merge 不得自動擴張 Consent。
- CRM tag 不得作為 Consent 或 Permission 的證據。
- 隱喻不得污染資料庫與程式語意。

## 禁止事項

- 不得把 BodyFix、Chart Navigator、Space Guide 描述為三座彼此獨立的森林。
- 不得把 Chart Navigator 描述為 BodyFix 子品牌。
- 不得把 BodyFix 描述為所有命盤與空間服務的母體。
- 不得把共根解釋為資料無限制互通。
- 不得在無客戶相關需求時強行推銷其他 Domain。
- 不得以另一 Domain 的框架取代本 Domain 的專業判讀。
- 不得自行宣稱跨領域因果。
- 不得把服務系統數量寫死。

## 驗收條件

Gavin 確認以下內容後，本文件才可升為 approved：

- 唯一生態層級
- 核心哲學
- 專業邊界
- 客戶選擇權
- 資料與 Consent 不可動原則
- 新 Domain 原則級條件

## 待確認事項

- public_ecosystem_name。
- 共根來源識別的呈現強度與位置。
- 新 Domain 成立條件的量化與核准細則。

## 版本紀錄

### 0.2.1
- 鎖定一座森林、多棵服務樹。
- 修正專業邊界。
- 區分統一身份與跨 Domain 資料共享。
- 加入 Consent、Permission 與 Profile Merge 不可動原則。
