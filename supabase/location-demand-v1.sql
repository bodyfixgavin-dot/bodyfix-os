-- BodyFix Part 3 | Location Demand & Resource Allocation System V1
-- Additive migration. Keeps Booking V1 and Clinic V1 tables intact.

create extension if not exists pgcrypto;

create table if not exists location_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  public_status text not null default 'coming_soon',
  updated_by text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table location_settings add column if not exists updated_by text;
alter table location_settings add column if not exists updated_at timestamptz not null default now();
alter table location_settings add column if not exists created_at timestamptz not null default now();

do $$ begin
  alter table location_settings add constraint location_settings_public_status_check check (public_status in ('coming_soon','registration_open','session_open'));
exception when duplicate_object then null;
end $$;

insert into location_settings (setting_key, public_status)
values ('location_demand_public_status', 'coming_soon')
on conflict (setting_key) do update set public_status = 'coming_soon', updated_at = now();

create table if not exists location_service_options (
  id uuid primary key default gen_random_uuid(),
  service_code text unique not null,
  display_name_zh text not null,
  display_name_en text,
  duration_minutes integer,
  price_twd integer,
  is_addon boolean not null default false,
  is_location_demand_allowed boolean not null default true,
  status text not null default 'active',
  sort_order integer not null default 999,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  alter table location_service_options add constraint location_service_options_status_check check (status in ('active','coming_soon','paused','archived'));
exception when duplicate_object then null;
end $$;

insert into location_service_options (service_code, display_name_zh, display_name_en, duration_minutes, price_twd, is_addon, status, sort_order, notes) values
('fascia_chain_reset_60','筋膜鏈整理','Fascia Chain Reset',60,2200,false,'active',10,null),
('fascia_line_selected_reset_60','筋膜線指定整理','Selected Fascia Line Reset',60,2300,false,'active',20,null),
('multi_line_reset_90','多線整合整理','Multi-Line Reset',90,3600,false,'active',30,null),
('pelvic_core_reset_60','骨盆核心整理','Pelvic Core Reset',60,2500,false,'active',40,null),
('pelvic_core_extension_30','骨盆核心延長整理','Pelvic Core Extended Reset',30,1200,true,'active',50,null),
('ziwei_structural_analysis_90','紫微結構解析','Zi Wei Structural Analysis',90,3600,false,'active',60,null),
('tarot_addon_15','塔羅加購','Tarot Add-on',15,333,true,'active',70,null),
('tarot_addon_30','塔羅加購','Tarot Add-on',30,666,true,'active',80,null),
('grooming_interest','熱蠟除毛','Grooming / Waxing',null,null,false,'coming_soon',90,'籌備中，可先登記興趣，正式開放後再公告。')
on conflict (service_code) do update set
  display_name_zh=excluded.display_name_zh, display_name_en=excluded.display_name_en, duration_minutes=excluded.duration_minutes,
  price_twd=excluded.price_twd, is_addon=excluded.is_addon, status=excluded.status, sort_order=excluded.sort_order,
  notes=excluded.notes, updated_at=now();

create table if not exists city_markets (
  id uuid primary key default gen_random_uuid(),
  city_code text unique not null,
  display_name_zh text not null,
  market_status text not null default 'watching',
  is_pilot_city boolean not null default false,
  known_high_intent_value_twd integer not null default 0,
  default_traffic_cost integer not null default 0,
  default_hotel_cost_per_night integer not null default 0,
  default_studio_cost_per_day integer not null default 0,
  default_meal_misc_cost_per_day integer not null default 0,
  target_profit_per_day integer not null default 10000,
  target_min_clients integer not null default 3,
  default_total_time_hours numeric,
  repeat_potential_score integer,
  travel_fatigue_level text not null default 'medium',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  alter table city_markets add constraint city_markets_status_check check (market_status in ('watching','pilot_city','warming_up','ready_to_plan','active','paused','archived'));
exception when duplicate_object then null;
end $$;
do $$ begin
  alter table city_markets add constraint city_markets_fatigue_check check (travel_fatigue_level in ('low','medium','high'));
exception when duplicate_object then null;
end $$;

insert into city_markets (city_code, display_name_zh, market_status, is_pilot_city, known_high_intent_value_twd, default_traffic_cost, default_hotel_cost_per_night, default_studio_cost_per_day, default_meal_misc_cost_per_day, target_profit_per_day, target_min_clients, default_total_time_hours, repeat_potential_score, travel_fatigue_level, notes) values
('taichung','台中','watching',false,0,1000,1800,1500,800,10000,3,null,null,'medium','目前基礎客源較多，可優先觀察三天兩夜或集中場次。'),
('kaohsiung','高雄','watching',false,0,3000,2200,1800,1000,10000,3,null,null,'high','南部核心城市，但交通與疲勞成本較高，需要看淨利。'),
('tainan','台南','watching',false,0,3000,2000,1600,1000,10000,3,null,null,'high','可與高雄合併安排。'),
('hsinchu','新竹','watching',false,0,1000,1800,1500,800,10000,3,null,null,'medium','工程師與高壓族群潛力。'),
('taoyuan','桃園','watching',false,0,800,1600,1500,800,10000,3,null,null,'medium','機場、服務業與新北外圍族群潛力。'),
('yilan','宜蘭','pilot_city',true,6000,2200,0,0,500,6000,1,7,3,'high','已收到 NT$6,000 高意願需求。先作為試點城市，不代表固定開場。'),
('other','其他','watching',false,0,0,0,0,0,10000,3,null,null,'medium','未分類城市需求。')
on conflict (city_code) do update set
  display_name_zh=excluded.display_name_zh, market_status=excluded.market_status, is_pilot_city=excluded.is_pilot_city,
  known_high_intent_value_twd=excluded.known_high_intent_value_twd, default_traffic_cost=excluded.default_traffic_cost,
  default_hotel_cost_per_night=excluded.default_hotel_cost_per_night, default_studio_cost_per_day=excluded.default_studio_cost_per_day,
  default_meal_misc_cost_per_day=excluded.default_meal_misc_cost_per_day, target_profit_per_day=excluded.target_profit_per_day,
  target_min_clients=excluded.target_min_clients, default_total_time_hours=excluded.default_total_time_hours,
  repeat_potential_score=excluded.repeat_potential_score, travel_fatigue_level=excluded.travel_fatigue_level,
  notes=excluded.notes, updated_at=now();

create table if not exists location_demand_leads (
  id uuid primary key default gen_random_uuid(),
  lead_type text not null,
  display_name text,
  line_id text,
  instagram text,
  phone text,
  privacy_consent boolean not null default false,
  privacy_consent_at timestamptz,
  city_code text,
  client_area_code text,
  preferred_zone_code text,
  secondary_zone_code text,
  service_interest text,
  main_issue text,
  preferred_time_type text not null default 'unknown',
  high_intent boolean not null default false,
  grooming_interest boolean not null default false,
  deposit_willing boolean not null default false,
  expected_budget_twd integer,
  expected_repeat_willingness text not null default 'unknown',
  repeat_potential_score integer,
  total_time_estimate_hours numeric,
  travel_fatigue_level text not null default 'medium',
  source text not null default 'location_demand',
  nurture_status text not null default 'registered',
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin alter table location_demand_leads add constraint location_demand_leads_type_check check (lead_type in ('cross_city','taipei_zone')); exception when duplicate_object then null; end $$;
do $$ begin alter table location_demand_leads add constraint location_demand_leads_time_check check (preferred_time_type in ('weekday_day','weekday_night','weekend_day','weekend_night','flexible','unknown')); exception when duplicate_object then null; end $$;
do $$ begin alter table location_demand_leads add constraint location_demand_leads_repeat_check check (expected_repeat_willingness in ('yes','no','maybe','unknown')); exception when duplicate_object then null; end $$;
do $$ begin alter table location_demand_leads add constraint location_demand_leads_fatigue_check check (travel_fatigue_level in ('low','medium','high')); exception when duplicate_object then null; end $$;
do $$ begin alter table location_demand_leads add constraint location_demand_leads_nurture_check check (nurture_status in ('registered','contacted','high_intent','invited_to_session','converted_to_booking','converted_to_client','paused','archived')); exception when duplicate_object then null; end $$;
do $$ begin alter table location_demand_leads add constraint location_demand_leads_status_check check (status in ('active','cancelled','archived')); exception when duplicate_object then null; end $$;

create table if not exists city_sessions (
  id uuid primary key default gen_random_uuid(),
  city_code text,
  session_name text,
  session_status text not null default 'draft',
  start_date date,
  end_date date,
  location_name text,
  location_address text,
  max_slots integer,
  confirmed_slots integer not null default 0,
  estimated_revenue integer not null default 0,
  traffic_cost integer not null default 0,
  hotel_cost integer not null default 0,
  studio_cost integer not null default 0,
  meal_misc_cost integer not null default 0,
  other_cost integer not null default 0,
  estimated_profit integer not null default 0,
  estimated_profit_per_day integer not null default 0,
  total_time_hours numeric,
  fatigue_note text,
  deposit_required boolean not null default false,
  deposit_amount integer,
  deposit_deadline timestamptz,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table city_sessions add column if not exists city_code text;
alter table city_sessions add column if not exists session_name text;
alter table city_sessions add column if not exists session_status text not null default 'draft';
alter table city_sessions add column if not exists start_date date;
alter table city_sessions add column if not exists end_date date;
alter table city_sessions add column if not exists location_name text;
alter table city_sessions add column if not exists location_address text;
alter table city_sessions add column if not exists confirmed_slots integer not null default 0;
alter table city_sessions add column if not exists traffic_cost integer not null default 0;
alter table city_sessions add column if not exists hotel_cost integer not null default 0;
alter table city_sessions add column if not exists studio_cost integer not null default 0;
alter table city_sessions add column if not exists meal_misc_cost integer not null default 0;
alter table city_sessions add column if not exists other_cost integer not null default 0;
alter table city_sessions add column if not exists estimated_profit integer not null default 0;
alter table city_sessions add column if not exists estimated_profit_per_day integer not null default 0;
alter table city_sessions add column if not exists total_time_hours numeric;
alter table city_sessions add column if not exists fatigue_note text;
alter table city_sessions add column if not exists deposit_deadline timestamptz;
alter table city_sessions add column if not exists internal_notes text;

do $$ begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='city_sessions' and column_name='city') then
    execute 'update city_sessions set city_code = coalesce(city_code, lower(city)) where city_code is null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='city_sessions' and column_name='status') then
    execute 'update city_sessions set session_status = coalesce(session_status, status, ''draft'')';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='city_sessions' and column_name='session_title') then
    execute 'update city_sessions set session_name = coalesce(session_name, session_title) where session_name is null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='city_sessions' and column_name='planned_start_date') then
    execute 'update city_sessions set start_date = coalesce(start_date, planned_start_date) where start_date is null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='city_sessions' and column_name='planned_end_date') then
    execute 'update city_sessions set end_date = coalesce(end_date, planned_end_date) where end_date is null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='city_sessions' and column_name='venue_name') then
    execute 'update city_sessions set location_name = coalesce(location_name, venue_name) where location_name is null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='city_sessions' and column_name='booked_slots') then
    execute 'update city_sessions set confirmed_slots = coalesce(confirmed_slots, booked_slots, 0)';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='city_sessions' and column_name='transport_cost') then
    execute 'update city_sessions set traffic_cost = coalesce(traffic_cost, transport_cost, 0)';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='city_sessions' and column_name='lodging_cost') then
    execute 'update city_sessions set hotel_cost = coalesce(hotel_cost, lodging_cost, 0)';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='city_sessions' and column_name='workspace_cost') then
    execute 'update city_sessions set studio_cost = coalesce(studio_cost, workspace_cost, 0)';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='city_sessions' and column_name='food_misc_cost') then
    execute 'update city_sessions set meal_misc_cost = coalesce(meal_misc_cost, food_misc_cost, 0)';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='city_sessions' and column_name='deposit_due_date') then
    execute 'update city_sessions set deposit_deadline = coalesce(deposit_deadline, deposit_due_date::timestamptz) where deposit_deadline is null';
  end if;
end $$;


do $$ begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='city_sessions' and column_name='city') then
    execute 'alter table city_sessions alter column city drop not null';
  end if;
end $$;
update city_sessions set city_code = 'other' where city_code is null;
alter table city_sessions alter column city_code set not null;

alter table city_sessions drop constraint if exists city_sessions_status_check;
alter table city_sessions drop constraint if exists city_sessions_deposit_only_when_open;
do $$ begin alter table city_sessions add constraint city_sessions_session_status_check check (session_status in ('draft','planning','registration_open','session_open','closed','completed','cancelled')); exception when duplicate_object then null; end $$;

create table if not exists taipei_service_zones (
  id uuid primary key default gen_random_uuid(),
  zone_code text unique not null,
  display_name_zh text not null,
  area_group text not null,
  status text not null default 'collecting_interest',
  is_regular_base boolean not null default false,
  is_rental_space boolean not null default false,
  requires_block_booking boolean not null default false,
  default_minimum_hours integer not null default 2,
  default_room_cost integer not null default 0,
  default_travel_minutes_from_home integer not null default 0,
  default_buffer_minutes integer not null default 30,
  cost_type text not null default 'fixed',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin alter table taipei_service_zones add constraint taipei_service_zones_status_check check (status in ('collecting_interest','active','limited','paused','archived')); exception when duplicate_object then null; end $$;
do $$ begin alter table taipei_service_zones add constraint taipei_service_zones_cost_type_check check (cost_type in ('fixed','variable')); exception when duplicate_object then null; end $$;

insert into taipei_service_zones (zone_code, display_name_zh, area_group, status, is_regular_base, is_rental_space, requires_block_booking, default_minimum_hours, default_room_cost, default_travel_minutes_from_home, default_buffer_minutes, cost_type, notes) values
('liuzhangli','六張犁','south_east_taipei','active',true,false,false,0,0,30,30,'fixed','目前常態據點，但對新北西區與西門客群心理距離較遠。'),
('ximen','西門','west_taipei','collecting_interest',false,true,true,2,300,30,30,'variable','共享工作室。約 2 小時 NT$300 起，適合集中安排西區與新北西區客戶。'),
('sun_yat_sen_memorial','國父紀念館','east_taipei','collecting_interest',false,true,true,2,310,40,30,'variable','共享工作室。約 2 小時 NT$310 起，另有 PRO 房型，適合東區、信義、松山客戶。')
on conflict (zone_code) do update set
 display_name_zh=excluded.display_name_zh, area_group=excluded.area_group, status=excluded.status,
 is_regular_base=excluded.is_regular_base, is_rental_space=excluded.is_rental_space, requires_block_booking=excluded.requires_block_booking,
 default_minimum_hours=excluded.default_minimum_hours, default_room_cost=excluded.default_room_cost,
 default_travel_minutes_from_home=excluded.default_travel_minutes_from_home, default_buffer_minutes=excluded.default_buffer_minutes,
 cost_type=excluded.cost_type, notes=excluded.notes, updated_at=now();

create table if not exists taipei_demand_areas (
  id uuid primary key default gen_random_uuid(),
  area_code text unique not null,
  display_name_zh text not null,
  area_group text not null,
  recommended_service_zone_code text,
  distance_to_liuzhangli_level text not null default 'medium',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin alter table taipei_demand_areas add constraint taipei_demand_areas_distance_check check (distance_to_liuzhangli_level in ('low','medium','high')); exception when duplicate_object then null; end $$;

insert into taipei_demand_areas (area_code, display_name_zh, area_group, recommended_service_zone_code, distance_to_liuzhangli_level, notes) values
('new_taipei_banqiao','新北－板橋區','new_taipei_west','ximen','high','Gavin 住板橋。此區客群對六張犁心理距離較高，西門較容易轉換。'),
('new_taipei_sanchong','新北－三重區','new_taipei_west','ximen','high','新北西區客群，適合觀察是否導向西門集中時段。'),
('new_taipei_tucheng','新北－土城區','new_taipei_west','ximen','high','對六張犁心理距離較高，可觀察是否適合西門集中時段。'),
('taipei_wanhua_ximen','台北－西門周邊','west_taipei','ximen','medium','西門周邊客群可直接導向西門集中時段。'),
('taipei_songshan_xinyi','台北－松山信義區','east_taipei','sun_yat_sen_memorial','medium','東區、信義、松山客群可優先導向國父紀念館。'),
('taipei_daan','台北－大安區','central_taipei','liuzhangli','low','六張犁接受度較高。'),
('taipei_zhongshan','台北－中山區','north_taipei','ximen','medium','可依客人習慣導向西門或國父紀念館。'),
('other','其他','other','liuzhangli','medium','未分類來源區。')
on conflict (area_code) do update set
 display_name_zh=excluded.display_name_zh, area_group=excluded.area_group, recommended_service_zone_code=excluded.recommended_service_zone_code,
 distance_to_liuzhangli_level=excluded.distance_to_liuzhangli_level, notes=excluded.notes, updated_at=now();

create table if not exists taipei_studio_blocks (
  id uuid primary key default gen_random_uuid(),
  zone_code text not null,
  block_date date not null,
  start_time time,
  end_time time,
  room_type text not null default 'standard',
  room_cost integer not null default 0,
  minimum_hours integer not null default 2,
  travel_minutes integer not null default 0,
  buffer_minutes integer not null default 30,
  planned_slots integer not null default 0,
  booked_slots integer not null default 0,
  expected_revenue integer not null default 0,
  expected_room_cost integer not null default 0,
  expected_opportunity_cost integer not null default 0,
  expected_profit integer not null default 0,
  cross_zone_risk boolean not null default false,
  single_client_risk boolean not null default false,
  cancellation_risk_note text,
  block_status text not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin alter table taipei_studio_blocks add constraint taipei_studio_blocks_zone_check check (zone_code in ('ximen','sun_yat_sen_memorial')); exception when duplicate_object then null; end $$;
do $$ begin alter table taipei_studio_blocks add constraint taipei_studio_blocks_room_type_check check (room_type in ('standard','pro','unknown')); exception when duplicate_object then null; end $$;
do $$ begin alter table taipei_studio_blocks add constraint taipei_studio_blocks_status_check check (block_status in ('draft','planning','open','locked','completed','cancelled')); exception when duplicate_object then null; end $$;

alter table booking_requests add column if not exists preferred_zone_code text;
alter table booking_requests add column if not exists actual_zone_code text;
alter table booking_requests add column if not exists client_area_code text;
alter table booking_requests add column if not exists zone_flexibility text not null default 'unknown';
alter table booking_requests add column if not exists distance_objection boolean not null default false;
alter table booking_requests add column if not exists studio_block_id uuid references taipei_studio_blocks(id);
alter table booking_requests add column if not exists cancellation_risk text not null default 'normal';
alter table booking_requests add column if not exists reschedule_suggestion text;
do $$ begin alter table booking_requests add constraint booking_requests_zone_flexibility_check check (zone_flexibility in ('fixed','flexible_same_day','flexible_other_day','unknown')); exception when duplicate_object then null; end $$;
do $$ begin alter table booking_requests add constraint booking_requests_cancellation_risk_check check (cancellation_risk in ('low','normal','high')); exception when duplicate_object then null; end $$;

create or replace view city_market_dashboard as
with lead_stats as (
  select city_code,
    count(*)::integer as registered_count,
    count(*) filter (where high_intent)::integer as high_intent_count,
    count(*) filter (where grooming_interest or service_interest = 'grooming_interest')::integer as grooming_interest_count,
    coalesce(sum(coalesce(expected_budget_twd,0)),0)::integer as estimated_revenue
  from location_demand_leads
  where lead_type = 'cross_city' and status = 'active'
  group by city_code
), top_services as (
  select city_code, service_interest as top_service_interest
  from (
    select city_code, service_interest, count(*) as c, row_number() over (partition by city_code order by count(*) desc, service_interest) as rn
    from location_demand_leads
    where lead_type='cross_city' and status='active' and service_interest is not null
    group by city_code, service_interest
  ) ranked where rn = 1
)
select m.city_code, m.display_name_zh, m.market_status, m.is_pilot_city,
  coalesce(l.registered_count,0) as registered_count,
  coalesce(l.high_intent_count,0) as high_intent_count,
  coalesce(l.grooming_interest_count,0) as grooming_interest_count,
  t.top_service_interest,
  m.known_high_intent_value_twd,
  (coalesce(l.estimated_revenue,0) + m.known_high_intent_value_twd)::integer as estimated_revenue,
  m.default_traffic_cost, m.default_hotel_cost_per_night, m.default_studio_cost_per_day, m.default_meal_misc_cost_per_day,
  m.target_profit_per_day, m.target_min_clients,
  case
    when m.is_pilot_city then 'pilot_city'
    when (coalesce(l.estimated_revenue,0) + m.known_high_intent_value_twd - m.default_traffic_cost - m.default_studio_cost_per_day) >= m.target_profit_per_day then 'profitable'
    when coalesce(l.high_intent_count,0) >= 3 then 'ready_to_plan'
    when coalesce(l.registered_count,0) >= 3 and coalesce(l.high_intent_count,0) < 2 then 'warming_up'
    when coalesce(l.registered_count,0) < 3 then 'watching'
    else 'watching'
  end as recommended_status
from city_markets m
left join lead_stats l on l.city_code = m.city_code
left join top_services t on t.city_code = m.city_code;

create or replace view taipei_zone_demand_dashboard as
with lead_stats as (
  select preferred_zone_code as zone_code,
    count(*)::integer as request_count,
    count(*) filter (where high_intent)::integer as high_intent_count,
    count(*) filter (where notes ilike '%距離%' or notes ilike '%六張犁%')::integer as distance_objection_count,
    count(*) filter (where preferred_time_type = 'flexible')::integer as flexible_count
  from location_demand_leads
  where lead_type = 'taipei_zone' and status = 'active'
  group by preferred_zone_code
), top_services as (
  select preferred_zone_code as zone_code, service_interest as top_service_interest
  from (
    select preferred_zone_code, service_interest, count(*) as c, row_number() over (partition by preferred_zone_code order by count(*) desc, service_interest) as rn
    from location_demand_leads
    where lead_type='taipei_zone' and status='active' and service_interest is not null
    group by preferred_zone_code, service_interest
  ) ranked where rn = 1
)
select z.zone_code, z.display_name_zh, z.area_group,
  coalesce(l.request_count,0) as request_count,
  coalesce(l.high_intent_count,0) as high_intent_count,
  coalesce(l.distance_objection_count,0) as distance_objection_count,
  t.top_service_interest,
  coalesce(l.flexible_count,0) as flexible_count,
  z.is_rental_space,
  z.default_room_cost,
  case
    when coalesce(l.distance_objection_count,0) >= 3 then 'improve_zone_communication'
    when z.is_rental_space = true and coalesce(l.high_intent_count,0) >= 2 then 'open_concentrated_block'
    when coalesce(l.request_count,0) >= 3 and coalesce(l.high_intent_count,0) >= 2 then 'consider_open_block'
    when coalesce(l.request_count,0) < 3 then 'collect_more_demand'
    else 'collect_more_demand'
  end as recommended_action
from taipei_service_zones z
left join lead_stats l on l.zone_code = z.zone_code
left join top_services t on t.zone_code = z.zone_code;

create or replace view taipei_demand_area_dashboard as
with lead_stats as (
  select client_area_code,
    count(*)::integer as request_count,
    count(*) filter (where high_intent)::integer as high_intent_count
  from location_demand_leads
  where lead_type = 'taipei_zone' and status = 'active'
  group by client_area_code
), top_services as (
  select client_area_code, service_interest as top_service_interest
  from (
    select client_area_code, service_interest, count(*) as c, row_number() over (partition by client_area_code order by count(*) desc, service_interest) as rn
    from location_demand_leads
    where lead_type='taipei_zone' and status='active' and service_interest is not null
    group by client_area_code, service_interest
  ) ranked where rn = 1
)
select a.area_code as client_area_code, a.display_name_zh, a.area_group,
  coalesce(l.request_count,0) as request_count,
  coalesce(l.high_intent_count,0) as high_intent_count,
  a.distance_to_liuzhangli_level,
  a.recommended_service_zone_code,
  t.top_service_interest
from taipei_demand_areas a
left join lead_stats l on l.client_area_code = a.area_code
left join top_services t on t.client_area_code = a.area_code;

create or replace view studio_block_dashboard as
select id as studio_block_id, zone_code, block_date, start_time, end_time, room_type, booked_slots,
  expected_revenue, expected_room_cost,
  case when expected_opportunity_cost <> 0 then expected_opportunity_cost when booked_slots = 0 then 2200 when booked_slots = 1 then 1000 else 0 end as expected_opportunity_cost,
  case when expected_profit <> 0 then expected_profit else expected_revenue - expected_room_cost - (case when booked_slots = 0 then 2200 when booked_slots = 1 then 1000 else 0 end) end as expected_profit,
  cross_zone_risk, single_client_risk, block_status
from taipei_studio_blocks;

create or replace view lead_nurturing_queue as
select id as lead_id, lead_type, display_name, city_code, client_area_code, preferred_zone_code,
  service_interest, main_issue, high_intent, nurture_status, created_at, notes
from location_demand_leads
where status = 'active' and nurture_status not in ('converted_to_booking','converted_to_client','archived')
order by high_intent desc, created_at asc;

alter table location_settings enable row level security;
alter table location_service_options enable row level security;
alter table city_markets enable row level security;
alter table location_demand_leads enable row level security;
alter table city_sessions enable row level security;
alter table taipei_service_zones enable row level security;
alter table taipei_demand_areas enable row level security;
alter table taipei_studio_blocks enable row level security;

notify pgrst, 'reload schema';
