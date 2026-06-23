# 04-shared-root-identity-data-and-consent.md

**spec_pack_version:** 0.3.1
**document_version:** 0.3.1
**document_status:** draft
**effective_from:** null
**updated_at:** 2026-06-23
**approved_by:** null

## 1. 文件目的

定義 Gavin Ecosystem 中：

- 統一身份
- Domain-specific context
- Data Classification
- Policy Acceptance
- Optional Consent
- Permission
- Merge / Unlink / Rollback
- AI 與 Log Payload Minimization

作為 05 Referral、06 AI Router 與後續資料實作的底層依據。

## 2. 適用範圍

適用於：

- BodyFix
- Chart Navigator
- Space Guide
- 未來新增 Domain
- LINE OA
- Google Login
- Website Login
- 人工建立客戶
- CRM
- AI Reception
- 會員入口

## 3. 非目標

本文件不：

- 提供法律結論
- 宣稱符合特定法規
- 產出 SQL
- 建立 Supabase Table
- 定義完整 Referral 流程
- 定義完整 AI Router
- 直接提供 Codex 資料庫實作指令

## 4. 統一身份與 Domain Context

維護統一 customer_profile 不等於所有 Domain 資料互通。

系統可以在合法且必要範圍內維護身份辨識。

customer_domain_context、服務內容、摘要與敏感資料的跨域揭露，必須依：

- purpose
- Data Classification
- Consent
- Permission
- 最小必要原則
- Domain 範圍

共同判斷。

## 5. Customer Profile

`customer_profile` 是穩定共同身份核心。

可以保存：

- internal customer ID
- 基本共同狀態
- 建立與更新 metadata

不得直接保存：

- 完整 BodyFix 紀錄
- 完整 Chart Navigator 對話
- 完整 Space Guide 資料
- Referral 內容本體
- Consent 內容本體
- 高敏感服務內容

## 6. Customer Identity

`customer_identity` 表示登入或外部平台身份。

核心欄位方向：

- identity_provider
- provider_account_id
- external_user_id
- source_channel
- source_domain
- verified_status
- first_seen_at
- last_seen_at

身份來源至少由以下組合識別：

```text
identity_provider
+ provider_account_id
+ external_user_id
```

不得只依：

- external_user_id
- 顯示名稱
- 暱稱
- 頭像

判定為同一身份。

## 7. Provider Account 與 LINE OA

新舊 LINE OA 必須保留不同：

- provider_account_id
- source_channel
- identity record

即使顯示名稱或頭像相同，也不得自動連結到同一 customer_profile。

## 8. Customer Alias

`customer_alias` 用於：

- 顯示
- 搜尋
- 人工辨識輔助

Alias 不得單獨作為：

- customer_identity_link
- profile_merge
- verified identity

的證據。

## 9. Customer Contact Point

`customer_contact_point` 管理：

- Email
- 電話
- 其他聯絡方式
- 聯絡偏好

核心欄位方向：

- contact_type
- contact_value
- verified_status
- source_channel
- preferred_status
- valid_from
- valid_until

需區分：

- customer_identity：登入或平台身份
- customer_contact_point：聯絡方式
- customer_alias：顯示名稱
- customer_profile：共同主檔

## 10. Customer Domain Context

`customer_domain_context` 保存特定 Domain 內的上下文、偏好與狀態。

每個 Domain context 獨立管理。

同一 customer_profile 不代表其他 Domain 可讀取該 Context。

## 11. Duplicate Candidate

`duplicate_candidate` 表示系統偵測到的可能重複 Profile。

只能提供提示，不得自動 Merge。

候選可以來自：

- 經驗證的共同聯絡方式
- 使用者主動聲明
- 外部平台驗證
- 人工辨識

顯示名稱、暱稱、頭像與相似文字只能是弱訊號。

## 12. Customer Identity Link

`customer_identity_link` 表示 customer_profile 與 customer_identity 之間的可逆連結。

只有符合以下任一條件，才可連結：

- 使用者完成明確帳號驗證
- 存在可靠且已驗證的共同身份證據
- Gavin 或獲授權角色人工確認

所有 Link 必須可追蹤來源與核准者。

## 13. Identity Unlink

`identity_unlink` 解除 Identity 與 Profile 的關係。

規則：

- 不刪除原始 Identity 紀錄
- 保留 audit trail
- 重新計算可見資料與權限
- 不得讓 Unlink 破壞其他 Profile 的合法資料

## 14. Profile Merge Event

Profile Merge 合併的是 Profile，不是 Identity。

核心欄位方向：

- source_profile_id
- target_profile_id
- affected_identity_ids
- approved_by
- approved_at
- merge_reason
- rollback_status

Merge 必須由 Gavin 或獲授權角色核准。

優先採可逆 Link 與人工確認，不做不必要的破壞性搬移。

## 15. Merge Rollback

`merge_rollback` 必須能還原：

- Identity 來源關係
- Domain Context 來源
- Consent 來源、目的與範圍
- Referral 關聯
- 權限計算基礎

所有操作需完整 audit trail。

## 16. Policy Acceptance Record

與 Optional Consent 分開。

### Policy Acceptance / Acknowledgement

- terms_acceptance
- privacy_notice_acknowledgement

本文件只做產品架構，不作法律定性。

## 17. Optional Consent Types

- cross_domain_discovery_consent
- cross_domain_summary_share_consent
- sensitive_data_share_consent
- marketing_consent

不得以單一全域 boolean 代表所有跨域授權。

## 18. Consent Record

核心欄位方向：

- consent_type
- subject_customer_id
- from_domain
- to_domain
- purpose
- allowed_data_categories
- allowed_fields
- policy_version
- source_channel
- status
- granted_at
- expires_at
- revoked_at
- created_by

規則：

- Consent 必須有方向與目的。
- 同意摘要分享不等於完整紀錄權限。
- unknown、expired、revoked 視為不可分享。
- 撤回需停止未來使用與分享。
- 已產生副本與歷史紀錄依政策處理。
- Profile Merge 不得擴張 Consent。

## 19. Referral Record

`referral_record` 與 Consent 分開。

Referral 表示發生轉介建議或 handoff。

Consent 表示客戶授權的資料處理範圍。

05 將定義完整 Referral 流程。

## 20. Data Classification

### Confidentiality Scope

- public
- internal
- confidential
- restricted

### Personal Data Sensitivity

- non_personal
- personal
- sensitive
- highly_sensitive

### Data Domain

```text
data_domain = shared_core | <domain_id>
```

Domain ID 引用 `brand-domain-catalog.json`。

不得使用模糊固定值 `future_domain`。

## 21. 有效存取決策

資料可被存取，必須同時符合：

```text
purpose allowed
∩ Consent valid, when required
∩ Permission allowed
∩ Data Classification allowed
∩ minimum necessary
∩ Domain scope matched
```

任何一項不成立，結果為 deny。

Permission 採 deny by default。

## 22. Profile Merge 不得擴張 Consent

- Merge 不得自動擴張 Consent。
- 不得將一個 Domain 的 Consent 套用到另一 Domain。
- Consent 保留原始來源、目的、範圍與版本。
- Merge 後重新計算有效存取權。
- Rollback 時可還原 Identity、Context 與 Consent 的來源關係。

## 23. AI Payload Minimization

- AI 只取得當前任務必要欄位。
- 預設不載入其他 Domain 的完整 customer_domain_context。
- 敏感與高敏感資料不得無條件送入模型。
- 跨域摘要依 Consent、Permission 與欄位白名單產生。
- AI 不得推測或揭露客戶其他 Domain 使用紀錄。
- Prompt、模型輸入與輸出不得自動成為永久 customer_profile。
- 真人接手時只傳送必要摘要，不傳送整份歷史。

## 24. Log Payload Minimization

audit_log 與 access_log 優先記錄：

- event metadata
- actor
- data classification
- target resource ID
- decision result

不預設保存：

- 完整身體紀錄
- 完整命盤內容
- 高敏感文字
- 完整 AI Prompt

必要時使用：

- 遮罩
- 摘要
- 安全引用

Log 本身受 Permission、Data Classification 與保存期限控管。

不得讓 Log 成為敏感資料平行副本。

## 25. 紀錄類型

### audit_log
設定、權限與資料異動歷史。

### access_log
敏感與高敏感資料的讀取事件。

### consent_event
grant、update、expire、revoke。

### merge_event
link、unlink、merge、rollback。

### data_subject_request
查閱、匯出、更正、撤回與刪除請求。

重要事件採 append-only，不覆蓋歷史。

## 26. 資料查閱、匯出、更正、撤回與刪除請求

系統應提供請求流程。

實際處理範圍、保存例外與完成時間，依：

- 適用政策
- 營運必要性
- 稽核需求
- 核准流程

決定，並留下處理紀錄。

不保證所有資料立即或完整刪除。

## 27. 保存與封存

保存期限需依：

- 資料目的
- Confidentiality Scope
- Personal Data Sensitivity
- Data Domain
- 營運與稽核需求
- 適用政策

共同決定。

到期後依政策：

- 刪除
- 匿名化
- 遮罩
- 封存
- 保留必要 append-only 事件

## 28. Identity 與 Consent 關係圖

```text
customer_profile
├─ customer_identity
│  └─ identity_provider + provider_account_id + external_user_id
├─ customer_alias
├─ customer_contact_point
├─ customer_domain_context
├─ duplicate_candidate
├─ customer_identity_link
├─ identity_unlink
├─ profile_merge_event
├─ merge_rollback
├─ policy_acceptance_record
├─ consent_record
├─ referral_record
├─ audit_log
├─ access_log
├─ consent_event
├─ merge_event
└─ data_subject_request

effective_access
= purpose
∩ consent
∩ permission
∩ data_classification
∩ minimum_necessary
∩ domain_scope
```

## 29. 典型使用情境

### 1. 新舊 LINE OA

- 建立兩個不同 customer_identity。
- 保留不同 provider_account_id 與 source_channel。
- 顯示名稱相似只產生 duplicate_candidate。
- 經驗證或人工確認後才可連結到同一 Profile。

### 2. 疑似重複 Profile

- 系統產生 duplicate_candidate。
- Gavin 或獲授權角色確認。
- 優先採可逆 Link。
- 需要 Merge 時建立 profile_merge_event。
- Merge 後重新計算存取權。

### 3. BodyFix 到 Chart Navigator 摘要分享

- 客戶授予有方向與目的的 cross_domain_summary_share_consent。
- 依 allowed_fields 產生必要摘要。
- 不分享完整 BodyFix Context。
- 建立 Referral 與 Consent Event。

### 4. Consent 撤回

- Consent status 更新為 revoked。
- 停止未來使用與分享。
- 依政策處理已產生副本。
- 保留 consent_event。

### 5. Profile Merge Rollback

- 還原 Identity、Context 與 Consent 來源。
- 重新計算權限。
- 保留 merge_event 與 audit_log。

### 6. AI 最小化讀取

- 只載入必要欄位。
- 不載入其他 Domain 完整 Context。
- 敏感資料未通過 Consent 與 Permission，不送入模型。
- 真人接手只傳必要摘要。

## 30. 與 01～03 的一致性檢查

- 與 01 的「共根但不自動互通」一致。
- 與 02 的平行 Domain 與獨立專業邊界一致。
- 與 03 的 audience_scope、public_capabilities、offer 與 Domain ID 引用一致。
- customer_profile 統一身份不等於 customer_domain_context 跨域共享。
- Referral、AI Router 與 Pulse 必須依本文件進行資料最小化與存取判斷。

## 31. 驗收條件

Gavin 確認：

- 身份模型
- Provider Account 邊界
- Duplicate / Link / Merge / Rollback
- Data Classification
- Consent 有方向與目的
- 有效存取公式
- AI / Log Payload Minimization
- 資料請求與保存原則

## 32. 待確認事項

- Cross-domain 分享欄位白名單與預設層級。
- 各 Data Classification 的保存期限。
- Merge、Unlink 與 Rollback 的詳細角色權限。
- AI Payload 白名單與敏感資料例外。
- Data Subject Request 的正式處理時限與核准流程。

## 33. 版本紀錄

### 0.3.1
- 分離 Customer Profile、Identity、Alias、Contact Point 與 Domain Context。
- 加入 Provider Account 組合識別。
- 加入 Duplicate、Link、Unlink、Merge 與 Rollback。
- 拆分 Policy Acceptance 與 Optional Consent。
- 將 Consent 改為有方向與目的的授權。
- 拆分 Data Classification 維度。
- 加入有效存取公式、AI Payload 與 Log Payload Minimization。
