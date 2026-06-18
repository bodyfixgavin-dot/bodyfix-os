-- BodyFix Pulse service catalog + income compatibility patch.
-- Safe to run after supabase/pulse-v1.sql; does not delete existing data.

create table if not exists public.service_catalog (
  id uuid primary key default gen_random_uuid(),
  service_code text not null unique,
  service_line text not null,
  service_name text not null,
  service_variant text not null default '標準',
  duration_minutes integer not null check (duration_minutes > 0),
  standard_price integer not null check (standard_price >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.service_catalog (service_code, service_line, service_name, service_variant, duration_minutes, standard_price, is_active, sort_order) values
  ('BF-BR-001', 'Body Reset', '筋膜鏈整理', '標準', 60, 2200, true, 10),
  ('BF-BR-002', 'Body Reset', '筋膜線指定整理', '指定', 60, 2300, true, 20),
  ('BF-BR-EXT-001', 'Body Reset', '筋膜鏈延長整理', '延長', 90, 3300, true, 30),
  ('BF-PC-001', 'Body Reset', '骨盆核心整理', '標準', 60, 2500, true, 40)
on conflict (service_code) do update set
  service_line = excluded.service_line,
  service_name = excluded.service_name,
  service_variant = excluded.service_variant,
  duration_minutes = excluded.duration_minutes,
  standard_price = excluded.standard_price,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

alter table public.pulse_income_entries
  add column if not exists client_id uuid references public.clients(id) on delete set null,
  add column if not exists client_name_snapshot text,
  add column if not exists service_code text,
  add column if not exists service_line text,
  add column if not exists service_name text,
  add column if not exists service_variant text,
  add column if not exists standard_price integer check (standard_price >= 0),
  add column if not exists amount_actual integer check (amount_actual >= 0);

alter table public.pulse_income_entries
  alter column service_type drop not null,
  alter column amount drop not null;

update public.pulse_income_entries
set
  client_name_snapshot = coalesce(client_name_snapshot, client_name),
  amount_actual = coalesce(amount_actual, amount),
  standard_price = coalesce(standard_price, amount)
where client_name_snapshot is null or amount_actual is null or standard_price is null;

create index if not exists pulse_income_client_idx on public.pulse_income_entries(client_id);
create index if not exists pulse_income_service_code_idx on public.pulse_income_entries(service_code);

alter table public.service_catalog enable row level security;

notify pgrst, 'reload schema';
