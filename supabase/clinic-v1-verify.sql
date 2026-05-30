-- BodyFix Clinic V1 demo seed / verification data
-- Run after supabase/clinic-v1.sql in a non-production verification database.

with seeded_clients as (
  insert into clients (
    client_code, client_name, display_name, nickname, line_id, phone, instagram,
    city, home_city, preferred_city, main_issue, first_pain_point,
    current_stage, priority, total_sessions, total_spent, last_session_date,
    next_followup_date, case_permission
  ) values
    ('BF-DEMO1', 'Demo 一般新客', 'Demo A', '新客A', 'demo_new_001', '0900000001', 'demo_new', '台北', 'taipei', 'taipei', '肩頸與胸廓緊繃', '肩頸卡住', 'first_done', 'P2', 1, 2600, current_date - 1, current_date, 'unknown'),
    ('BF-DEMO3', 'Demo 三次候選', 'Demo B', '三次候選', 'demo_three_001', '0900000002', 'demo_three', '台北', 'taipei', 'taipei', '骨盆與髖接回不穩定', '髖卡與下背緊', 'three_session_candidate', 'P1', 1, 2600, current_date - 2, current_date + 2, 'approved_anonymous'),
    ('BF-DEMO12', 'Demo 十二次候選', 'Demo C', '十二次候選', 'demo_twelve_001', '0900000003', 'demo_twelve', '台中', 'taichung', 'taipei', '長期代償與訓練卡關', '訓練時左右發力差異', 'twelve_session_candidate', 'P1', 2, 5200, current_date - 3, current_date + 1, 'approved_partial'),
    ('BF-DEMO-M', 'Demo 續航客', 'Demo D', '續航客', 'demo_maintain_001', '0900000004', 'demo_maintain', '高雄', 'kaohsiung', 'taipei', '定期筋膜整理與狀態續航', '疲勞累積', 'maintenance', 'P3', 8, 20800, current_date - 14, current_date + 14, 'unknown')
  on conflict (client_code) do update set
    display_name = excluded.display_name,
    current_stage = excluded.current_stage,
    priority = excluded.priority,
    updated_at = now()
  returning id, client_code
), demo_records as (
  insert into service_records (
    client_id, service_date, record_mode, service_code, service_name_snapshot,
    duration_minutes, price_twd, main_complaint, fatigue_state_assessment,
    main_tension_area, processed_area, strategy, client_reaction,
    after_change, next_focus, dominant_fascia_line, body_region,
    satisfaction_score, followup_needed, next_followup_date, case_candidate, plan_candidate
  )
  select id, current_date - 1, 'full', 'BF-BR-001', '筋膜整理 60',
         60, 2600, '肩頸與胸廓緊繃，呼吸容易卡住', '睡眠不足與工作壓力造成疲勞累積狀態',
         '肩頸肩帶與胸廓', '胸廓、肩帶、上背', '張力判讀後先做呼吸與胸廓調節，再接肩帶整合',
         '整理後覺得轉頭比較順', '肩頸壓力下降，呼吸較深', '觀察肩帶與胸廓能否接回日常使用',
         'front line', 'shoulder_neck', 5, true, current_date, true, false
  from seeded_clients where client_code = 'BF-DEMO1'
  union all
  select id, current_date - 2, 'full', 'BF-BR-001', '筋膜整理 60',
         60, 2600, '髖與骨盆接回不穩，久坐後下背緊', '久坐疲勞累積，左右張力不同步',
         '骨盆與髖', '骨盆、髖、下背', '先整理骨盆周邊張力，再做左右整合',
         '站起來骨盆比較穩', '髖活動度提升，下背壓力下降', '第二次觀察反應並調整策略',
         'spiral line', 'pelvis_hip', 5, true, current_date + 2, false, true
  from seeded_clients where client_code = 'BF-DEMO3'
  union all
  select id, current_date - 3, 'full', 'BF-BR-002', '筋膜整理 90',
         90, 3600, '長期訓練卡關，左右發力落差反覆出現', '恢復差且累積代償明顯',
         '骨盆、胸廓、肩帶', '胸廓、骨盆、髖、肩帶', '用 12 次完整計畫拆解反覆模式並接回訓練',
         '覺得深蹲時左右比較平均', '發力感比較連續', '建立長期整理與教練整合路線',
         'deep front line', 'whole_body', 5, true, current_date + 1, false, true
  from seeded_clients where client_code = 'BF-DEMO12'
  union all
  select id, current_date - 14, 'quick', 'BF-BR-001', '筋膜整理 60',
         60, 2600, '疲勞累積後肩頸容易緊', null,
         '肩頸肩帶', '肩帶、胸廓', null,
         '放鬆速度比以前快', '狀態已穩定，適合續航整理', '維持每月一次續航 / 訂閱節奏',
         null, 'shoulder_neck', 4, true, current_date + 14, false, true
  from seeded_clients where client_code = 'BF-DEMO-M'
  on conflict do nothing
  returning id, client_id
)
insert into followups (client_id, service_record_id, followup_type, scheduled_date, message_summary, response_status, next_action)
select client_id, id, 'day1', current_date, '確認整理後肩頸與呼吸狀態，提醒回家作業節奏。', 'not_sent', '若狀態穩定，安排下一次觀察。'
from demo_records
limit 1;

insert into plan_candidates (client_id, suggested_plan_type, plan_score, trigger_reason, suggested_pitch, status)
select id, 'three_session_reset', 82, '第一次整理後反應明確，仍需觀察反覆模式。', '建議用 3 次短週期整理：判讀、觀察反應、確認下一步路線。', 'ready_to_pitch'
from clients where client_code = 'BF-DEMO3'
on conflict do nothing;

insert into plan_candidates (client_id, suggested_plan_type, plan_score, trigger_reason, suggested_pitch, status)
select id, 'twelve_session_program', 91, '長期代償、恢復差與訓練卡關同時存在。', '建議進入 12 次完整計畫，把整理後的活動度與穩定度接回訓練。', 'ready_to_pitch'
from clients where client_code = 'BF-DEMO12'
on conflict do nothing;

insert into plan_candidates (client_id, suggested_plan_type, plan_score, trigger_reason, suggested_pitch, status)
select id, 'maintenance_plan', 70, '主要問題已穩定，適合用固定節奏維持狀態。', '建議續航 / 訂閱，定期整理疲勞累積狀態。', 'watching'
from clients where client_code = 'BF-DEMO-M'
on conflict do nothing;

insert into case_assets (case_code, client_id, service_record_id, case_type, pain_keyword, assessment_keyword, before_summary, after_summary, evidence_type, publish_permission, content_status, internal_value_score, ai_summary)
select 'CASE-DEMO-001', sr.client_id, sr.id, 'movement', '肩頸胸廓', '呼吸與胸廓調節', '肩頸與胸廓緊繃，呼吸容易卡住。', '整理後轉頭較順，呼吸較深。', 'text_feedback', 'approved_anonymous', 'raw', 80,
       '一位台北客戶在肩頸與胸廓張力整理後，回報轉頭與呼吸較順。摘要已移除姓名、電話、LINE ID、IG、生日與地址。'
from service_records sr
join clients c on c.id = sr.client_id
where c.client_code = 'BF-DEMO1'
limit 1
on conflict (case_code) do update set updated_at = now();

select 'clients' as table_name, count(*) from clients where client_code like 'BF-DEMO%'
union all select 'service_records', count(*) from service_records sr join clients c on c.id = sr.client_id where c.client_code like 'BF-DEMO%'
union all select 'followups', count(*) from followups f join clients c on c.id = f.client_id where c.client_code like 'BF-DEMO%'
union all select 'plan_candidates', count(*) from plan_candidates pc join clients c on c.id = pc.client_id where c.client_code like 'BF-DEMO%'
union all select 'case_assets', count(*) from case_assets ca join clients c on c.id = ca.client_id where c.client_code like 'BF-DEMO%';
