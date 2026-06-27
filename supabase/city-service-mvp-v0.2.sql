-- BodyFix City Service MVP v0.2 | Production-aligned additive draft
-- DO NOT RUN automatically. Review Preflight results before execution.
-- Purpose: extend public.city_registrations only. Production has city_registrations/city_sessions/city_settings, but not location_demand_leads/city_markets.

alter table public.city_registrations
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

-- Constraint guards: if a same-name constraint already exists, verify that it matches the intended nullable-safe definition before relying on duplicate_object handling.
do $$
declare
  existing_definition text;
  expected_definition text := 'CHECK (((city_service_intent_level IS NULL) OR (city_service_intent_level = ANY (ARRAY[''low''::text, ''medium''::text, ''high''::text, ''ready_to_book''::text]))))';
begin
  select pg_get_constraintdef(c.oid) into existing_definition
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'city_registrations'
    and c.conname = 'city_registrations_city_service_intent_level_check';

  if existing_definition is not null and existing_definition <> expected_definition then
    raise exception 'Existing constraint city_registrations_city_service_intent_level_check differs: %', existing_definition;
  end if;

  begin
    alter table public.city_registrations
      add constraint city_registrations_city_service_intent_level_check
      check (
        city_service_intent_level is null
        or city_service_intent_level in ('low','medium','high','ready_to_book')
      );
  exception when duplicate_object then null;
  end;
end $$;

do $$
declare
  existing_definition text;
  expected_definition text := 'CHECK (((request_mode IS NULL) OR (request_mode = ANY (ARRAY[''interest_only''::text, ''date_range''::text, ''specific_date''::text, ''gavin_contact''::text]))))';
begin
  select pg_get_constraintdef(c.oid) into existing_definition
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'city_registrations'
    and c.conname = 'city_registrations_request_mode_check';

  if existing_definition is not null and existing_definition <> expected_definition then
    raise exception 'Existing constraint city_registrations_request_mode_check differs: %', existing_definition;
  end if;

  begin
    alter table public.city_registrations
      add constraint city_registrations_request_mode_check
      check (
        request_mode is null
        or request_mode in ('interest_only','date_range','specific_date','gavin_contact')
      );
  exception when duplicate_object then null;
  end;
end $$;

do $$
declare
  existing_definition text;
  expected_definition text := 'CHECK (((date_range_start IS NULL) OR (date_range_end IS NULL) OR (date_range_start <= date_range_end)))';
begin
  select pg_get_constraintdef(c.oid) into existing_definition
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'city_registrations'
    and c.conname = 'city_registrations_date_range_check';

  if existing_definition is not null and existing_definition <> expected_definition then
    raise exception 'Existing constraint city_registrations_date_range_check differs: %', existing_definition;
  end if;

  begin
    alter table public.city_registrations
      add constraint city_registrations_date_range_check
      check (
        date_range_start is null
        or date_range_end is null
        or date_range_start <= date_range_end
      );
  exception when duplicate_object then null;
  end;
end $$;

do $$
declare
  existing_definition text;
  expected_definition text := 'CHECK (((desired_time_note IS NULL) OR (char_length(desired_time_note) <= 500)))';
begin
  select pg_get_constraintdef(c.oid) into existing_definition
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'city_registrations'
    and c.conname = 'city_registrations_desired_time_note_length_check';

  if existing_definition is not null and existing_definition <> expected_definition then
    raise exception 'Existing constraint city_registrations_desired_time_note_length_check differs: %', existing_definition;
  end if;

  begin
    alter table public.city_registrations
      add constraint city_registrations_desired_time_note_length_check
      check (
        desired_time_note is null
        or char_length(desired_time_note) <= 500
      );
  exception when duplicate_object then null;
  end;
end $$;

comment on column public.city_registrations.city_service_intent_level is 'City-service demand intent level for triage; nullable when unanswered.';
comment on column public.city_registrations.date_range_start is 'Earliest acceptable city-service date when the registrant gives a range.';
comment on column public.city_registrations.date_range_end is 'Latest acceptable city-service date when the registrant gives a range.';
comment on column public.city_registrations.is_neighbor_city_ok is 'Whether nearby cities are acceptable if the requested city is unavailable; NULL means unanswered.';
comment on column public.city_registrations.wants_gavin_contact is 'Whether the registrant wants Gavin to contact them directly.';
comment on column public.city_registrations.request_mode is 'City-service request mode such as interest-only, date range, specific date, or Gavin contact.';
comment on column public.city_registrations.desired_date is 'Specific desired city-service date when provided by the registrant.';
comment on column public.city_registrations.desired_time_note is 'Free-text time preference or scheduling note for city service, limited to 500 characters.';
comment on column public.city_registrations.can_provide_space is 'Whether the registrant may provide a usable space for city service; NULL means unanswered.';
comment on column public.city_registrations.friend_joining_possible is 'Whether the registrant may bring friends or additional clients; NULL means unanswered.';
