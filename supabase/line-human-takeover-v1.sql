-- BodyFix LINE human takeover v1
-- Additive migration. Stores only conversation control state.

create table if not exists public.line_conversation_states (
  line_user_id text primary key,
  conversation_mode text not null default 'bot'
    check (conversation_mode in ('bot', 'human', 'paused')),
  human_until timestamptz,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'system'
);

alter table public.line_conversation_states enable row level security;

revoke all on table public.line_conversation_states from public, anon, authenticated;
grant select, insert, update, delete on table public.line_conversation_states to service_role;

comment on table public.line_conversation_states is
  'Controls whether BodyFix LINE conversations are handled by bot, human, or paused mode.';
