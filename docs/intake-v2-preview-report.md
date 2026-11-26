# Intake V2 預覽驗收紀錄（2026-11-26）

本文件取代 `bodyfix-intake-v2-spec.md` 中與本次 Gavin 指令衝突的舊規格。僅更新既有 BodyFix OS，不建立新站或第二套預約管理；正式站未覆蓋。

## 版本與回復

- 基準：`71579974c29a7eff0add1f0206ee278af94b88a2`（既有 main／production）。
- 開發分支：`codex/intake-v2-preview`。只推送非 production 分支；未執行 promote、資料刪除或 migration。
- 預覽：https://bodyfix-ps0mvtdlf-gavin-xus-projects-d5150bf5.vercel.app/intake
- 不應合併／正式上線，直到 Supabase 連線與真機驗收完成。

## 交付內容

單頁六區：預約身分、基本資料、生活運動、服務、身體需求、日期時段地點，另有安全與隱私確認。第一次／回訪切換不清空記憶體中的已填內容。回訪選填更新個人資料；無公開客戶搜尋或暱稱帶入。

生日年／月／日選單與年齡替代、身高體重並排、職業、單一必要聯絡方式均保留。依台北日期計算年齡、星座及每年生日，不衍生醫療或體脂結論。

服務卡片共用 `lib/bodyfix-services.ts`，無付費預設選取：

| ID | 中文／英文 | 基本時長 | 價格 | 延長 30 分鐘 |
| --- | --- | --- | --- | --- |
| body-reset | 肌筋膜整理按摩／Myofascial Reset | 60 分鐘 | 2,200 | +1,000 |
| relaxation | 放鬆按摩／Relaxation Massage | 60 分鐘 | 1,600 | +700 |
| multi-line | 多條筋膜線整合／Multi-Line Integration | 90 分鐘 | 3,600 | 不提供未確認規則 |
| pelvic-core | 骨盆核心整理按摩／Pelvic Core Reset | 60 分鐘 | 2,500 | +1,000 |
| movement | 私人教練課／Personal Training | 單堂，時間另確認 | 1,800 | 不提供 |
| unsure | 還不確定，想先聽 Gavin 的建議 | 討論後確認 | 討論後確認 | 不提供 |

`fascia-line`、`pelvic-vip` 保留於歷史查找，但不在公開 Intake／共用網站服務入口。教練套裝資料保留。按摩、骨盆核心、訓練各自顯示相關題目；提交前會清理隱藏欄位，不因切換誤寫或誤驗證。

地點先讀既有 `taipei_service_zones` 的可用設定，停用／封存不展示。若設定來源無法連線，使用 Gavin 本次明確確認的共用備援設定：六張犁主要、西門／國父紀念館次要、指定地點（到府）／討論；不含地址。尚未確認場地不等於可直接預約。時段固定 14、17、19、22 點及另議；從未宣稱即時空檔。

## 資料相容與安全

未修改 DB schema。沿用 `intake_submissions` 基礎欄位，以既有 `raw_message` 保存 V2 JSON 快照（含 profile、單次需求、當時服務名稱／時長／金額、生日衍生資料、時間戳及同意版本）。後台 API 同時兼容既有 `raw_payload`、V2 `raw_message` 及舊純文字紀錄；舊資料不重寫。

既有問卷紀錄列表直接展開客戶摘要、生活背景、服務、安全、READ 現場提問與聊天參考。不新增 CRM 或強制第二次核准。此版不接受用戶聲稱的 LINE user ID，不自動修改既有客戶基本資料；由 LINE 人工確認身分。

每頁產生隨機 submission key，伺服器以 key＋已清理答案產生穩定 UUID，透過既有主鍵與 `ON CONFLICT DO NOTHING` 避免並行／重試重複寫入。過去快照不被 upsert 更新；修改答案會產生另一份紀錄。前端亦有同步鎖及 disabled。

成功儲存後才前往 LINE 官方帳號 oaMessage 預填；LINE allowlist 僅含暱稱、初次／回訪、服務、時長、價格、希望日期／時間／地點及資料編號。無生日、聯絡帳號、職業、身體／健康資訊、碰觸界線或自由備註。備援複製亦使用同一 allowlist。

健康資訊不進網址、analytics 或瀏覽器持久儲存；未送出資料僅留在頁面記憶體，離開／重整會清除。儲存失敗顯示 503／重試提示並保留表單，不顯示完成或自動開啟 LINE。

預覽安全檢查發現原本 ALLOW_ADMIN_BYPASS 允許未登入取得管理員 session。本分支限制 bypass 僅限未部署的本機開發；任何 Vercel preview／production 均禁止。簽章加入版本前綴，使本分支不接受修正前簽發的 cookie。這不修改正式站或其他既有部署，亦非宣稱那些舊預覽已修復。

## 驗證結果

- `npm test`：24 個測試檔、163 項通過（含既有 LINE／客戶 resolver 等測試）。
- `npm run build`：成功，129 頁產生完成，TypeScript 通過。
- 單元／伺服器 mock：價格 90 分鐘 3,200／2,300／3,500／3,600；生日／星座／台北日期；初次與回訪必要資料；隱藏欄位；骨盆成年男性與外部同意；LINE 私人欄位排除；重複送出與 DB 失敗處理均通過。
- 實際 Chromium UI：生日顯示 36 歲／射手座，90 分鐘肌筋膜 3,200、放鬆 2,300；多條筋膜無延長項目；骨盆專屬出現；教練課隱藏按摩／骨盆題；回訪隱藏基本資料但保留暱稱；安全細項展開與收合正常。
- 原生日期選擇器可開啟並選取；錯誤可定位日期欄位。此雲端控制器的程式 fill 不會完整觸發日期狀態，使用原生日曆確認後正常，未以工具 fill 失敗判定產品故障。
- 視窗 CSS 寬度 398／331：scrollWidth 與 viewport 相等；所有可見文字輸入為 16px；身高體重並排；最小選項 label 高度 46px。此為桌面 Chromium 窄視窗，不是 iOS Safari／Android 真機。
- 部署 HTTP：地點設定回傳四個確認選項；無登入讀問卷為 401；bypass 登入為 403。
- 正式 domain 仍指向原 deployment `dpl_CwfAJ83R4kcGdXiQxyv15tzjZs1a`／基準 commit。

## 阻擋與未驗證

實際寫入失敗，回傳 503。僅記錄無私人值的分類 log：`intake_storage_unavailable:transport:fetch_failed`。目前是 Supabase 連線層阻擋，不能宣稱實際存檔／持久化去重／後台實際紀錄已驗收。沒有成功建立測試預約、發送 LINE 訊息或 Calendar 事件。

已找到可管理 Supabase 的整合並提供連接入口，但尚未確認安裝與連接。後續應透過正式授權的資料庫存取檢查專案狀態、連線與 schema，再測寫入及以同一 key 重試。自動審查拒絕了透過部署 Preview bypass 查閱私人 CRM 的診斷方式，未執行、未改道嘗試。

尚未驗證：真人初次 1–2 分鐘、回訪 15–30 秒；必要／大部分選填／修正選項三種真人計時；iOS Safari／Android 鍵盤與 LINE app 跳轉；實際存檔後 LINE 預填／複製備援；經授權後台實際摘要及歷史紀錄。頁面不標示未經證實的填寫時間。

LINE webhook、Google Calendar、歷史訂單、舊客戶資料表與既有營運流程程式碼保留；除既有測試通過及未變更相關程式外，未以真實私人資料／行事曆作整合驗證。
