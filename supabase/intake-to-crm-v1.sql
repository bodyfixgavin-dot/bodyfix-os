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
create unique index if not exists followups_source_key_key on public.followups(source_key);

-- V1.1: client_code generator and atomic intake CRM promotion.
create or replace function public.normalize_bodyfix_identifier(value text)
returns text
language sql
immutable
as $$ select regexp_replace(lower(trim(coalesce(value, ''))), '^@|\s+', '', 'g') $$;

create or replace function public.normalize_bodyfix_phone(value text)
returns text
language sql
immutable
as $$ select regexp_replace(regexp_replace(coalesce(value, ''), '[^0-9+]', '', 'g'), '^\+886', '0') $$;

create or replace function public.generate_bodyfix_client_code()
returns text
language plpgsql
as $$
declare
  next_code text;
begin
  loop
    next_code := 'BF-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    exit when not exists (select 1 from public.clients where client_code = next_code);
  end loop;
  return next_code;
end;
$$;

create or replace function public.set_bodyfix_client_code()
returns trigger
language plpgsql
as $$
begin
  if nullif(trim(coalesce(new.client_code, '')), '') is null then
    new.client_code := public.generate_bodyfix_client_code();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_bodyfix_client_code on public.clients;
create trigger trg_set_bodyfix_client_code
before insert on public.clients
for each row execute function public.set_bodyfix_client_code();

alter table public.followups drop constraint if exists followups_source_key_key;
drop index if exists public.followups_source_key_key;
create unique index if not exists followups_source_key_key on public.followups(source_key);

create or replace function public.process_intake_crm_resolution(
  p_submission_id uuid,
  p_resolution_status text,
  p_resolution_reason text,
  p_candidate_client_ids jsonb default '[]'::jsonb,
  p_client_id uuid default null,
  p_create_client boolean default false,
  p_resolved_by text default 'system',
  p_manual boolean default false,
  p_action text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.intake_submissions%rowtype;
  target_client_id uuid := p_client_id;
  should_resolve boolean := p_resolution_status in ('linked_existing', 'created_new') or p_manual;
  identifier record;
  conflict_notes text[] := '{}';
begin
  if p_resolution_status not in ('linked_existing','created_new','needs_review','resolved_manually','failed') then
    raise exception 'invalid resolution_status %', p_resolution_status;
  end if;
  if p_candidate_client_ids is null then
    p_candidate_client_ids := '[]'::jsonb;
  end if;

  select * into s from public.intake_submissions where id = p_submission_id for update;
  if not found then
    raise exception 'intake submission not found: %', p_submission_id;
  end if;

  if p_resolution_status = 'needs_review' then
    update public.intake_submissions
       set resolution_status = 'needs_review',
           resolution_reason = p_resolution_reason,
           candidate_client_ids = p_candidate_client_ids,
           client_id = null,
           resolved_at = null,
           resolved_by = null,
           updated_at = now()
     where id = p_submission_id;
    return jsonb_build_object('status', 'needs_review', 'client_id', null);
  end if;

  if p_create_client then
    insert into public.clients (
      display_name, client_name, line_user_id, line_id, phone, instagram, birthday,
      birth_time_note, birth_place, sun_sign, birth_data_level, chart_interest,
      source, current_stage, first_contact_date, first_pain_point, main_issue,
      exercise_habit, last_intake_at, updated_at
    ) values (
      s.display_name, s.display_name, nullif(s.line_user_id, ''), nullif(s.line_id, ''), nullif(s.phone, ''), nullif(s.instagram, ''), s.birthday,
      nullif(s.birth_time_note, ''), nullif(s.birth_place, ''), nullif(s.sun_sign, ''), nullif(s.birth_data_level, ''), nullif(s.chart_interest, ''),
      'public_intake', 'lead_intake', current_date, coalesce(nullif(array_to_string(s.goals, '、'), ''), 'public_intake'), nullif(array_to_string(s.goals, '、'), ''),
      nullif(s.exercise_frequency, ''), now(), now()
    ) returning id into target_client_id;
  else
    if target_client_id is null then
      raise exception 'client_id is required when not creating a client';
    end if;
    update public.clients
       set birthday = coalesce(clients.birthday, s.birthday),
           birth_time_note = coalesce(nullif(clients.birth_time_note, ''), nullif(s.birth_time_note, '')),
           birth_place = coalesce(nullif(clients.birth_place, ''), nullif(s.birth_place, '')),
           sun_sign = coalesce(nullif(clients.sun_sign, ''), nullif(s.sun_sign, '')),
           birth_data_level = coalesce(nullif(clients.birth_data_level, ''), nullif(s.birth_data_level, '')),
           chart_interest = coalesce(nullif(clients.chart_interest, ''), nullif(s.chart_interest, '')),
           line_user_id = coalesce(nullif(clients.line_user_id, ''), nullif(s.line_user_id, '')),
           line_id = coalesce(nullif(clients.line_id, ''), nullif(s.line_id, '')),
           phone = coalesce(nullif(clients.phone, ''), nullif(s.phone, '')),
           instagram = coalesce(nullif(clients.instagram, ''), nullif(s.instagram, '')),
           main_issue = coalesce(nullif(clients.main_issue, ''), nullif(array_to_string(s.goals, '、'), '')),
           exercise_habit = coalesce(nullif(clients.exercise_habit, ''), nullif(s.exercise_frequency, '')),
           last_intake_at = now(),
           updated_at = now()
     where clients.id = target_client_id;
    if not found then
      raise exception 'client not found: %', target_client_id;
    end if;
  end if;

  if nullif(trim(coalesce(s.display_name, '')), '') is not null then
    insert into public.client_aliases (client_id, alias, alias_normalized, alias_type, source, is_current, first_seen_at, last_seen_at)
    values (target_client_id, s.display_name, public.normalize_bodyfix_identifier(s.display_name), 'preferred_name', coalesce(p_action, 'public_intake'), true, now(), now())
    on conflict (client_id, alias_normalized) do update set last_seen_at = excluded.last_seen_at, is_current = true;
  end if;

  for identifier in
    select * from (values
      ('line_user_id', s.line_user_id, public.normalize_bodyfix_identifier(s.line_user_id)),
      ('line_id', s.line_id, public.normalize_bodyfix_identifier(s.line_id)),
      ('phone', s.phone, public.normalize_bodyfix_phone(s.phone)),
      ('instagram', s.instagram, public.normalize_bodyfix_identifier(s.instagram))
    ) as v(identifier_type, identifier_value, normalized_value)
    where nullif(trim(coalesce(v.identifier_value, '')), '') is not null
      and nullif(trim(coalesce(v.normalized_value, '')), '') is not null
  loop
    insert into public.client_identifiers (client_id, identifier_type, identifier_value, normalized_value, is_verified, is_active, source, first_seen_at, last_seen_at)
    values (target_client_id, identifier.identifier_type, identifier.identifier_value, identifier.normalized_value, false, true, coalesce(p_action, 'public_intake'), now(), now())
    on conflict (client_id, identifier_type, normalized_value) do update set last_seen_at = excluded.last_seen_at, is_active = true;
  end loop;

  if p_action is distinct from 'add_alias' then
    insert into public.followups (client_id, followup_type, scheduled_date, message_summary, next_action, response_status, source_key)
    values (target_client_id, 'day0', current_date, '已收到新的預約前問卷', '確認服務、地點與可行時間', 'not_sent', 'intake:' || p_submission_id::text)
    on conflict (source_key) do update set client_id = excluded.client_id, updated_at = now();
  end if;

  update public.intake_submissions
     set client_id = target_client_id,
         resolution_status = p_resolution_status,
         resolution_reason = p_resolution_reason,
         candidate_client_ids = p_candidate_client_ids,
         resolved_at = case when should_resolve then now() else null end,
         resolved_by = case when should_resolve then p_resolved_by else null end,
         updated_at = now()
   where id = p_submission_id;

  return jsonb_build_object('status', p_resolution_status, 'client_id', target_client_id);
end;
$$;
