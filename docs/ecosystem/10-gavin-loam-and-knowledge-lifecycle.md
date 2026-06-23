# 10-gavin-loam-and-knowledge-lifecycle.md

**spec_pack_version:** 0.3.1
**document_version:** 0.3.1
**document_status:** draft
**effective_from:** null
**updated_at:** 2026-06-23
**approved_by:** null

## 1. 文件目的

定義 Gavin Loam 在 Gavin Shared-Root Ecosystem 中的位置，以及內部知識、可公開作品與出版素材的成熟生命週期。

本文件是知識生命週期治理文件，不是 09 Governance、Referral & Permission、CRM、資料庫、BodyFix Pulse runtime 或 AI Router 的替代品。

## 2. 架構位置

```text
Gavin Shared-Root Ecosystem
├─ domain：BodyFix、Chart Navigator、Space Guide 等平行專業森林
│  └─ service_line：各專業森林內的服務之樹
├─ Shared Root Network：資料與系統連接層
├─ BodyFix Pulse：營運觀測與決策中心
└─ Gavin Loam：知識腐植層
```

Gavin Loam 是共根生態中的知識腐植層，負責保存、沉澱、重組與成熟可被再次使用的知識養分。

## 3. 非目標

Gavin Loam 不是：

- CRM
- database
- AI Router
- Consent 或 Permission 執行層
- BodyFix Pulse runtime
- Shared Root Network
- 09 Governance 的替代文件

## 4. 知識生命週期

```text
Raw Capture｜原始落葉
↓
對話、整理、去識別、補足上下文
↓
Gavin Loam｜已沉澱材料
├─ 核准成正式規則 → Internal Knowledge Base
├─ 被服務或系統吸收 → BodyFix／Chart Navigator／Space Guide／Pulse／AI
├─ 轉譯成公開內容 → Gavin Notes
└─ 發展成完整作品 → Gavin Books
```

Raw Capture 不等於 Gavin Loam。原始聊天、截圖、零碎想法或尚未整理的 raw observation，不能自動進入 Gavin Loam。

內容進入 Gavin Loam 前，至少需要完成：

- 基本整理
- 上下文補足
- 去識別
- 再利用價值判斷

Gavin Loam 是已沉澱材料，不是未整理素材的暫存桶。每份進入 Loam 的內容都必須保留來源、適用範圍、可見性與是否可公開的判斷。

Internal Knowledge Base 不是所有 Loam 內容必經的下一站。只有被 Gavin 核准成正式規則、標準、判斷框架或內部作業準則的 Loam 內容，才進入 Internal Knowledge Base。

同一份 Loam 內容可以同時被多個服務、系統或公開內容吸收，例如 BodyFix、Chart Navigator、Space Guide、Pulse、AI、Gavin Notes 或 Gavin Books。內容 Published 之後仍可保留在 Loam 中，繼續被其他用途重新使用。

核心區分：

> Gavin Loam 負責累積與供養；Internal Knowledge Base 負責定案；Gavin Notes 負責公開；Gavin Books 負責完整出版。

## 5. Gavin Notes / Gavin Books 命名

```yaml
gavin_notes:
  public_name: REQUIRES_GAVIN_CONFIRMATION
  working_name: Gavin Notes
gavin_books:
  public_name: REQUIRES_GAVIN_CONFIRMATION
  working_name: Gavin Books
```

內部概念：

- Gavin Notes 目前作為公開內容入口的 working name，負責從 Gavin Loam 轉譯出可公開分享的短文、筆記、觀點或其他公開內容。
- Gavin Books 目前作為完整出版作品的 working name，負責從 Gavin Loam 發展成結構完整、可閱讀、可分享或可出版的作品。

公開正式名稱若尚未核准，保留 `REQUIRES_GAVIN_CONFIRMATION`。不得由 Codex 自行決定公開名稱使用單數或複數，也不得新增 Gavin Library、Gavin Lab 或其他新品牌名稱。

## 6. 與 05～09 的關係

- 編號代表文件主題分類，不代表 05～09 已完成。
- 05 仍是 Referral & Permission。
- 06～09 仍維持原規劃與狀態。
- 10 不取代 09 Governance。
- 10 專責 Gavin Loam、Internal Knowledge Base、Gavin Notes、Gavin Books、知識成熟與出版生命週期。

## 7. 文件狀態

本文件維持 draft：

```yaml
document_status: draft
approved_by: null
effective_from: null
```
