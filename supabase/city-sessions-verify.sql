-- BodyFix Clinic V1 | City Sessions verification
-- Run after supabase/city-sessions.sql.

select 'city_settings' as table_name, count(*)::int as rows from city_settings
union all
select 'city_profiles', count(*)::int from city_profiles
union all
select 'city_waitlist', count(*)::int from city_waitlist
union all
select 'city_sessions', count(*)::int from city_sessions;

select key, value from city_settings where key = 'public_status';

select city, city_category, route_group, priority_rank
from city_profiles
order by priority_rank asc;

insert into city_waitlist (
  city,
  preferred_time_blocks,
  service_interests,
  grooming_interest,
  high_intent,
  contact_name,
  instagram,
  main_issue,
  expected_budget
)
values (
  '台中',
  array['weekend_day'],
  array['fascia_chain_60', 'pelvic_core_60'],
  true,
  true,
  'TEST_CITY_CLIENT',
  '@test_city_client',
  '測試資料：髖卡、肩頸緊、想知道台中場次。',
  2500
)
returning id, city, high_intent, grooming_interest;

insert into city_sessions (
  city,
  status,
  session_title,
  planned_start_date,
  planned_end_date,
  location_type,
  max_slots,
  estimated_revenue,
  transport_cost,
  lodging_cost,
  workspace_cost,
  food_misc_cost,
  time_cost,
  notes
)
values (
  '台中',
  'registration_open',
  'BodyFix 台中城市需求登記測試場',
  current_date + interval '14 days',
  current_date + interval '16 days',
  'studio',
  10,
  22000,
  1600,
  4400,
  6000,
  1500,
  3000,
  '測試資料，可於確認後刪除。'
)
returning id, city, status, estimated_revenue;

select * from city_waitlist_summary where city = '台中';
select city, estimated_revenue, estimated_total_cost, estimated_net_profit, estimated_net_profit_per_day
from city_session_profit_view
where city = '台中'
order by created_at desc
limit 3;

-- Clean-up command for test data, run manually after verification if needed:
-- delete from city_waitlist where contact_name = 'TEST_CITY_CLIENT';
-- delete from city_sessions where session_title = 'BodyFix 台中城市需求登記測試場';
