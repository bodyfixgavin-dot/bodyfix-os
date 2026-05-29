export type BodyFixIntent =
  | "booking"
  | "pricing"
  | "service_difference"
  | "body_issue"
  | "location"
  | "oil_massage"
  | "sexual_service"
  | "followup"
  | "unclear";

export type LeadTemperature = "A" | "B" | "C" | "D";

export type BookingStage =
  | "new"
  | "assessing"
  | "ready_to_book"
  | "waiting_time"
  | "booked"
  | "followup_needed"
  | "not_fit"
  | "human_takeover";

export type PreferredService =
  | "standard_fascia_60"
  | "pelvic_core_60"
  | "fascia_extension_30"
  | "pelvic_extension_30"
  | "mixed_extension"
  | "unknown";

export type NextAction =
  | "ask_body_issue"
  | "ask_time"
  | "ask_location"
  | "explain_difference"
  | "send_price"
  | "human_takeover"
  | "followup_3_days"
  | "followup_7_days";

export type BodyFixClassification = {
  intent: BodyFixIntent;
  leadTemperature: LeadTemperature;
  bookingStage: BookingStage;
  preferredService: PreferredService;
  needHuman: boolean;
  bodyIssue: string;
  bodyArea?: string;
  preferredLocation?: string;
  preferredTime?: string;
  nextAction: NextAction;
  notes?: string;
};

export type BodyFixAiResult = {
  replyText: string;
  classification: BodyFixClassification;
};

export type CrmRecord = {
  userId: string;
  displayName: string;
  firstSeenAt: string;
  lastUserMessageAt: string;
  lastBotMessageAt: string;
  lastUserMessage: string;
  lastBotReply: string;
  lastIntent: string;
  bodyIssue: string;
  bodyArea: string;
  preferredService: string;
  bookingStage: string;
  leadTemperature: string;
  nextAction: string;
  needHuman: string;
  preferredLocation: string;
  preferredTime: string;
  followupCount: string;
  lastFollowupAt: string;
  notes: string;
};

export type LineEvent = {
  type: string;
  replyToken?: string;
  source?: { userId?: string; type?: string };
  message?: { type: string; text?: string };
  timestamp?: number;
};
