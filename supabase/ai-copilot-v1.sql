-- BodyFix Part 7A: AI Copilot MVP
-- Additive migration. AI reads data, creates suggestions/drafts, and logs outputs only.
-- See docs/ai-copilot-principles.md for the non-negotiable safety boundaries.

create extension if not exists pgcrypto;

create table if not exists ai_copilot_logs (
  id uuid primary key default gen_random_uuid(),
  module_key text not null,
  target_type text,
  target_id uuid,
  input_snapshot jsonb,
  output_payload jsonb,
  model_name text,
  provider_name text,
  status text default 'generated',
  user_feedback text,
  error_message text,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table ai_copilot_logs drop constraint if exists ai_copilot_logs_module_key_check;
alter table ai_copilot_logs add constraint ai_copilot_logs_module_key_check check (module_key in (
  'client_summary',
  'offer_message',
  'today_followup',
  'location_analysis'
));

alter table ai_copilot_logs drop constraint if exists ai_copilot_logs_status_check;
alter table ai_copilot_logs add constraint ai_copilot_logs_status_check check (status in (
  'generated',
  'copied',
  'edited',
  'accepted',
  'rejected',
  'error'
));

create index if not exists ai_copilot_logs_module_created_idx on ai_copilot_logs(module_key, created_at desc);
create index if not exists ai_copilot_logs_target_idx on ai_copilot_logs(target_type, target_id);

alter table ai_copilot_logs enable row level security;

-- No anon/public policies are created. All access goes through admin-only server routes using the service role.

notify pgrst, 'reload schema';
