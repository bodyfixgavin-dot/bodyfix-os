-- Run after supabase/codebook-v0.2.sql.

select category_code, count(*) as entry_count
from codebook_entries
group by category_code
order by category_code;

select q.code as quick_filter_code, q.display_name_zh as quick_filter_name,
       t.code as tension_code, t.display_name_zh as tension_name
from codebook_entries q
join codebook_entries t
  on t.parent_category_code = q.category_code and t.parent_code = q.code
where q.category_code = 'quick_filter' and t.category_code = 'tension'
order by q.sort_order, t.sort_order;

select code, display_name_zh, metadata->>'sessions' as sessions, status
from package_codes
where code like 'PKG-FC-%' or code like 'PKG-PT-%'
order by sort_order;

select min(client_code) as first_client_code,
       max(client_code) as last_client_code,
       count(*) as total_clients
from clients
where client_code ~ '^C[0-9]+$';

begin;
insert into clients (client_name, display_name, line_id)
values ('Codebook Verify Client', 'Codebook Verify Client', 'codebook-verify-client')
returning client_code;
rollback;
