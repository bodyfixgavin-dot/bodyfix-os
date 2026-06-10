-- Run manually after applying supabase/codebook-v0.2.1.sql to a dev branch.
-- This file is read-only and does not inspect or modify production customer data.

select count(*) as category_count from public.codebook_categories;
select count(*) as item_count from public.codebook_items;
select category_key, count(*) as item_count from public.codebook_items group by category_key order by category_key;

select code, quick_filter_code, metadata->'alternative_quick_filters' as alternative_quick_filters
from public.codebook_items
where code in ('LT-PHONE', 'LT-GAMER', 'TR-WEIGHT', 'TR-BOXING')
order by code;

select code, name_en, short_label, metadata
from public.codebook_items
where category_key = 'CHART_NAVIGATOR' and group_key = 'jyotish'
order by sort_order;

select count(*) filter (where is_coming_soon) as coming_soon_count,
       count(*) filter (where not is_coming_soon) as incorrectly_live_count
from public.codebook_items
where category_key = 'CHART_NAVIGATOR';

select column_name
from information_schema.columns
where table_schema = 'public' and table_name in ('service_records', 'followup_tasks')
  and column_name in ('service_code', 'package_code', 'task_code', 'priority_code')
order by table_name, column_name;
