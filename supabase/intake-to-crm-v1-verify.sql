-- Verify followups.source_key idempotency. Run after supabase/intake-to-crm-v1.sql in a disposable/staging DB.
begin;
insert into public.clients (display_name, client_name, source, current_stage)
values ('verification client', 'verification client', 'verify', 'lead_intake')
returning id \gset
insert into public.followups (client_id, followup_type, scheduled_date, message_summary, next_action, response_status, source_key)
values (:'id', 'day0', current_date, 'verify', 'verify', 'not_sent', 'intake:verify-source-key')
on conflict (source_key) do update set updated_at = now();
insert into public.followups (client_id, followup_type, scheduled_date, message_summary, next_action, response_status, source_key)
values (:'id', 'day0', current_date, 'verify again', 'verify', 'not_sent', 'intake:verify-source-key')
on conflict (source_key) do update set updated_at = now();
select count(*) = 1 as source_key_is_idempotent
from public.followups
where source_key = 'intake:verify-source-key';
rollback;
