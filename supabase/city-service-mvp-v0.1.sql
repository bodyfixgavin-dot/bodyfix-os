-- BodyFix City Service MVP v0.1 | Phase 0 additive draft
-- Purpose: extend location_demand_leads for city-service intent capture and seed additional city_markets.
-- Safe to review before execution. Do not run automatically in Phase 0.

-- 1) Extend existing location_demand_leads. Do not create a parallel city_requests table.
alter table location_demand_leads
  add column if not exists city_service_intent_level text,
  add column if not exists date_range_start date,
  add column if not exists date_range_end date,
  add column if not exists is_neighbor_city_ok boolean,
  add column if not exists wants_gavin_contact boolean,
  add column if not exists request_mode text,
  add column if not exists desired_date date,
  add column if not exists desired_time_note text,
  add column if not exists can_provide_space boolean,
  add column if not exists friend_joining_possible boolean;

-- Constraints are nullable so existing rows remain valid.
do $$ begin
  alter table location_demand_leads
    add constraint location_demand_leads_city_service_intent_level_check
    check (
      city_service_intent_level is null
      or city_service_intent_level in ('low','medium','high','ready_to_book')
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table location_demand_leads
    add constraint location_demand_leads_request_mode_check
    check (
      request_mode is null
      or request_mode in ('interest_only','date_range','specific_date','gavin_contact')
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table location_demand_leads
    add constraint location_demand_leads_date_range_check
    check (
      date_range_start is null
      or date_range_end is null
      or date_range_start <= date_range_end
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table location_demand_leads
    add constraint location_demand_leads_desired_time_note_length_check
    check (
      desired_time_note is null
      or char_length(desired_time_note) <= 500
    );
exception when duplicate_object then null;
end $$;

comment on column location_demand_leads.city_service_intent_level is 'City-service demand intent level for triage; nullable for legacy rows.';
comment on column location_demand_leads.date_range_start is 'Earliest acceptable city-service date when customer gives a range.';
comment on column location_demand_leads.date_range_end is 'Latest acceptable city-service date when customer gives a range.';
comment on column location_demand_leads.is_neighbor_city_ok is 'Whether nearby cities are acceptable if the requested city is unavailable.';
comment on column location_demand_leads.wants_gavin_contact is 'Whether the lead wants Gavin to contact them directly before planning.';
comment on column location_demand_leads.request_mode is 'City-service request mode such as interest-only, range, specific date, or Gavin contact.';
comment on column location_demand_leads.desired_date is 'Specific desired city-service date when provided by the lead.';
comment on column location_demand_leads.desired_time_note is 'Free-text time preference or scheduling note for city service.';
comment on column location_demand_leads.can_provide_space is 'Whether the lead may provide a usable space for the city service.';
comment on column location_demand_leads.friend_joining_possible is 'Whether the lead may bring friends or additional clients.';

-- 2) Add city_markets seeds for Hualien and Taitung without overwriting existing data.
insert into city_markets (
  city_code,
  display_name_zh,
  market_status,
  is_pilot_city,
  known_high_intent_value_twd,
  default_traffic_cost,
  default_hotel_cost_per_night,
  default_studio_cost_per_day,
  default_meal_misc_cost_per_day,
  target_profit_per_day,
  target_min_clients,
  default_total_time_hours,
  repeat_potential_score,
  travel_fatigue_level,
  notes
)
values
  ('hualien','花蓮','watching',false,0,3000,2200,1800,1000,10000,3,null,null,'high','東部城市需求觀察中；需評估交通時間、住宿與場地成本。'),
  ('taitung','台東','watching',false,0,4500,2400,1800,1200,10000,3,null,null,'high','東部長距離城市需求觀察中；需有足夠高意願需求再規劃。')
on conflict (city_code) do nothing;
