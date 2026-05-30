-- BodyFix Part 6: Offer & Conversion System
-- Additive migration: reuses Clinic V1 plan_candidates and extends it into an internal conversion workflow.

alter table plan_candidates add column if not exists offer_type text;
alter table plan_candidates add column if not exists offer_title text;
alter table plan_candidates add column if not exists offer_price_twd integer;
alter table plan_candidates add column if not exists internal_rationale text;
alter table plan_candidates add column if not exists client_summary text;
alter table plan_candidates add column if not exists recommended_frequency text;
alter table plan_candidates add column if not exists recommended_next_step text;
alter table plan_candidates add column if not exists proposal_message text;
alter table plan_candidates add column if not exists internal_note text;
alter table plan_candidates add column if not exists sent_at timestamptz;
alter table plan_candidates add column if not exists won_at timestamptz;
alter table plan_candidates add column if not exists lost_at timestamptz;
alter table plan_candidates add column if not exists lost_reason text;
alter table plan_candidates add column if not exists next_followup_at date;

update plan_candidates
set offer_type = suggested_plan_type
where offer_type is null
  and suggested_plan_type in ('single_followup', 'three_session_reset', 'twelve_session_program');

update plan_candidates
set next_followup_at = last_checked_at::date
where next_followup_at is null
  and status in ('ready_to_pitch', 'pitched');

alter table plan_candidates drop constraint if exists plan_candidates_suggested_plan_type_check;
alter table plan_candidates add constraint plan_candidates_suggested_plan_type_check check (suggested_plan_type in (
  'single_followup', 'three_session_reset', 'twelve_session_program',
  'maintenance_plan', 'coach_integration', 'training_progression', 'watching'
));

alter table plan_candidates drop constraint if exists plan_candidates_status_check;
alter table plan_candidates add constraint plan_candidates_status_check check (status in (
  'watching', 'ready_to_pitch', 'pitched', 'accepted', 'rejected', 'paused',
  'draft', 'suggested', 'sent', 'discussing', 'won', 'lost', 'nurture'
));

alter table plan_candidates drop constraint if exists plan_candidates_offer_type_check;
alter table plan_candidates add constraint plan_candidates_offer_type_check check (offer_type is null or offer_type in (
  'single_followup', 'three_session_reset', 'twelve_session_program', 'deep_integration_24_plus_12'
));

create or replace view plan_candidate_summary as
select pc.id, pc.client_id, c.client_code, c.display_name, c.current_stage,
       pc.suggested_plan_type, pc.plan_score, pc.trigger_reason, pc.suggested_pitch,
       pc.status, c.last_session_date, count(sr.id)::integer as record_count, pc.updated_at,
       latest.service_date as last_service_date,
       coalesce(latest.service_name_snapshot, latest.service_code) as last_service_type,
       latest.main_complaint as latest_main_complaint,
       latest.next_focus as latest_next_focus,
       pc.offer_type, pc.offer_title, pc.offer_price_twd, pc.internal_rationale,
       pc.client_summary, pc.recommended_frequency, pc.recommended_next_step,
       pc.proposal_message, pc.internal_note, pc.sent_at, pc.won_at, pc.lost_at,
       pc.lost_reason, pc.next_followup_at
from plan_candidates pc
join clients c on c.id = pc.client_id
left join service_records sr on sr.client_id = c.id
left join lateral (
  select service_date, service_name_snapshot, service_code, main_complaint, next_focus
  from service_records r
  where r.client_id = c.id
  order by r.service_date desc, r.created_at desc
  limit 1
) latest on true
group by pc.id, c.id, latest.service_date, latest.service_name_snapshot, latest.service_code, latest.main_complaint, latest.next_focus
order by pc.plan_score desc, pc.updated_at desc;
