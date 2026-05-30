import type { AiLogStatus, AiModuleKey, AiPermissionLevel } from "./types";

// Safety source of truth: docs/ai-copilot-principles.md.
export const AI_COPILOT_PRINCIPLES_DOC = "docs/ai-copilot-principles.md";

export const AI_PERMISSION_LEVELS: Record<AiPermissionLevel, string[]> = {
  read: [
    "clients",
    "service_records",
    "followups",
    "plan_candidates",
    "location_demand_leads",
    "city_market_dashboard",
    "taipei_zone_demand_dashboard",
    "taipei_demand_area_dashboard",
    "studio_block_dashboard",
    "Part 4 services / business rules",
  ],
  suggest: ["client summaries", "next service direction", "plan fit", "today follow-up priority", "location demand analysis"],
  draft: ["offer message drafts", "follow-up message drafts", "internal summary drafts"],
};

export const FORBIDDEN_AI_CAPABILITIES = ["write", "send", "commit"] as const;

export const ALLOWED_LOG_STATUSES: AiLogStatus[] = ["generated", "copied", "edited", "accepted", "rejected", "error"];

const forbiddenPatterns = [
  /診斷/g,
  /治療/g,
  /復健/g,
  /保證改善/g,
  /一定會好/g,
  /療效/g,
  /名額.*保證/g,
  /立即付款/g,
  /馬上付訂/g,
  /訂金.*才能/g,
  /不處理.*會更嚴重/g,
];

const replacements: Array<[RegExp, string]> = [
  [/診斷/g, "身體狀態整理"],
  [/治療/g, "整理"],
  [/復健/g, "動作回接"],
  [/保證改善/g, "後續觀察變化"],
  [/一定會好/g, "需要再觀察身體反應"],
  [/療效/g, "身體反應"],
  [/立即付款/g, "由 Gavin 確認後續安排"],
  [/馬上付訂/g, "由 Gavin 確認是否需要保留安排"],
];

export function sanitizeAiText(input: unknown): unknown {
  if (typeof input === "string") {
    return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), input);
  }
  if (Array.isArray(input)) return input.map((item) => sanitizeAiText(item));
  if (input && typeof input === "object") {
    return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, sanitizeAiText(value)]));
  }
  return input;
}

export function findSafetyWarnings(input: unknown): string[] {
  const text = typeof input === "string" ? input : JSON.stringify(input ?? "");
  return forbiddenPatterns.filter((pattern) => pattern.test(text)).map((pattern) => `Removed or softened unsafe wording matching ${pattern.toString()}`);
}

export function withDraftNotice<T extends Record<string, unknown>>(moduleKey: AiModuleKey, output: T): T & { draft_notice: string; safety_principles_doc: string; location_analysis_only?: boolean } {
  return {
    ...output,
    draft_notice: "這是 AI 草稿，需 Gavin 確認；不可視為正式訊息或正式動作。",
    safety_principles_doc: AI_COPILOT_PRINCIPLES_DOC,
    ...(moduleKey === "location_analysis" ? { location_analysis_only: true } : {}),
  };
}
