export type ClinicStage =
  | "lead_dm"
  | "booked"
  | "first_done"
  | "followup"
  | "repeat"
  | "three_session_candidate"
  | "three_session_client"
  | "twelve_session_candidate"
  | "twelve_session_client"
  | "maintenance"
  | "coach_integration"
  | "lost";

export type ClientPriority = "P1" | "P2" | "P3";
export type RecordMode = "quick" | "full";
export type FollowupType = "day0" | "day1" | "day3" | "day7" | "day14" | "day30" | "wake_up" | "other";
export type FollowupStatus = "not_sent" | "no_reply" | "positive" | "neutral" | "negative" | "booked" | "rejected";
export type PlanType = "single_followup" | "three_session_reset" | "twelve_session_program" | "maintenance_plan" | "coach_integration" | "training_progression" | "watching";
export type PlanStatus = "watching" | "ready_to_pitch" | "pitched" | "accepted" | "rejected" | "paused";
export type CaseType = "fcr" | "pcr" | "movement" | "tarot" | "ziwei" | "three_session" | "twelve_session" | "training" | "other";

export type ClinicClient = {
  id: string;
  client_code: string | null;
  display_name: string | null;
  nickname: string | null;
  client_name?: string | null;
  line_id?: string | null;
  phone?: string | null;
  instagram?: string | null;
  birthday?: string | null;
  city: string | null;
  home_city: string | null;
  preferred_city: string | null;
  occupation?: string | null;
  exercise_habit?: string | null;
  old_injury_history?: string | null;
  main_issue: string | null;
  current_stage: ClinicStage;
  priority: ClientPriority;
  total_sessions: number;
  total_spent: number;
  last_session_date: string | null;
  next_followup_date: string | null;
  case_permission?: string | null;
  internal_notes?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export type ServiceRecord = {
  id: string;
  client_id: string;
  service_date: string;
  record_mode: RecordMode;
  service_code: string | null;
  service_name_snapshot: string | null;
  duration_minutes: number | null;
  price_twd: number | null;
  main_complaint: string | null;
  fatigue_state_assessment: string | null;
  main_tension_area: string | null;
  processed_area: string | null;
  strategy: string | null;
  client_reaction: string | null;
  after_change: string | null;
  next_focus: string | null;
  internal_notes: string | null;
  dominant_fascia_line: string | null;
  body_region: string | null;
  satisfaction_score: number | null;
  followup_needed: boolean;
  next_followup_date: string | null;
  case_candidate: boolean;
  plan_candidate: boolean;
  created_at: string;
  updated_at: string;
};

export type Followup = {
  id: string;
  client_id: string;
  service_record_id: string | null;
  followup_type: FollowupType | null;
  scheduled_date: string;
  sent_at: string | null;
  message_summary: string | null;
  client_response: string | null;
  response_status: FollowupStatus;
  next_action: string | null;
  is_done: boolean;
};

export type PlanCandidate = {
  id: string;
  client_id: string;
  suggested_plan_type: PlanType;
  plan_score: number;
  trigger_reason: string | null;
  suggested_pitch: string | null;
  status: PlanStatus;
  updated_at?: string | null;
};

export type CaseAsset = {
  id: string;
  case_code: string | null;
  client_id: string | null;
  service_record_id: string | null;
  case_type: CaseType | null;
  pain_keyword: string | null;
  assessment_keyword: string | null;
  before_summary: string | null;
  after_summary: string | null;
  client_quote: string | null;
  evidence_type: string | null;
  publish_permission: string | null;
  content_status: string | null;
  internal_value_score: number | null;
  ai_summary: string | null;
};
