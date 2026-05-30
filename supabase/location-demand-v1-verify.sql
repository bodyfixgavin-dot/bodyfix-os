-- BodyFix Part 3 verification data and dashboard smoke queries.
-- Run after supabase/location-demand-v1.sql in a non-production or staging project.

begin;

delete from location_demand_leads where source = 'location_demand_verify';
delete from taipei_studio_blocks where notes like 'Verify demo:%';

insert into location_demand_leads (lead_type, display_name, city_code, service_interest, main_issue, preferred_time_type, high_intent, grooming_interest, expected_budget_twd, source, nurture_status, notes) values
('cross_city','台中 Lead 1','taichung','pelvic_core_reset_60','骨盆與下背緊繃','weekend_day',true,false,2500,'location_demand_verify','high_intent','Verify demo: 台中高意願'),
('cross_city','台中 Lead 2','taichung','pelvic_core_reset_60','髖關節卡卡','weekday_night',true,false,2500,'location_demand_verify','high_intent','Verify demo: 台中高意願'),
('cross_city','台中 Lead 3','taichung','multi_line_reset_90','多線整合需求','weekend_day',true,false,3600,'location_demand_verify','high_intent','Verify demo: 台中高意願'),
('cross_city','台中 Lead 4','taichung','fascia_chain_reset_60','筋膜鏈整理','flexible',false,false,2200,'location_demand_verify','registered','Verify demo: 台中需求'),
('cross_city','台中 Lead 5','taichung','grooming_interest','熱蠟除毛興趣','flexible',false,true,null,'location_demand_verify','registered','Verify demo: grooming interest'),
('cross_city','高雄 Lead 1','kaohsiung','ziwei_structural_analysis_90','紫微結構解析','weekend_day',true,false,3600,'location_demand_verify','high_intent','Verify demo: 高雄高意願'),
('cross_city','高雄 Lead 2','kaohsiung','fascia_chain_reset_60','筋膜鏈整理','weekend_night',true,false,2200,'location_demand_verify','high_intent','Verify demo: 高雄高意願'),
('cross_city','高雄 Lead 3','kaohsiung','tarot_addon_30','塔羅加購興趣','flexible',false,false,666,'location_demand_verify','registered','Verify demo: 高雄需求'),
('cross_city','高雄 Lead 4','kaohsiung','pelvic_core_reset_60','骨盆整理','weekday_night',false,false,2500,'location_demand_verify','registered','Verify demo: 高雄需求'),
('cross_city','台南 Lead 1','tainan','pelvic_core_reset_60','骨盆核心整理','weekend_day',true,false,2500,'location_demand_verify','high_intent','Verify demo: 台南高意願'),
('cross_city','台南 Lead 2','tainan','fascia_line_selected_reset_60','指定筋膜線','weekday_night',true,false,2300,'location_demand_verify','high_intent','Verify demo: 台南高意願'),
('cross_city','台南 Lead 3','tainan','fascia_chain_reset_60','筋膜鏈整理','flexible',false,false,2200,'location_demand_verify','registered','Verify demo: 台南需求'),
('cross_city','宜蘭 Pilot Lead','yilan','multi_line_reset_90','已收到 NT$6,000 高意願需求','flexible',true,false,6000,'location_demand_verify','high_intent','已收到 NT$6,000 高意願需求，作為 Pilot City 測試案例。');

insert into location_demand_leads (lead_type, display_name, client_area_code, preferred_zone_code, service_interest, main_issue, preferred_time_type, high_intent, expected_budget_twd, expected_repeat_willingness, repeat_potential_score, travel_fatigue_level, source, nurture_status, notes) values
('taipei_zone','板橋 Lead 1','new_taipei_banqiao','ximen','fascia_chain_reset_60','六張犁距離疑慮，偏好西門','weekend_day',true,2200,'maybe',2,'medium','location_demand_verify','high_intent','Verify demo: 新北板橋偏好西門，距離六張犁較遠'),
('taipei_zone','板橋 Lead 2','new_taipei_banqiao','ximen','pelvic_core_reset_60','偏好西門集中時段','weekday_night',true,2500,'yes',3,'medium','location_demand_verify','high_intent','Verify demo: 新北板橋偏好西門，距離六張犁較遠'),
('taipei_zone','板橋 Lead 3','new_taipei_banqiao','ximen','multi_line_reset_90','西區方便','flexible',false,3600,'maybe',2,'medium','location_demand_verify','registered','Verify demo: 新北板橋偏好西門'),
('taipei_zone','三重 Lead 1','new_taipei_sanchong','ximen','fascia_chain_reset_60','新北西區到六張犁較遠','weekend_day',true,2200,'maybe',2,'medium','location_demand_verify','high_intent','Verify demo: 新北三重偏好西門，距離六張犁較遠'),
('taipei_zone','三重 Lead 2','new_taipei_sanchong','ximen','pelvic_core_reset_60','偏好西門','weekday_night',false,2500,'unknown',null,'medium','location_demand_verify','registered','Verify demo: 新北三重偏好西門'),
('taipei_zone','松山信義 Lead 1','taipei_songshan_xinyi','sun_yat_sen_memorial','pelvic_core_reset_60','東區與信義較方便','weekday_night',true,2500,'yes',3,'low','location_demand_verify','high_intent','Verify demo: 偏好國父紀念館'),
('taipei_zone','松山信義 Lead 2','taipei_songshan_xinyi','sun_yat_sen_memorial','ziwei_structural_analysis_90','國父紀念館方便','weekend_day',true,3600,'maybe',2,'low','location_demand_verify','high_intent','Verify demo: 偏好國父紀念館'),
('taipei_zone','大安 Lead 1','taipei_daan','liuzhangli','fascia_chain_reset_60','六張犁可接受','weekday_night',true,2200,'yes',3,'low','location_demand_verify','high_intent','Verify demo: 偏好六張犁'),
('taipei_zone','大安 Lead 2','taipei_daan','liuzhangli','pelvic_core_reset_60','六張犁常態據點方便','weekend_day',false,2500,'maybe',2,'low','location_demand_verify','registered','Verify demo: 偏好六張犁');

insert into taipei_studio_blocks (zone_code, block_date, start_time, end_time, room_type, booked_slots, expected_revenue, expected_room_cost, expected_opportunity_cost, expected_profit, single_client_risk, block_status, notes) values
('ximen', current_date + interval '14 days', '14:00', '16:00', 'standard', 1, 2200, 300, 1000, 900, true, 'planning', 'Verify demo: 西門單一客戶風險'),
('sun_yat_sen_memorial', current_date + interval '21 days', '18:00', '20:00', 'standard', 2, 5000, 310, 0, 4690, false, 'planning', 'Verify demo: 國父紀念館集中區塊');

commit;

select * from city_market_dashboard;
select * from taipei_zone_demand_dashboard;
select * from taipei_demand_area_dashboard;
select * from studio_block_dashboard;
select * from lead_nurturing_queue;
