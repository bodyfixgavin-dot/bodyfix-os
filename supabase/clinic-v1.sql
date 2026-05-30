-- BodyFix Clinic V1 client record core
-- Additive migration: upgrades existing Booking V1 clients without dropping data.

create extension if not exists pgcrypto;

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  client_name text,
  line_id text,
  phone text,
  created_at timestamptz not null default now()
);

alter table clients add column if not exists client_code text;
alter table clients add column if not exists display_name text;
alter table clients add column if not exists nickname text;
alter table clients add column if not exists instagram text;
alter table clients add column if not exists birthday date;
alter table clients add column if not exists city text;
alter table clients add column if not exists occupation text;
alter table clients add column if not exists exercise_habit text;
alter table clients add column if not exists old_injury_history text;
alter table clients add column if not exists main_issue text;
alter table clients add column if not exists has_coaching_experience boolean default false;
alter table clients add column if not exists source text default 'other';
alter table clients add column if not exists home_city text default 'taipei';
alter table clients add column if not exists preferred_city text default 'taipei';
alter table clients add column if not exists service_mode_preference text default 'studio';
alter table clients add column if not exists first_contact_date date default current_date;
alter table clients add column if not exists first_pain_point text default 'unknown';
alter table clients add column if not exists current_stage text default 'lead_dm';
alter table clients add column if not exists priority text default 'P3';
alter table clients add column if not exists total_sessions integer default 0;
alter table clients add column if not exists total_spent integer default 0;
alter table clients add column if not exists last_session_date date;
alter table clients add column if not exists next_followup_date date;
alter table clients add column if not exists case_permission text default 'unknown';
alter table clients add column if not exists internal_notes text;
alter table clients add column if not exists updated_at timestamptz default now();

update clients
set display_name = client_name
where display_name is null and nullif(trim(coalesce(client_name, '')), '') is not null;

update clients
set client_code = 'BF-' || upper(substr(md5(id::text), 1, 6))
where client_code is null;

update clients set has_coaching_experience = coalesce(has_coaching_experience, false);
update clients set source = coalesce(source, 'other');
update clients set home_city = coalesce(home_city, 'taipei');
update clients set preferred_city = coalesce(preferred_city, 'taipei');
update clients set service_mode_preference = coalesce(service_mode_preference, 'studio');
update clients set first_contact_date = coalesce(first_contact_date, current_date);
update clients set first_pain_point = coalesce(first_pain_point, 'unknown');
update clients set current_stage = coalesce(current_stage, 'lead_dm');
update clients set priority = coalesce(priority, 'P3');
update clients set total_sessions = coalesce(total_sessions, 0);
update clients set total_spent = coalesce(total_spent, 0);
update clients set case_permission = coalesce(case_permission, 'unknown');
update clients set updated_at = coalesce(updated_at, now());

create unique index if not exists clients_client_code_key on clients(client_code);

alter table clients drop constraint if exists clients_current_stage_check;
alter table clients add constraint clients_current_stage_check check (current_stage in (
  'lead_dm', 'booked', 'first_done', 'followup', 'repeat',
  'three_session_candidate', 'three_session_client',
  'twelve_session_candidate', 'twelve_session_client',
  'maintenance', 'coach_integration', 'lost'
));

create table if not exists service_records (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  service_date date default current_date,
  record_mode text default 'quick' check (record_mode in ('quick', 'full')),
  service_code text,
  service_name_snapshot text,
  duration_minutes integer,
  price_twd integer,
  main_complaint text,
  fatigue_state_assessment text,
  main_tension_area text,
  processed_area text,
  strategy text,
  client_reaction text,
  after_change text,
  next_focus text,
  internal_notes text,
  dominant_fascia_line text,
  body_region text,
  satisfaction_score integer,
  followup_needed boolean default true,
  next_followup_date date,
  case_candidate boolean default false,
  plan_candidate boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists homework_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  service_record_id uuid references service_records(id) on delete set null,
  breathing_cue text,
  movement_cue text,
  suggested_frequency text,
  notice text,
  status text default 'assigned' check (status in ('assigned', 'in_progress', 'done', 'skipped', 'unknown')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists followups (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  service_record_id uuid references service_records(id) on delete set null,
  followup_type text check (followup_type in ('day0', 'day1', 'day3', 'day7', 'day14', 'day30', 'wake_up', 'other')),
  scheduled_date date default current_date,
  sent_at timestamptz,
  message_template text,
  message_summary text,
  client_response text,
  response_status text default 'not_sent' check (response_status in ('not_sent', 'no_reply', 'positive', 'neutral', 'negative', 'booked', 'rejected')),
  next_action text,
  is_done boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists plan_candidates (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  suggested_plan_type text default 'watching' check (suggested_plan_type in (
    'single_followup', 'three_session_reset', 'twelve_session_program',
    'maintenance_plan', 'coach_integration', 'training_progression', 'watching'
  )),
  plan_score integer default 0,
  trigger_reason text,
  suggested_pitch text,
  status text default 'watching' check (status in ('watching', 'ready_to_pitch', 'pitched', 'accepted', 'rejected', 'paused')),
  last_checked_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists case_assets (
  id uuid primary key default gen_random_uuid(),
  case_code text unique,
  client_id uuid references clients(id) on delete set null,
  service_record_id uuid references service_records(id) on delete set null,
  case_type text check (case_type in ('fcr', 'pcr', 'movement', 'tarot', 'ziwei', 'three_session', 'twelve_session', 'training', 'other')),
  pain_keyword text,
  assessment_keyword text,
  before_summary text,
  after_summary text,
  client_quote text,
  evidence_type text default 'none' check (evidence_type in ('text_feedback', 'screenshot', 'video', 'photo', 'verbal', 'none')),
  publish_permission text default 'unknown' check (publish_permission in ('unknown', 'approved_anonymous', 'approved_partial', 'rejected')),
  content_status text default 'raw' check (content_status in ('raw', 'drafted', 'posted_ig', 'used_sales_page', 'archived')),
  internal_value_score integer,
  ai_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace view today_followups as
select f.id, f.scheduled_date, f.followup_type, f.response_status, f.is_done,
       c.client_code, c.display_name, c.priority, c.current_stage, c.home_city,
       f.message_summary, f.next_action
from followups f
join clients c on c.id = f.client_id
where f.scheduled_date <= current_date and f.is_done = false
order by c.priority asc, f.scheduled_date asc;

create or replace view client_progress_summary as
select c.id as client_id, c.client_code, c.display_name, c.current_stage, c.priority,
       c.total_sessions, c.total_spent, c.last_session_date, c.next_followup_date,
       count(sr.id)::integer as record_count,
       latest.main_complaint as latest_main_complaint,
       latest.after_change as latest_after_change,
       latest.next_focus as latest_next_focus
from clients c
left join service_records sr on sr.client_id = c.id
left join lateral (
  select main_complaint, after_change, next_focus
  from service_records r
  where r.client_id = c.id
  order by r.service_date desc, r.created_at desc
  limit 1
) latest on true
group by c.id, latest.main_complaint, latest.after_change, latest.next_focus;

create or replace view plan_candidate_summary as
select pc.id, pc.client_id, c.client_code, c.display_name, c.current_stage,
       pc.suggested_plan_type, pc.plan_score, pc.trigger_reason, pc.suggested_pitch,
       pc.status, c.last_session_date, count(sr.id)::integer as record_count, pc.updated_at
from plan_candidates pc
join clients c on c.id = pc.client_id
left join service_records sr on sr.client_id = c.id
group by pc.id, c.id
order by pc.plan_score desc, pc.updated_at desc;

create or replace view case_asset_candidates as
select sr.id as service_record_id, sr.client_id, c.client_code, c.display_name,
       sr.service_date, sr.service_code, sr.service_name_snapshot, sr.main_complaint,
       sr.after_change, sr.next_focus, sr.processed_area, sr.body_region, sr.created_at
from service_records sr
join clients c on c.id = sr.client_id
where sr.case_candidate = true
order by sr.service_date desc, sr.created_at desc;

alter table clients enable row level security;
alter table service_records enable row level security;
alter table homework_tasks enable row level security;
alter table followups enable row level security;
alter table plan_candidates enable row level security;
alter table case_assets enable row level security;
