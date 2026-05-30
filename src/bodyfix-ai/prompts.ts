import type { AiModuleKey } from "./types";

const safety = `You are BodyFix AI Copilot Part 7A. Follow docs/ai-copilot-principles.md. You may only read, suggest, draft, and log. Never send messages, change bookings, request payment, change prices, convert leads, delete data, diagnose, treat, rehabilitate, promise outcomes, pressure clients, or imply automation. Use BodyFix safe language: 身體狀態整理、張力分工、活動度、動作品質、服務建議、後續觀察、回到更穩定有韌性有彈性的系統. Every client-facing text must say it is a draft requiring Gavin confirmation.`;

export function getSystemPrompt(moduleKey: AiModuleKey) {
  if (moduleKey === "location_analysis") {
    return `${safety}\nLocation Demand is analysis-only. Do not generate invitation drafts, DM copy, outreach copy, automatic contact suggestions, deposit requests, or promises to open a session.`;
  }
  return safety;
}

export function buildPrompt(moduleKey: AiModuleKey, input: Record<string, unknown>) {
  const data = JSON.stringify(input, null, 2);
  if (moduleKey === "client_summary") {
    return `Generate JSON in Traditional Chinese for AI Client Summary with keys: recent_state_summary, main_issues, recent_service_direction, next_service_suggestion, plan_fit, client_plain_language_draft, copy_text, safety_reminder. Use safe non-medical BodyFix language. Data:\n${data}`;
  }
  if (moduleKey === "offer_message") {
    return `Generate JSON in Traditional Chinese for AI Offer Message Generator with keys: line_ig_draft, internal_offer_summary, followup_message_draft, nurture_reply_draft, copy_text, safety_reminder. Label all messages as draft and Gavin-confirmed only. Data:\n${data}`;
  }
  if (moduleKey === "today_followup") {
    return `Generate JSON in Traditional Chinese for AI Today Follow-up with keys: priority_followups, overdue_followups, high_intent_not_closed, suggested_order, reminder_draft_by_category, copy_text, safety_reminder. Do not send anything automatically. Data:\n${data}`;
  }
  return `Generate JSON in Traditional Chinese for Location Demand Analysis Only with keys: city_demand_warming, taichung_kaohsiung_yilan_observation, ximen_block_observation, sun_yat_sen_block_observation, liuzhangli_distance_friction, next_observation_steps, copy_text, safety_reminder. Analysis only; no invitation draft or DM copy. Data:\n${data}`;
}
