create table if not exists public.client_aliases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  alias_name text not null,
  alias_type text not null default 'manual',
  source text,
  created_at timestamptz not null default now()
);

create index if not exists client_aliases_client_id_idx
on public.client_aliases(client_id);

create index if not exists client_aliases_alias_name_idx
on public.client_aliases(alias_name);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.client_aliases to anon, authenticated;

alter table public.client_aliases enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'client_aliases'
      and policyname = 'pulse_v1_client_aliases_select'
  ) then
    create policy "pulse_v1_client_aliases_select"
    on public.client_aliases
    for select
    to anon, authenticated
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'client_aliases'
      and policyname = 'pulse_v1_client_aliases_insert'
  ) then
    create policy "pulse_v1_client_aliases_insert"
    on public.client_aliases
    for insert
    to anon, authenticated
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'client_aliases'
      and policyname = 'pulse_v1_client_aliases_update'
  ) then
    create policy "pulse_v1_client_aliases_update"
    on public.client_aliases
    for update
    to anon, authenticated
    using (true)
    with check (true);
  end if;
end $$;

alter table public.clients add column if not exists ig_id text;
update public.clients set ig_id = instagram where ig_id is null and instagram is not null;

alter table public.pulse_income_entries add column if not exists client_id uuid references public.clients(id) on delete set null;
alter table public.pulse_income_entries add column if not exists client_name_snapshot text;
alter table public.pulse_appointments add column if not exists client_id uuid references public.clients(id) on delete set null;
alter table public.pulse_appointments add column if not exists client_name_snapshot text;

create index if not exists pulse_income_entries_client_id_idx
on public.pulse_income_entries(client_id);

create index if not exists pulse_appointments_client_id_idx
on public.pulse_appointments(client_id);

notify pgrst, 'reload schema';
