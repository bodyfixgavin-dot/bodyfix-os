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
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  price integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table services alter column duration_minutes drop not null;
alter table services drop constraint if exists services_duration_minutes_check;
alter table services add constraint services_duration_minutes_check check (duration_minutes is null or duration_minutes > 0);

alter table services add column if not exists code text;
alter table services add column if not exists category text;
alter table services add column if not exists display_name_zh text;
alter table services add column if not exists display_name_en text;
alter table services add column if not exists price_twd integer;
alter table services add column if not exists cash_price_twd integer;
alter table services add column if not exists is_addon boolean not null default false;
alter table services add column if not exists is_public_visible boolean not null default true;
alter table services add column if not exists is_direct_booking_allowed boolean not null default true;
alter table services add column if not exists is_city_session_allowed boolean not null default false;
alter table services add column if not exists requires_consultation boolean not null default false;
alter table services add column if not exists daily_limit integer;
alter table services add column if not exists status text not null default 'active';
alter table services add column if not exists sort_order integer not null default 999;
alter table services add column if not exists booking_note text;
alter table services add column if not exists internal_note text;

update services
set code = coalesce(code, 'legacy_' || replace(id::text, '-', '_'))
where code is null;

update services
set display_name_zh = coalesce(display_name_zh, name),
    price_twd = coalesce(price_twd, price)
where display_name_zh is null or price_twd is null;

do $$ begin
  alter table services add constraint services_code_key unique (code);
exception when duplicate_object then null;
end $$;

alter table services drop constraint if exists services_status_check;
alter table services add constraint services_status_check check (status in ('active', 'limited', 'coming_soon', 'archived', 'draft'));

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

create or replace view public_booking_services as
select *
from services
where is_active = true
  and is_public_visible = true
  and is_addon = false
  and is_direct_booking_allowed = true
  and status = 'active';

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

  if not exists (
    select 1
    from services
    where id = p_service_id
      and is_active = true
      and is_public_visible = true
      and is_addon = false
      and is_direct_booking_allowed = true
      and status = 'active'
  ) then
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
using (is_active = true and is_public_visible = true);

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
grant select on public_booking_services to anon, authenticated;

grant execute on function hold_booking_slot(uuid, uuid, text, text, text, text, text) to service_role;
grant execute on function expire_old_holds() to service_role;

insert into services (
  code,
  name,
  category,
  display_name_zh,
  display_name_en,
  duration_minutes,
  price,
  price_twd,
  cash_price_twd,
  is_addon,
  is_public_visible,
  is_direct_booking_allowed,
  requires_consultation,
  daily_limit,
  is_city_session_allowed,
  status,
  sort_order
)
values
  ('fascia_chain_reset_60', '筋膜鏈整理', 'body_reset', '筋膜鏈整理', 'Fascia Chain Reset', 60, 2200, 2200, null, false, true, true, false, null, false, 'active', 10),
  ('fascia_line_selected_reset_60', '筋膜線指定整理', 'body_reset', '筋膜線指定整理', 'Selected Fascia Line Reset', 60, 2300, 2300, null, false, true, true, false, null, false, 'active', 20),
  ('multi_line_reset_90', '多線整合整理', 'body_reset', '多線整合整理', 'Multi-Line Reset', 90, 3600, 3600, null, false, true, true, false, null, false, 'active', 30),
  ('pelvic_core_reset_60', '骨盆核心整理', 'body_reset', '骨盆核心整理', 'Pelvic Core Reset', 60, 2500, 2500, null, false, true, true, false, null, false, 'active', 40),
  ('ziwei_structural_analysis_90', '紫微結構解析', 'status_analysis', '紫微結構解析', 'Zi Wei Structural Analysis', 90, 3600, 3600, null, false, true, true, false, null, false, 'active', 50),
  ('tarot_single_question_15', '塔羅單題整理', 'status_analysis', '塔羅單題整理', 'Tarot Single Question', 15, 333, 333, null, false, true, true, false, null, false, 'active', 60),
  ('tarot_status_reading_30', '塔羅狀態整理', 'status_analysis', '塔羅狀態整理', 'Tarot Status Reading', 30, 666, 666, null, false, true, true, false, null, false, 'active', 70),
  ('tarot_deep_reading_60', '塔羅深度整理', 'status_analysis', '塔羅深度整理', 'Tarot Deep Reading', 60, 1200, 1200, null, false, true, true, false, null, false, 'active', 80),
  ('ziwei_tarot_integration_120', '紫微 + 塔羅整合諮詢', 'status_analysis', '紫微 + 塔羅整合諮詢', 'Zi Wei + Tarot Integration Consultation', 120, 4800, 4800, null, false, true, true, false, null, false, 'active', 90),
  ('fascia_extension_30', '筋膜鏈延長整理', 'body_reset', '筋膜鏈延長整理', 'Fascia Extension', 30, 1000, 1000, null, true, true, false, false, null, false, 'active', 110),
  ('pelvic_core_extension_30', '骨盆核心延長整理', 'body_reset', '骨盆核心延長整理', 'Pelvic Core Extension', 30, 1200, 1200, null, true, true, false, false, null, false, 'active', 120),
  ('consultation_extension_30', '延長諮詢', 'status_analysis', '延長諮詢', 'Consultation Extension', 30, 1000, 1000, null, true, true, false, false, null, false, 'active', 130),
  ('pelvic_core_advanced_120', '骨盆核心深度完整方案', 'premium_limited', '骨盆核心深度完整方案', 'Pelvic Core Advanced Full Plan', 120, 6800, 6800, null, false, true, false, true, 1, false, 'limited', 140),
  ('training_24_plus_12_bundle', '24+12 深度整合方案', 'package_bundle', '24+12 深度整合方案', '24+12 Deep Integration Bundle', null, 62400, 62400, 60000, false, true, false, true, null, false, 'limited', 150),
  ('grooming_interest', '熱蠟除毛', 'interest_only', '熱蠟除毛', 'Waxing Interest', null, null, null, null, false, true, false, false, null, false, 'coming_soon', 160)
on conflict (code) do update set
  name = excluded.name,
  category = excluded.category,
  display_name_zh = excluded.display_name_zh,
  display_name_en = excluded.display_name_en,
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  price_twd = excluded.price_twd,
  cash_price_twd = excluded.cash_price_twd,
  is_addon = excluded.is_addon,
  is_public_visible = excluded.is_public_visible,
  is_direct_booking_allowed = excluded.is_direct_booking_allowed,
  requires_consultation = excluded.requires_consultation,
  daily_limit = excluded.daily_limit,
  is_city_session_allowed = excluded.is_city_session_allowed,
  status = excluded.status,
  sort_order = excluded.sort_order;

-- Legacy Booking V1 seed rows are kept for historical booking references, but hidden from new direct booking.
update services
set is_active = false,
    is_public_visible = false,
    is_direct_booking_allowed = false,
    status = 'archived',
    internal_note = coalesce(internal_note, 'Archived by BodyFix Service Catalog Master v1 migration.')
where code like 'legacy_%';
