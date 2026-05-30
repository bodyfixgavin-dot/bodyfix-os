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
export const PLAN_FIELDS = ["client_id", "suggested_plan_type", "plan_score", "trigger_reason", "suggested_pitch", "status", "last_checked_at"];
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
