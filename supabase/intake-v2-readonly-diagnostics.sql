-- Read-only diagnostics for the EXISTING BodyFix project. No DDL or data changes.
-- Run in Supabase Dashboard > existing project > SQL Editor.
begin transaction read only;

select current_database(), current_user;

-- Find the existing intake table (including unexpected schemas/names).
select schemaname, tablename, rowsecurity
from pg_tables
where tablename ilike '%intake%' or tablename = 'taipei_service_zones';

select table_schema, table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'intake_submissions'
order by table_schema, ordinal_position;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where tablename = 'intake_submissions';

select table_schema, table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_name = 'intake_submissions'
  and grantee in ('service_role', 'anon', 'authenticated');

select n.nspname as schema_name, c.relname as table_name,
       pg_get_constraintdef(k.oid) as primary_key_definition
from pg_constraint k
join pg_class c on c.oid = k.conrelid
join pg_namespace n on n.oid = c.relnamespace
where c.relname = 'intake_submissions' and k.contype = 'p';

-- Some settings are null when inherited from defaults; inspect Data API settings too.
select current_setting('pgrst.db_schemas', true) as exposed_schemas;

rollback;
