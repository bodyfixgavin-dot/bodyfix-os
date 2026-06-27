-- Intake to CRM V1 additive migration
create extension if not exists pgcrypto;

alter table public.intake_submissions add column if not exists client_id uuid references public.clients(id) on delete set null;
alter table public.intake_submissions add column if not exists resolution_status text default 'pending';
alter table public.intake_submissions add column if not exists resolution_reason text;
alter table public.intake_submissions add column if not exists candidate_client_ids jsonb not null default '[]'::jsonb;
alter table public.intake_submissions add column if not exists chart_interest text default 'not_selected';
alter table public.intake_submissions add column if not exists birth_data_level text default 'none';
alter table public.intake_submissions add column if not exists consent_at timestamptz;
alter table public.intake_submissions add column if not exists raw_payload jsonb;
alter table public.intake_submissions add column if not exists resolved_at timestamptz;
alter table public.intake_submissions add column if not exists resolved_by text;
alter table public.intake_submissions add column if not exists line_user_id text;
alter table public.intake_submissions add column if not exists instagram text;
alter table public.intake_submissions add column if not exists trigger_moments text[] not null default '{}';
alter table public.intake_submissions add column if not exists exercise_frequency text;
alter table public.intake_submissions add column if not exists exercise_types text[] not null default '{}';
alter table public.intake_submissions add column if not exists trainer_status text;
alter table public.intake_submissions add column if not exists safety_flags text[] not null default '{}';
alter table public.intake_submissions add column if not exists pressure_preferences text[] not null default '{}';
alter table public.intake_submissions add column if not exists safety_note text;
alter table public.intake_submissions add column if not exists pressure_note text;
alter table public.intake_submissions add column if not exists available_times text[] not null default '{}';
alter table public.intake_submissions add column if not exists last_minute_ok text;

alter table public.intake_submissions drop constraint if exists intake_submissions_resolution_status_check;
alter table public.intake_submissions add constraint intake_submissions_resolution_status_check check (resolution_status in ('pending','linked_existing','created_new','needs_review','resolved_manually','failed'));
alter table public.intake_submissions drop constraint if exists intake_submissions_chart_interest_check;
alter table public.intake_submissions add constraint intake_submissions_chart_interest_check check (chart_interest in ('curious','later','not_now','not_selected'));
alter table public.intake_submissions drop constraint if exists intake_submissions_birth_data_level_check;
alter table public.intake_submissions add constraint intake_submissions_birth_data_level_check check (birth_data_level in ('none','date_only','full'));

alter table public.clients add column if not exists birth_time_note text;
alter table public.clients add column if not exists birth_place text;
alter table public.clients add column if not exists sun_sign text;
alter table public.clients add column if not exists birth_data_level text;
alter table public.clients add column if not exists chart_interest text;
alter table public.clients add column if not exists last_intake_at timestamptz;
alter table public.clients add column if not exists line_user_id text;

alter table public.clients drop constraint if exists clients_current_stage_check;
alter table public.clients add constraint clients_current_stage_check check (current_stage in (
  'lead_dm', 'lead_intake', 'booked', 'first_done', 'followup', 'repeat',
  'three_session_candidate', 'three_session_client',
  'twelve_session_candidate', 'twelve_session_client',
  'maintenance', 'coach_integration', 'lost'
));

create table if not exists public.client_aliases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  alias text not null,
  alias_normalized text not null,
  alias_type text not null default 'preferred_name',
  source text not null default 'public_intake',
  is_current boolean not null default true,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint client_aliases_alias_type_check check (alias_type in ('preferred_name','legal_name','nickname','english_name','former_name','line_display_name','instagram_name','gavin_label','other'))
);
create unique index if not exists client_aliases_client_normalized_key on public.client_aliases(client_id, alias_normalized);

create table if not exists public.client_identifiers (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  identifier_type text not null,
  identifier_value text not null,
  normalized_value text not null,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  source text not null default 'public_intake',
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint client_identifiers_type_check check (identifier_type in ('line_user_id','line_id','phone','instagram','email'))
);
create unique index if not exists client_identifiers_client_type_value_key on public.client_identifiers(client_id, identifier_type, normalized_value);

alter table public.client_aliases enable row level security;
alter table public.client_identifiers enable row level security;

alter table public.followups add column if not exists source_key text;
create unique index if not exists followups_source_key_key on public.followups(source_key) where source_key is not null;
