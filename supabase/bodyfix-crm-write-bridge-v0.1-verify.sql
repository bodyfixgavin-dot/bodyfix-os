-- Read-only verification for BodyFix CRM Write Bridge v0.1
select to_regclass('public.clients') as clients_table,
       to_regclass('public.service_records') as service_records_table,
       to_regclass('public.followups') as followups_table,
       to_regclass('public.crm_intake_requests') as crm_intake_requests_table;

select routine_schema, routine_name, data_type
from information_schema.routines
where routine_schema = 'public' and routine_name = 'bodyfix_crm_intake';

select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('service_records', 'followups', 'crm_intake_requests')
order by table_name, ordinal_position;
