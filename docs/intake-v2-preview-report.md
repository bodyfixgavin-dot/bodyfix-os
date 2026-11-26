# Intake V2 儲存修復與離線備援驗收（2026-11-26）

狀態：**備援已部署；資料庫修復與端到端驗收尚未完成。不可合併 main／覆蓋正式站。**

## Preview

- 開發分支：`codex/intake-v2-preview`，沿用原問卷，不另建問卷或管理系統。
- 功能 commit：`b576b20375c4c182dbc530bbcd3b7bc9dad49793`。
- Preview：https://bodyfix-d7vd4xxmc-gavin-xus-projects-d5150bf5.vercel.app/intake
- Deployment：`dpl_6LsekYmHcB9wRRM7kshEXVWvpX3s`，READY，Next.js 16.4.6。
- 正式網域仍指向 `dpl_CwfAJ83R4kcGdXiQxyv15tzjZs1a`／main `71579974c29a7eff0add1f0206ee278af94b88a2`。

## 儲存診斷

| 項目 | 證據與結果 |
| --- | --- |
| 使用者原錯誤 | 2026-11-26 21:35:23 Asia/Taipei（13:35:23 UTC）`intake_storage_unavailable:transport:fetch_failed`。舊 log 未保留底層 cause，不能回推確定為 DNS、TLS 或逾時。使用者已確認專案曾暫停。 |
| 專案狀態 | Supabase 管理工具唯讀確認 `mxthlhabqvlsbfgytrdg`／`bodyfix-database` 為 ACTIVE_HEALTHY。 |
| 目前連線 | DNS A 可解析；HTTPS TLS 驗證結果 0；未附 key 的 auth health gateway 回 401（No API key），約 0.22 秒。這證明該測試路徑可達，不等於資料寫入成功。 |
| API 使用變數 | `createSupabaseAdminClient()` 使用 NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY。SUPABASE_URL 未被這條 Intake 路徑使用，anon key 不參與此伺服器寫入。 |
| Preview／Production 配置 | NEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_ANON_KEY 各為同一筆配置同時套用兩環境；SUPABASE_URL 也同時套用兩環境。service-role key 為分開的 Secret，未讀取或比對內容。Preview 執行時 log 確認兩個 URL 相符、service-role key 已載入。未改任何 Vercel env，未對正式站送出問卷。 |
| 恢復後實際寫入 | 原 Preview 與修復 Preview 的虛構客戶 POST 均為 503；Runtime Log：PGRST205／missing_table。沒有成功建立紀錄。 |
| schema | 唯讀查 pg_tables（所有非系統 schema）無 intake_submissions；現有 taipei_service_zones、client_aliases、client_identifiers 亦不存在。migration history 為空（不代表從未以 SQL Editor 變更）。另一個名為 BodyFix 的既有專案亦未查得這些表，不自動切換網址或金鑰。 |
| 原時段 logs | Supabase 13:30–13:40 UTC source 統計無紀錄；不足以判定原 fetch failed 的低層原因。 |

新增日誌只輸出固定分類：DNS、TLS、逾時、無效 URL、拒絕連線、重設連線、缺表／欄位、權限、無效 key、原因未知。不記錄原始錯誤、stack、金鑰、客戶答案或網址值。不能以原因未知冒充已找到根因。

## 備援行為

- 問卷內容、服務價格、安全與同意規則沿用；安全確認不足時仍阻擋進入完成流程。
- 客戶端先用當前表單產生摘要，再嘗試儲存。地點 API 也離線時，使用本版已核准的備援地點。
- 地點查詢上限 2.5 秒、資料寫入上限 6.5 秒；客戶端整體等待上限 12 秒。錯誤、非 JSON、503、斷線或逾時轉至「問卷已填寫完成／暫時無法同步」頁，不要求重填或持續重試。
- 只在 API 確認 stored:true + reference 後顯示「預約資料已儲存」。兩種模式皆明示尚未確認預約、服務前須安全確認。
- 完成頁直接提供純文字預覽、一鍵複製、官方 LINE、次要重試與返回修改。所有原始答案仍留在 React 記憶體；不寫入 localStorage。開啟 LINE 使用獨立頁，保留原頁。重整或關閉仍可能清除未同步內容，頁面明示此限制。
- 複製優先 Clipboard API，在點擊中立即呼叫以保留 Safari activation；失敗嘗試選取文字與 execCommand，再失敗則提示長按手動複製。不會失敗卻顯示成功。
- 摘要 allowlist：暱稱、初次／回訪、年齡／星座、身高體重、職業、工作型態、運動頻率與類型、服務／時長／價錢、主要需求／部位、日期／時段／地點；未填選填項略過。排除完整生日、聯絡帳號、健康病史、安全細項、自由備註與私密碰觸界線。不提供含敏感資料的完整摘要。
- 沿用 BodyFix 官方帳號 https://line.me/R/ti/p/@359gzxzi 。改為先複製再點擊開啟；不將摘要或個資放進任何網址參數。
- 同頁重試保留 submission key；normalized answers + key 產生既有穩定 UUID，以既有主鍵 ON CONFLICT DO NOTHING，避免並行／重試插入重複。客戶修改答案會形成另一份快照。真實 DB 去重仍待存檔後查驗。

## 驗證

- npm test：25 檔，177 項通過，包含新增固定錯誤分類及敏感資訊不進 log 測試。
- npm run build：成功，129 頁，TypeScript 通過。sandbox 下 detached TypeScript 子程序輸出解析失敗；相同原始碼以環境正常程序權限建置通過，未略過 TypeScript。
- `scripts/intake-fallback-browser.cjs`：Chromium 及 WebKit 各 8 組手機尺寸測試通過：網路斷線、503、12 秒逾時、非 JSON 502、剪貼簿兩種方法均失敗時可選取、失敗重試成功、正常成功、安全必填阻擋。檢查整份答案返回後保留、摘要 allowlist、無橫向溢位、重試請求完全相同。Chromium 真實剪貼簿讀回逐字一致；WebKit 成功複製提示及手動備援通過。全部 API 寫入皆攔截，不冒充實際存檔。
- 修復後 Vercel Preview 真實瀏覽器：填虛構資料 → 實際 API 503 → 摘要 → 真實複製／讀回 → 點擊官方 LINE。開啟 https://line.me/R/ti/p/@359gzxzi ，頁面標題 Add LINE friend；沒有個資網址參數。返回原頁可繼續修改，答案仍保留。
- 此雲端電腦沒有 iPhone 原生 LINE App，未將「可開官方帳號網頁」冒充「已在 iPhone LINE 貼上送出訊息」。尚未送出 LINE 訊息。
- Preview 問卷管理 API 未登入為 401；未啟用 bypass，未使用服務金鑰繞過管理頁驗證。等待使用者正常登入後才查閱後台。

## 待修復／驗收

1. 使用者目前指定先唯讀檢查。已提供 `supabase/intake-v2-readonly-diagnostics.sql`；本輪未建表／建庫／套 migration／修改 RLS／刪除任何資料。
2. 目前指向的既有專案沒有問卷表。下一步須確認在同一專案套用現有建表規格，或提供真正保存歷史 Intake 的既有來源；不能虛構寫入成功、也不自動改連另一專案。
3. 建表方案可沿用 `supabase/intake-submissions.sql` 的既有欄位，RLS 保持啟用，權限只給伺服器 service_role；需審閱後才執行。獨立檢查 clients 既有 RLS 不啟用及開放政策，避免影響原營運。
4. 真實寫入 → 同 key 並行／重送 → 查驗僅一筆 → 正常登入既有後台展開 V2 客戶摘要 → iPhone LINE 貼上／送出，仍全部待完成。

## 既有安全發現（唯讀，未變更）

Supabase advisor 確認 public.clients 的 RLS 未啟用，且有既有開放政策。只執行 ENABLE ROW LEVEL SECURITY 仍需審查那些政策，不能宣稱因此已完整保護。未自動變更存取權或讀取客戶列。

- https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public
- https://supabase.com/docs/guides/database/postgres/row-level-security
