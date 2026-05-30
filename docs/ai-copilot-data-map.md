# BodyFix AI Copilot Data Map

This document defines the read-only fields used by the Part 7A BodyFix AI Copilot MVP. The AI copilot follows `docs/ai-copilot-principles.md`: server routes may read these fields, generate suggestions or drafts, and log AI outputs, but must not update official business tables.

| AI module | Source | Fields read | Purpose |
| --- | --- | --- | --- |
| AI Client Summary | `clients` | `id`, `display_name`, `nickname`, `main_issue`, `first_pain_point`, `current_stage`, `priority`, `total_sessions`, `total_spent`, `last_session_date`, `next_followup_date`, `internal_notes` | Build a concise client-state summary and next-step suggestion. |
| AI Client Summary | `service_records` | Latest 3 rows: `service_date`, `service_name_snapshot` / `service_code`, `record_mode`, `main_complaint`, `fatigue_state_assessment`, `body_region`, `processed_area`, `strategy`, `client_reaction`, `after_change`, `next_focus`, `internal_notes` | Understand recent service direction, body-area focus, client response, and next focus. |
| AI Client Summary | `plan_candidates` | `client_id`, `suggested_plan_type`, `status`, `trigger_reason`, `plan_score`, `offer_type`, `reason` via `trigger_reason`, `estimated_value` via `offer_price_twd`, `next_followup_date` via `next_followup_at`, `notes` via `internal_note` | Evaluate 3-session, 12-session, and 24+12 fit without changing candidate status. |
| AI Client Summary | `followups` | `client_id`, `followup_type`, `response_status` / `is_done` as status, `scheduled_date` as due date, `message_summary` / `next_action` as note, `client_response` as result | Summarize follow-up history and open follow-up risk. |
| AI Offer Message Generator | `clients` | `display_name`, `nickname`, `main_issue`, `current_stage` | Personalize draft wording while remaining non-medical. |
| AI Offer Message Generator | `plan_candidates` | `suggested_plan_type`, `status`, `trigger_reason`, `plan_score`, `offer_type`, `offer_title`, `offer_price_twd`, `internal_rationale`, `client_summary`, `recommended_frequency`, `recommended_next_step`, `proposal_message`, `internal_note`, `next_followup_at` | Generate LINE / IG draft, internal proposal summary, follow-up draft, and nurture draft. |
| AI Offer Message Generator | Part 4 services | `serviceCode`, `nameZh`, `recommendedPriceTwd`, `durationMinutes`, `status`, `revenueModel`, `internalPositioning` / `positioning`, `externalOneLiner` | Ground offer drafts in active BodyFix service references. |
| AI Today Follow-up | `followups` | `scheduled_date` as due date, `response_status`, `is_done`, `followup_type`, `message_summary`, `client_response`, `next_action` | Identify due and overdue follow-ups. |
| AI Today Follow-up | `clients` | `display_name`, `current_stage`, `priority`, `last_session_date`, `next_followup_date` | Prioritize client follow-up list. |
| AI Today Follow-up | `plan_candidates` | `suggested_plan_type`, `status`, `plan_score`, `offer_price_twd` as estimated value, `next_followup_at` | Identify high-intent plan candidates and unfinished offers. |
| Location Demand Analysis Only | `location_demand_leads` | `lead_type`, `city_code`, `client_area_code`, `preferred_zone_code`, `service_interest`, `high_intent`, distance objection inferred from `notes`, `expected_budget_twd`, `nurture_status`, `notes` | Summarize demand and distance-friction signals only. |
| Location Demand Analysis Only | `city_market_dashboard` | All dashboard summary fields | Analyze city demand warming signals. |
| Location Demand Analysis Only | `taipei_zone_demand_dashboard` | All dashboard summary fields | Analyze Ximen, Sun Yat-Sen Memorial Hall, and other zone demand. |
| Location Demand Analysis Only | `taipei_demand_area_dashboard` | All dashboard summary fields | Analyze source-area friction and Liuzhangli distance objections. |
| Location Demand Analysis Only | `studio_block_dashboard` | All dashboard summary fields | Analyze concentrated block feasibility without generating invitation drafts. |
