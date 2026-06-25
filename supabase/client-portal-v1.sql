-- BodyFix Client Portal MVP v1
-- Stable auth_user_id links accounts to client profiles. Do not infer links from name, email, phone, or URL slugs.

create extension if not exists pgcrypto;

create table if not exists public.client_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_bookings (
  id uuid primary key default gen_random_uuid(),
  client_profile_id uuid not null references public.client_profiles(id) on delete cascade,
  service_name text not null,
  start_at timestamptz not null,
  location_label text,
  booking_status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_service_records (
  id uuid primary key default gen_random_uuid(),
  client_profile_id uuid not null references public.client_profiles(id) on delete cascade,
  service_date date not null,
  service_name text not null,
  session_focus text,
  client_summary text,
  follow_up_focus text,
  internal_notes text,
  client_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_home_recommendations (
  id uuid primary key default gen_random_uuid(),
  client_profile_id uuid not null references public.client_profiles(id) on delete cascade,
  service_record_id uuid references public.client_service_records(id) on delete set null,
  title text not null,
  instructions text not null,
  dosage text,
  caution text,
  client_visible boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_recommendation_logs (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references public.client_home_recommendations(id) on delete cascade,
  client_profile_id uuid not null references public.client_profiles(id) on delete cascade,
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (recommendation_id, client_profile_id, completed_on)
);

create table if not exists public.client_checkins (
  id uuid primary key default gen_random_uuid(),
  client_profile_id uuid not null references public.client_profiles(id) on delete cascade,
  checkin_date date not null default current_date,
  movement_ease text not null default '尚未回報' check (movement_ease in ('較容易', '差不多', '較不容易', '尚未回報')),
  tension_level text not null default '尚未回報' check (tension_level in ('較容易', '差不多', '較不容易', '尚未回報')),
  client_note text,
  created_at timestamptz not null default now()
);

create index if not exists client_bookings_profile_start_idx on public.client_bookings(client_profile_id, start_at);
create index if not exists client_records_profile_date_idx on public.client_service_records(client_profile_id, service_date desc) where client_visible = true;
create index if not exists client_recommendations_profile_visible_idx on public.client_home_recommendations(client_profile_id, sort_order) where client_visible = true;
create index if not exists client_checkins_profile_date_idx on public.client_checkins(client_profile_id, checkin_date desc);

alter table public.client_profiles enable row level security;
alter table public.client_bookings enable row level security;
alter table public.client_service_records enable row level security;
alter table public.client_home_recommendations enable row level security;
alter table public.client_recommendation_logs enable row level security;
alter table public.client_checkins enable row level security;

revoke all on public.client_profiles, public.client_bookings, public.client_service_records, public.client_home_recommendations, public.client_recommendation_logs, public.client_checkins from anon;
grant select on public.client_profiles, public.client_bookings, public.client_service_records, public.client_home_recommendations, public.client_recommendation_logs, public.client_checkins to authenticated;
grant insert on public.client_recommendation_logs to authenticated;

create or replace function public.client_portal_owns_profile(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.client_profiles cp
    where cp.id = profile_id and cp.auth_user_id = auth.uid()
  );
$$;

drop policy if exists "client profiles are self readable" on public.client_profiles;
create policy "client profiles are self readable" on public.client_profiles for select to authenticated using (auth_user_id = auth.uid());

drop policy if exists "client bookings are self readable" on public.client_bookings;
create policy "client bookings are self readable" on public.client_bookings for select to authenticated using (public.client_portal_owns_profile(client_profile_id));

drop policy if exists "client visible records are self readable" on public.client_service_records;
create policy "client visible records are self readable" on public.client_service_records for select to authenticated using (client_visible = true and public.client_portal_owns_profile(client_profile_id));

drop policy if exists "client visible recommendations are self readable" on public.client_home_recommendations;
create policy "client visible recommendations are self readable" on public.client_home_recommendations for select to authenticated using (client_visible = true and public.client_portal_owns_profile(client_profile_id));

drop policy if exists "client recommendation logs are self readable" on public.client_recommendation_logs;
create policy "client recommendation logs are self readable" on public.client_recommendation_logs for select to authenticated using (public.client_portal_owns_profile(client_profile_id));

drop policy if exists "clients insert own recommendation logs" on public.client_recommendation_logs;
create policy "clients insert own recommendation logs" on public.client_recommendation_logs for insert to authenticated with check (
  public.client_portal_owns_profile(client_profile_id)
  and exists (
    select 1 from public.client_home_recommendations r
    where r.id = recommendation_id
      and r.client_profile_id = client_recommendation_logs.client_profile_id
      and r.client_visible = true
  )
);

drop policy if exists "client checkins are self readable" on public.client_checkins;
create policy "client checkins are self readable" on public.client_checkins for select to authenticated using (public.client_portal_owns_profile(client_profile_id));

-- Service role keeps operational write access through Supabase's built-in RLS bypass.
