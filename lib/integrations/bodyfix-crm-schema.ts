import { z } from "zod";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必須是 YYYY-MM-DD");
const optionalText = z.string().trim().min(1).max(5000).optional();

export const ClientSearchSchema = z.object({
  client_id: z.string().uuid().optional(),
  line_id: z.string().trim().min(1).max(200).optional(),
  phone: z.string().trim().min(1).max(50).optional(),
  instagram: z.string().trim().min(1).max(200).optional(),
  display_name: z.string().trim().min(1).max(200).optional()
}).refine(
  (value) => Boolean(value.client_id || value.line_id || value.phone || value.instagram || value.display_name),
  { message: "必須提供 client_id、line_id、phone、instagram 或 display_name 其中一項" }
);

export const ServiceRecordInputSchema = z.object({
  service_date: dateString,
  record_mode: z.enum(["quick", "full"]).default("quick"),
  service_code: optionalText,
  service_name_snapshot: z.string().trim().min(2).max(300),
  duration_minutes: z.number().int().positive().max(720).optional(),
  price_twd: z.number().int().nonnegative().max(1000000).optional(),
  main_complaint: optionalText,
  fatigue_state_assessment: optionalText,
  main_tension_area: optionalText,
  processed_area: optionalText,
  strategy: optionalText,
  client_reaction: optionalText,
  after_change: optionalText,
  next_focus: optionalText,
  internal_notes: optionalText,
  dominant_fascia_line: optionalText,
  body_region: optionalText,
  satisfaction_score: z.number().int().min(1).max(5).optional(),
  followup_needed: z.boolean().optional(),
  next_followup_date: dateString.optional(),
  calendar_event_id: z.string().trim().min(1).max(500).optional(),
  raw_summary: z.string().trim().min(1).max(10000).optional()
});

export const FollowupInputSchema = z.object({
  scheduled_date: dateString,
  followup_type: z.enum(["day0", "day1", "day3", "day7", "day14", "day30", "wake_up", "other"]).default("other"),
  message_template: optionalText,
  message_summary: z.string().trim().min(1).max(3000),
  next_action: z.string().trim().min(1).max(3000),
  response_status: z.enum(["not_sent", "no_reply", "positive", "neutral", "negative", "booked", "rejected"]).default("not_sent")
});

export const CrmIntakePayloadSchema = z.object({
  client_search: ClientSearchSchema,
  service: ServiceRecordInputSchema,
  followup: FollowupInputSchema.optional(),
  idempotency_key: z.string().trim().min(16).max(240)
});

export const CommitRequestSchema = z.object({
  payload: CrmIntakePayloadSchema,
  confirmation_token: z.string().regex(/^[a-f0-9]{64}$/i, "confirmation_token 格式錯誤")
});

export type ClientSearch = z.infer<typeof ClientSearchSchema>;
export type CrmIntakePayload = z.infer<typeof CrmIntakePayloadSchema>;
export type CommitRequest = z.infer<typeof CommitRequestSchema>;
