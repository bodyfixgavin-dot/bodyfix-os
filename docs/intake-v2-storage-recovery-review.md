# Intake 儲存修復 SQL 審閱稿（尚未執行）

目標：現有 `bodyfix-database`／`mxthlhabqvlsbfgytrdg`。

唯讀查核已確認此專案沒有 `intake_submissions`。本方案只補齊原始碼 `supabase/intake-submissions.sql` 已定義的問卷表，欄位保持相同；不建立新資料庫、不更換網址／key、不修改 clients 或其他歷史資料、不關閉 RLS、不跳過管理員登入。

所有變更包在同一 transaction；若表已存在，CREATE TABLE 失敗後整個 transaction 回復，不重建／覆寫它。只新增問卷表和其索引；RLS 啟用，拒絕公開／anon／authenticated 直接讀寫，保留既有伺服器 service_role 寫入與授權後台讀取。RLS policy 使用明確角色，取代舊 SQL 的 auth.role() 判斷。API 的管理員 session 驗證維持原狀。

此步驟是資料庫 schema 變更，依使用者先唯讀的選擇，待同意後才執行。後續僅送出清楚標示的虛構測試資料；不修改或刪除歷史客戶。

```sql
begin;
create table public.intake_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null default 'public_intake',
  status text not null default 'new',
  display_name text not null,
  line_id text,
  phone text,
  birthday date,
  birth_time_note text,
  birth_place text,
  sun_sign text,
  extended_profile_status text,
  goals text[] not null default '{}',
  body_locations text[] not null default '{}',
  duration text,
  comfort_score int check (comfort_score is null or (comfort_score >= 0 and comfort_score <= 10)),
  previous_support text[] not null default '{}',
  state_recent text,
  state_improve text,
  state_feeling text,
  state_trend text,
  service_interest text,
  preferred_place text,
  preferred_time_note text,
  note text,
  raw_message text
);

create index if not exists idx_intake_submissions_created_at on public.intake_submissions (created_at desc);
create index if not exists idx_intake_submissions_status on public.intake_submissions (status);

alter table public.intake_submissions enable row level security;

-- No client-side role can read or write this table directly.
revoke all on table public.intake_submissions from public, anon, authenticated;
grant select, insert, update on table public.intake_submissions to service_role;

create policy intake_submissions_service_role_all
  on public.intake_submissions
  for all to service_role
  using (true)
  with check (true);
commit;
```

套用後必須：實際 Preview POST 成功、同一 submission key 並行重試、SQL 核對僅一筆且 V2 快照正確、正常登入既有後台確認摘要、iPhone 開啟 LINE／貼上送出。未全部驗證前維持「未完成驗收」，不覆蓋正式站。
