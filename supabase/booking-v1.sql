-- BodyFix Booking V1 | secure booking hold schema
-- Run this in Supabase SQL Editor before opening /booking and /admin.

create extension if not exists pgcrypto;

do $$ begin
  create type city_type as enum ('taipei', 'taichung', 'kaohsiung');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type slot_type as enum ('normal', 'late_night', 'last_minute', 'vip_hold');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type slot_status as enum ('available', 'closed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type booking_status as enum ('held', 'confirmed', 'cancelled', 'completed', 'expired');
exception when duplicate_object then null;
end $$;

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists availability_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  city city_type not null default 'taipei',
  slot_type slot_type not null default 'normal',
  status slot_status not null default 'available',
  note text,
  created_at timestamptz not null default now(),
  constraint valid_slot_time check (ends_at > starts_at)
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  line_id text not null,
  phone text,
  created_at timestamptz not null default now(),
  unique(line_id)
);

create table if not exists blacklist (
  id uuid primary key default gen_random_uuid(),
  line_id text not null unique,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists booking_requests (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references availability_slots(id) on delete restrict,
  service_id uuid not null references services(id) on delete restrict,
  client_id uuid references clients(id) on delete set null,
  client_name text not null,
  line_id text not null,
  phone text,
  body_notes text,
  message text,
  status booking_status not null default 'held',
  hold_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists unique_active_booking_per_slot
on booking_requests(slot_id)
where status in ('held', 'confirmed');

create or replace view public_available_slots as
select s.*
from availability_slots s
where s.status = 'available'
  and s.slot_type <> 'vip_hold'
  and s.starts_at > now()
  and not exists (
    select 1
    from booking_requests b
    where b.slot_id = s.id
      and b.status in ('held', 'confirmed')
      and (b.status = 'confirmed' or b.hold_expires_at > now())
  );

create or replace function expire_old_holds()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update booking_requests
  set status = 'expired',
      updated_at = now()
  where status = 'held'
    and hold_expires_at is not null
    and hold_expires_at <= now();
end;
$$;

create or replace function hold_booking_slot(
  p_slot_id uuid,
  p_service_id uuid,
  p_client_name text,
  p_line_id text,
  p_phone text default null,
  p_body_notes text default null,
  p_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot availability_slots%rowtype;
  v_client_id uuid;
  v_booking_id uuid;
begin
  perform expire_old_holds();

  if length(trim(p_client_name)) = 0 or length(trim(p_line_id)) = 0 then
    return jsonb_build_object('success', false, 'message', '請填寫姓名與 LINE ID。');
  end if;

  if exists (select 1 from blacklist where lower(line_id) = lower(trim(p_line_id))) then
    return jsonb_build_object('success', false, 'message', '目前無法受理此 LINE ID 的預約。');
  end if;

  select *
  into v_slot
  from availability_slots
  where id = p_slot_id
    and status = 'available'
    and slot_type <> 'vip_hold'
    and starts_at > now();

  if not found then
    return jsonb_build_object('success', false, 'message', '此時段目前無法預約。');
  end if;

  if not exists (select 1 from services where id = p_service_id and is_active = true) then
    return jsonb_build_object('success', false, 'message', '此服務項目目前無法預約。');
  end if;

  insert into clients (client_name, line_id, phone)
  values (trim(p_client_name), trim(p_line_id), nullif(trim(coalesce(p_phone, '')), ''))
  on conflict (line_id)
  do update set
    client_name = excluded.client_name,
    phone = excluded.phone
  returning id into v_client_id;

  begin
    insert into booking_requests (
      slot_id,
      service_id,
      client_id,
      client_name,
      line_id,
      phone,
      body_notes,
      message,
      status,
      hold_expires_at
    )
    values (
      p_slot_id,
      p_service_id,
      v_client_id,
      trim(p_client_name),
      trim(p_line_id),
      nullif(trim(coalesce(p_phone, '')), ''),
      nullif(trim(coalesce(p_body_notes, '')), ''),
      nullif(trim(coalesce(p_message, '')), ''),
      'held',
      now() + interval '30 minutes'
    )
    returning id into v_booking_id;
  exception when unique_violation then
    return jsonb_build_object('success', false, 'message', '這個時段剛剛被其他人暫時保留，請選擇其他時段。');
  end;

  return jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'message', '已為你暫時保留此時段，正式預約以 LINE 確認為準。'
  );
end;
$$;

alter table services enable row level security;
alter table availability_slots enable row level security;
alter table clients enable row level security;
alter table booking_requests enable row level security;
alter table blacklist enable row level security;

drop policy if exists "Public can read active booking services" on services;
create policy "Public can read active booking services"
on services
for select
using (is_active = true);

drop policy if exists "Public can read public booking slots" on availability_slots;
create policy "Public can read public booking slots"
on availability_slots
for select
using (status = 'available' and slot_type <> 'vip_hold' and starts_at > now());

-- Keep writes behind Vercel / Next API routes that use SUPABASE_SERVICE_ROLE_KEY.
revoke all on clients from anon, authenticated;
revoke all on booking_requests from anon, authenticated;
revoke all on blacklist from anon, authenticated;
revoke execute on function hold_booking_slot(uuid, uuid, text, text, text, text, text) from anon, authenticated;
revoke execute on function expire_old_holds() from anon, authenticated;
grant select on public_available_slots to anon, authenticated;

grant execute on function hold_booking_slot(uuid, uuid, text, text, text, text, text) to service_role;
grant execute on function expire_old_holds() to service_role;

insert into services (name, duration_minutes, price)
values
  ('Fascia Chain Reset｜筋膜鏈整理', 60, 2200),
  ('Pelvic Core Reset｜骨盆核心整理', 60, 2500),
  ('深度整合整理', 90, 3200),
  ('完整身體狀態整理', 120, 4200)
on conflict do nothing;
