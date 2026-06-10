create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  interest text,
  source text default 'chart-navigator',
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

grant insert on table public.waitlist to anon;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'waitlist'
      and policyname = 'Anyone can insert waitlist'
  ) then
    create policy "Anyone can insert waitlist"
      on public.waitlist
      for insert
      to anon
      with check (true);
  end if;
end $$;
