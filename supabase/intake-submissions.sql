-- BodyFix public intake entry
create table if not exists public.intake_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null default 'public_intake',
  status text not null default 'new',
  display_name text not null,
  line_id text,
  phone text,
  birthday date,
  birth_time_note text,
  birth_place text,
  sun_sign text,
  extended_profile_status text,
  goals text[] not null default '{}',
  body_locations text[] not null default '{}',
  duration text,
  comfort_score int check (comfort_score is null or (comfort_score >= 0 and comfort_score <= 10)),
  previous_support text[] not null default '{}',
  state_recent text,
  state_improve text,
  state_feeling text,
  state_trend text,
  service_interest text,
  preferred_place text,
  preferred_time_note text,
  note text,
  raw_message text
);

create index if not exists idx_intake_submissions_created_at on public.intake_submissions (created_at desc);
create index if not exists idx_intake_submissions_status on public.intake_submissions (status);

alter table public.intake_submissions enable row level security;

-- Public users submit through the server route. Reads stay behind Clinic admin routes.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'intake_submissions'
      and policyname = 'intake_submissions_service_role_all'
  ) then
    create policy "intake_submissions_service_role_all"
      on public.intake_submissions
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;
