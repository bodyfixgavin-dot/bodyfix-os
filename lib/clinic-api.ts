import { NextResponse } from "next/server";
import { requireBookingAdmin } from "@/lib/booking-admin";

export async function requireClinicAdmin() {
  return requireBookingAdmin();
}

export async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

export function cleanPayload(input: Record<string, unknown>, allowed: string[]) {
  return Object.fromEntries(
    allowed
      .filter((key) => Object.prototype.hasOwnProperty.call(input, key))
      .map((key) => [key, input[key] === "" ? null : input[key]])
  );
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export const CLIENT_FIELDS = [
  "client_name", "line_id", "phone", "client_code", "display_name", "nickname", "instagram", "birthday", "city",
  "occupation", "exercise_habit", "old_injury_history", "main_issue", "has_coaching_experience", "source", "home_city",
  "preferred_city", "service_mode_preference", "first_contact_date", "first_pain_point", "current_stage", "priority",
  "total_sessions", "total_spent", "last_session_date", "next_followup_date", "case_permission", "internal_notes"
];

export const RECORD_FIELDS = [
  "client_id", "service_date", "record_mode", "service_code", "service_name_snapshot", "duration_minutes", "price_twd",
  "main_complaint", "fatigue_state_assessment", "main_tension_area", "processed_area", "strategy", "client_reaction",
  "after_change", "next_focus", "internal_notes", "dominant_fascia_line", "body_region", "satisfaction_score",
  "followup_needed", "next_followup_date", "case_candidate", "plan_candidate"
];

export const HOMEWORK_FIELDS = ["client_id", "service_record_id", "breathing_cue", "movement_cue", "suggested_frequency", "notice", "status"];
export const FOLLOWUP_FIELDS = ["client_id", "service_record_id", "followup_type", "scheduled_date", "sent_at", "message_template", "message_summary", "client_response", "response_status", "next_action", "is_done"];
export const PLAN_FIELDS = [
  "client_id", "suggested_plan_type", "plan_score", "trigger_reason", "suggested_pitch", "status", "last_checked_at",
  "offer_type", "offer_title", "offer_price_twd", "internal_rationale", "client_summary", "recommended_frequency",
  "recommended_next_step", "proposal_message", "internal_note", "sent_at", "won_at", "lost_at", "lost_reason",
  "next_followup_at"
];
export const CASE_FIELDS = ["case_code", "client_id", "service_record_id", "case_type", "pain_keyword", "assessment_keyword", "before_summary", "after_summary", "client_quote", "evidence_type", "publish_permission", "content_status", "internal_value_score", "ai_summary"];

export function makeClientCode() {
  return `BF-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

export function withoutIdentity(client: Record<string, unknown>) {
  return {
    client_code: client.client_code,
    city: client.city ?? client.home_city,
    current_stage: client.current_stage,
    main_issue: client.main_issue,
    priority: client.priority,
    total_sessions: client.total_sessions,
    last_session_date: client.last_session_date,
    next_followup_date: client.next_followup_date
  };
}

export const LOCATION_LEAD_FIELDS = [
  "lead_type", "display_name", "line_id", "instagram", "phone", "privacy_consent", "privacy_consent_at",
  "city_code", "client_area_code", "preferred_zone_code", "secondary_zone_code", "service_interest", "main_issue",
  "preferred_time_type", "high_intent", "grooming_interest", "deposit_willing", "expected_budget_twd",
  "expected_repeat_willingness", "repeat_potential_score", "total_time_estimate_hours", "travel_fatigue_level",
  "source", "nurture_status", "status", "notes"
];

export const CITY_MARKET_FIELDS = [
  "display_name_zh", "market_status", "is_pilot_city", "known_high_intent_value_twd", "default_traffic_cost",
  "default_hotel_cost_per_night", "default_studio_cost_per_day", "default_meal_misc_cost_per_day",
  "target_profit_per_day", "target_min_clients", "default_total_time_hours", "repeat_potential_score",
  "travel_fatigue_level", "notes"
];

export const CITY_SESSION_FIELDS = [
  "city_code", "session_name", "session_status", "start_date", "end_date", "location_name", "location_address",
  "max_slots", "confirmed_slots", "estimated_revenue", "traffic_cost", "hotel_cost", "studio_cost",
  "meal_misc_cost", "other_cost", "estimated_profit", "estimated_profit_per_day", "total_time_hours",
  "fatigue_note", "deposit_required", "deposit_amount", "deposit_deadline", "internal_notes"
];

export const TAIPEI_ZONE_FIELDS = [
  "display_name_zh", "area_group", "status", "is_regular_base", "is_rental_space", "requires_block_booking",
  "default_minimum_hours", "default_room_cost", "default_travel_minutes_from_home", "default_buffer_minutes",
  "cost_type", "notes"
];

export const STUDIO_BLOCK_FIELDS = [
  "zone_code", "block_date", "start_time", "end_time", "room_type", "room_cost", "minimum_hours",
  "travel_minutes", "buffer_minutes", "planned_slots", "booked_slots", "expected_revenue", "expected_room_cost",
  "expected_opportunity_cost", "expected_profit", "cross_zone_risk", "single_client_risk", "cancellation_risk_note",
  "block_status", "notes"
];
