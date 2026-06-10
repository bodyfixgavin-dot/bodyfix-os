-- Run after supabase/codebook-v0.2.1.sql. All assertions are read-only.

do $$
declare
  category_count integer;
  item_count integer;
  chart_not_coming_soon integer;
  duplicate_code_count integer;
begin
  select count(*) into category_count from public.codebook_categories;
  if category_count < 17 then raise exception 'Expected at least 17 codebook categories, found %', category_count; end if;

  select count(*) into item_count from public.codebook_items;
  if item_count < 200 then raise exception 'Expected at least 200 codebook items, found %', item_count; end if;

  select count(*) into chart_not_coming_soon
  from public.codebook_items
  where category_key = 'CHART_NAVIGATOR' and is_coming_soon is not true;
  if chart_not_coming_soon > 0 then raise exception 'Found % Chart Navigator items not marked coming soon', chart_not_coming_soon; end if;

  select count(*) into duplicate_code_count
  from (select code from public.codebook_items group by code having count(*) > 1) duplicates;
  if duplicate_code_count > 0 then raise exception 'Found % duplicate global codes', duplicate_code_count; end if;
end $$;

select category_key, count(*) as item_count
from public.codebook_items
group by category_key
order by category_key;

select code, quick_filter_code, metadata->'alternative_quick_filters' as alternative_quick_filters
from public.codebook_items
where code in ('LT-PHONE', 'LT-GAMER', 'TR-WEIGHT', 'TR-BOXING')
order by code;

select code, name_en, short_label, metadata
from public.codebook_items
where category_key = 'CHART_NAVIGATOR' and group_key = 'jyotish'
order by sort_order;
