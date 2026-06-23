# 02-domain-and-public-identity-architecture.md

**spec_pack_version:** 0.3.1
**document_version:** 0.2.1
**document_status:** draft
**effective_from:** null
**updated_at:** 2026-06-23
**approved_by:** null

## 文件目的

定義各 Domain 的公共身份、前台入口與 Gavin Ecosystem 內的平行關係。

## 適用範圍

適用於：

- BodyFix
- Chart Navigator
- Space Guide
- 未來新增 Domain
- 網站、會員入口、內容系統與 AI Reception 的 Domain 識別

## 非目標

本文件不定義：

- 服務價格
- 詳細 Service Taxonomy
- 資料表欄位
- Referral 流程
- AI Router 判斷邏輯
- 視覺稿與頁面版型

## Domain 與 Public Identity 的差異

- Domain 是內部系統與專業運作單位。
- Public identity 是客戶在前台看到的名稱、視覺、語氣與入口識別。
- 一個 Domain 可以有清楚 public identity，但不必成立為完全獨立的公司或孤立品牌。
- Domain 與 public identity 可以對應，但不是同一概念。

## 當前 Domain 狀態

| Domain | status |
|---|---|
| BodyFix | active |
| Chart Navigator | active |
| Space Guide | incubating |

Domain 狀態生命週期：

```text
candidate → incubating → active
                          ↕
                        paused

candidate / incubating / active / paused
                          ↓
                        retired
```

- paused 可恢復。
- retired 為終止狀態，不再接受新服務。

## 平行服務系統定位

BodyFix、Chart Navigator、Space Guide 是同一共根生態中，具有獨立前台識別的平行服務系統。

- BodyFix 不是 Chart Navigator 的母品牌。
- Chart Navigator 不是與 BodyFix 完全無關的孤立品牌。
- Space Guide 目前處於 incubating。
- 技術底層可以共享能力，但前台內容不能任意混用。

## 可共享的底層能力

可在符合 01 與 04 的條件下共享：

- 統一身份辨識
- 預約與付款基礎設施
- CRM 基礎能力
- AI Reception 路由框架
- 分析與追蹤基礎設施
- 會員入口基礎能力

跨 Domain 的服務內容、摘要與敏感資料，仍需依 Consent Policy 與 Permission Policy 處理。

## 必須保持獨立的專業內容

各 Domain 必須獨立維護：

- 服務說明
- 判讀方法
- SOP
- 安全邊界
- 案例
- 專業語彙
- 前台內容
- Knowledge module

不得在另一 Domain 前台直接混用。

## 共根來源識別

各 Domain 前台應保留持續可見但不搶焦點的共根來源識別。

目前：

```text
internal_ecosystem_id = gavin_ecosystem
architecture_name = Gavin Ecosystem
public_ecosystem_name = REQUIRES_GAVIN_CONFIRMATION
```

Gavin Ecosystem 目前是內部架構名稱，不代表正式公開品牌名稱已確定。

前台應使用 placeholder 或「共根來源識別」，直到 public_ecosystem_name 核准。

## 情境式兄弟服務入口

只有在客戶表現出相關需求或情境時，才提供兄弟 Domain 入口。

正確：

- BodyFix 客戶主動詢問工作、關係或決策方向，可介紹 Chart Navigator。
- 客戶詢問租屋、搬家與空間問題，可提供 Space Guide 入口。

錯誤：

- 在 BodyFix 首頁無情境地強推塔羅。
- 因為客戶曾使用一個 Domain，就自動在另一 Domain 揭露其紀錄。

## 不強迫交叉銷售

- 共根不代表預設接受跨售。
- Referral suggestion 不等於資料 handoff。
- 轉介需符合客戶需求。
- 資料 handoff 需依 04 與未來 05 處理。

## 前台入口、會員入口與內部識別

### 前台入口
以各 Domain 的獨立識別與主要任務為主。

### 會員入口
可顯示多 Domain 入口，但 Domain-specific 歷史與內容需依 Consent、Permission 與最小必要原則處理。

### 內部系統
使用：

- internal_ecosystem_id
- domain_id
- customer_profile
- customer_domain_context
- permission scope

進行識別與控管。

## Public Identity 層級

各 Domain 可以獨立擁有：

- 名稱
- 主色
- 圖像世界
- 專業語彙
- 內容節奏
- 網站氣質

共同遵循：

- 資訊清晰度
- 排版與互動品質
- 狀態導向語言
- 共根來源識別規則
- 無障礙原則
- 資料倫理
- 不誤導客戶的專業邊界

不得要求所有 Domain 使用相同視覺模板。

## 新 Domain 與 Public Identity 成立原則

新 Domain 必須符合 01 原則，並至少回答：

- 是否有獨立問題空間？
- 是否有可維持的專業方法？
- 是否需要獨立前台語言？
- 是否能與既有 Domain 保持清楚邊界？
- 是否值得長期維護？
- 是否經 Gavin 核准？

Public identity 的獨立程度，可低於 Domain 的技術獨立程度。

## 禁止事項

- 不得把 BodyFix 描述為 Chart Navigator 母品牌。
- 不得把 Chart Navigator 描述為完全無關的孤立品牌。
- 不得把 Space Guide 未確認內容寫成正式 active 產品。
- 不得在無相關需求時強行推銷其他 Domain。
- 不得讓不同 Domain 前台內容任意混用。
- 不得預設公開名稱一定是 Gavin Ecosystem。

## 驗收條件

Gavin 確認：

- 平行服務系統定位
- 當前 Domain 狀態
- 共根來源識別原則
- 前台、會員與內部識別差異
- 情境式兄弟入口
- 設計語言共享與獨立範圍

## 待確認事項

- public_ecosystem_name。
- 共根來源識別的呈現強度與位置。
- Space Guide 升級為 active 的條件。
- 各 Domain 的正式 presentation tokens。

## 版本紀錄

### 0.2.1
- 將品牌架構修正為 Domain 與 Public Identity 架構。
- 鎖定平行服務系統定位。
- 區分獨立前台與共用底層。
- 加入共根來源 placeholder 與 Domain lifecycle。
