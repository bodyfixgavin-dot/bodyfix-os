-- BodyFix Chart Navigator waitlist verification
-- Run after supabase/waitlist.sql. This script is read-only.

select
  to_regclass('public.waitlist') is not null as waitlist_table_exists;

select
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name = 'waitlist'
order by c.ordinal_position;

select
  c.relrowsecurity as row_level_security_enabled,
  has_table_privilege('anon', 'public.waitlist', 'INSERT') as anon_can_insert
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'waitlist';

select
  policyname,
  roles,
  cmd,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'waitlist'
order by policyname;
