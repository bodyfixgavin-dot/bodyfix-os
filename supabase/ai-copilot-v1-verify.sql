-- Verify BodyFix Part 7A AI Copilot MVP schema.
-- Run after supabase/ai-copilot-v1.sql.

insert into ai_copilot_logs (
  module_key,
  target_type,
  input_snapshot,
  output_payload,
  model_name,
  provider_name,
  status,
  created_by
) values (
  'client_summary',
  'verify',
  '{"source":"ai-copilot-v1-verify"}'::jsonb,
  '{"draft_notice":"這是 AI 草稿，需 Gavin 確認。"}'::jsonb,
  'mock-bodyfix-safe',
  'mock',
  'generated',
  'verify'
);

select module_key, status, provider_name, model_name, created_at
from ai_copilot_logs
where created_by = 'verify'
order by created_at desc
limit 5;

delete from ai_copilot_logs where created_by = 'verify';
