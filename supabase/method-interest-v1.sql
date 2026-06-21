create table if not exists public.method_interest_registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  professional_background text not null,
  interested_route text not null,
  contact_method text not null check (contact_method in ('LINE', 'Instagram', 'Email')),
  contact_value text not null,
  learning_question text,
  consent boolean not null default false,
  source text not null default 'method-page',
  status text not null default 'new'
);

alter table public.method_interest_registrations enable row level security;

create index if not exists method_interest_registrations_created_at_idx
  on public.method_interest_registrations (created_at desc);

create index if not exists method_interest_registrations_status_idx
  on public.method_interest_registrations (status);
