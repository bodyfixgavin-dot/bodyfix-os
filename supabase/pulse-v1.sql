create extension if not exists pgcrypto;

create table if not exists pulse_settings (
  id uuid primary key default gen_random_uuid(),
  month_target integer not null default 150000,
  period_start date not null default (timezone('Asia/Taipei', now())::date),
  period_end date not null default (timezone('Asia/Taipei', now())::date),
  rest_weekdays integer[] default '{2}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists pulse_income_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  client_id uuid references clients(id),
  client_name_snapshot text,
  service_code text,
  service_line text,
  service_name text,
  service_variant text,
  standard_price integer,
  amount_actual integer not null check(amount_actual >= 0),
  source text,
  note text,
  created_at timestamptz default now()
);

create table if not exists pulse_appointments (
  id uuid primary key default gen_random_uuid(),
  appointment_date date not null,
  start_time time,
  client_id uuid references clients(id),
  client_name_snapshot text,
  service_code text,
  service_line text,
  service_name text,
  service_variant text,
  standard_price integer,
  amount_actual integer,
  status text default '已排' check(status in ('已排','待確認','已完成','取消')),
  note text,
  created_at timestamptz default now()
);

create table if not exists pulse_followups (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  scheduled_date date not null default (timezone('Asia/Taipei', now())::date),
  priority text default '中',
  message_summary text,
  is_done boolean default false,
  created_at timestamptz default now()
);

alter table clients add column if not exists contact_method text;
alter table clients add column if not exists line_id text;
alter table clients add column if not exists ig_id text;
alter table clients add column if not exists phone text;
alter table clients add column if not exists source text;
alter table clients add column if not exists main_issue text;
alter table clients add column if not exists last_visit_date date;
alter table clients add column if not exists status text default 'active';
alter table clients add column if not exists note text;
alter table clients add column if not exists updated_at timestamptz default now();

alter table pulse_income_entries add column if not exists client_id uuid references clients(id);
alter table pulse_income_entries add column if not exists client_name_snapshot text;
alter table pulse_income_entries add column if not exists service_code text;
alter table pulse_income_entries add column if not exists service_line text;
alter table pulse_income_entries add column if not exists service_name text;
alter table pulse_income_entries add column if not exists service_variant text;
alter table pulse_income_entries add column if not exists standard_price integer;
alter table pulse_income_entries add column if not exists amount_actual integer;
update pulse_income_entries set amount_actual = amount where amount_actual is null and amount is not null;
alter table pulse_income_entries alter column amount_actual set not null;

alter table pulse_appointments add column if not exists client_id uuid references clients(id);
alter table pulse_appointments add column if not exists client_name_snapshot text;
alter table pulse_appointments add column if not exists service_code text;
alter table pulse_appointments add column if not exists service_line text;
alter table pulse_appointments add column if not exists service_name text;
alter table pulse_appointments add column if not exists service_variant text;
alter table pulse_appointments add column if not exists standard_price integer;
alter table pulse_appointments add column if not exists amount_actual integer;

create index if not exists pulse_income_date_idx on pulse_income_entries(entry_date);
create index if not exists pulse_income_client_idx on pulse_income_entries(client_id);
create index if not exists pulse_appointment_date_idx on pulse_appointments(appointment_date,status);
create index if not exists pulse_appointment_client_idx on pulse_appointments(client_id);

alter table pulse_settings enable row level security;
alter table pulse_income_entries enable row level security;
alter table pulse_appointments enable row level security;
alter table pulse_followups enable row level security;

insert into pulse_settings(month_target,period_start,period_end,rest_weekdays)
select 150000, timezone('Asia/Taipei', now())::date, timezone('Asia/Taipei', now())::date, '{2}'
where not exists(select 1 from pulse_settings);
