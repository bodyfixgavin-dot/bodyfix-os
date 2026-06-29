import { buildPrompt, getSystemPrompt } from "./prompts";
import { findSafetyWarnings, sanitizeAiText, withDraftNotice } from "./safety";
import type { AiModuleKey, AiPromptRequest, AiProviderResult } from "./types";

function createdAt() {
  return new Date().toISOString();
}

function mockOutput(moduleKey: AiModuleKey, input: Record<string, unknown>) {
  if (moduleKey === "client_summary") {
    return {
      recent_state_summary: "Mock：已整理客戶主檔、最近服務紀錄、方案候選與追蹤資料，供 Gavin 快速判讀。",
      main_issues: ["以身體狀態整理、張力分工、活動度與動作品質作為描述框架。"],
      recent_service_direction: "Mock：依最近 3 筆服務紀錄歸納主要整理方向，避免醫療判定語氣。",
      next_service_suggestion: "Mock：建議 Gavin 先確認身體反應，再決定下一次服務方向。",
      plan_fit: { three_session: "可觀察", twelve_session: "需 Gavin 判斷", deep_24_plus_12: "高信任方案，暫不自動建議成交" },
      client_plain_language_draft: "【AI 草稿，需 Gavin 確認】我先幫你把這次身體狀態整理成幾個重點，接下來會觀察張力分工、活動度與動作品質是否能回到更穩定、有韌性、有彈性的狀態。",
      copy_text: "【AI 草稿，需 Gavin 確認】這份摘要由 mock provider 產生，可用來測試複製流程。",
      safety_reminder: "AI 只整理與建議，不自動發訊息、不改資料、不承諾效果。",
      input_count_hint: Object.keys(input).length,
    };
  }
  if (moduleKey === "offer_message") {
    return {
      line_ig_draft: "【AI 草稿，需 Gavin 確認】我把這次狀態整理成下一步服務建議，重點會放在張力分工、活動度與動作品質的後續觀察；是否適合方案仍由 Gavin 跟你確認。",
      internal_offer_summary: "Mock：依客戶狀態、方案候選與服務規則產生內部提案摘要。",
      followup_message_draft: "【AI 草稿，需 Gavin 確認】想跟你確認上次整理後的身體反應，再看下一步安排是否需要調整。",
      nurture_reply_draft: "【AI 草稿，需 Gavin 確認】沒問題，可以先觀察身體反應；如果之後想再整理，我們再一起看適合的節奏。",
      copy_text: "【AI 草稿，需 Gavin 確認】提案文字由 mock provider 產生，尚未發送。",
      safety_reminder: "草稿不可直接視為正式訊息。",
    };
  }
  if (moduleKey === "today_followup") {
    return {
      priority_followups: ["Mock：今日到期追蹤名單依 priority、due date、方案意願排序。"],
      overdue_followups: ["Mock：逾期追蹤僅提醒 Gavin，不自動聯繫。"],
      high_intent_not_closed: ["Mock：高意願但未成交名單供內部檢查。"],
      suggested_order: ["先看逾期高優先級", "再看今日到期", "最後看 nurture 名單"],
      reminder_draft_by_category: { due: "【AI 草稿，需 Gavin 確認】想確認你上次整理後的身體反應。" },
      copy_text: "【AI 草稿，需 Gavin 確認】今日追蹤建議由 mock provider 產生。",
      safety_reminder: "AI 不會自動發送 follow-up。",
    };
  }
  return {
    city_demand_warming: "Mock：依城市 dashboard 分析需求升溫狀態。",
    taichung_kaohsiung_yilan_observation: "Mock：台中、高雄、宜蘭只列觀察，不承諾開場。",
    ximen_block_observation: "Mock：西門是否集中時段需繼續看高意願與成本。",
    sun_yat_sen_block_observation: "Mock：國父紀念館是否集中時段需看租金、時段與需求密度。",
    liuzhangli_distance_friction: "Mock：來源區若有六張犁距離疑慮，只做分析。",
    next_observation_steps: ["持續收集 demand leads", "比較高意願人數與 expected budget", "不要產生邀約草稿"],
    copy_text: "Location Demand Analysis Only：此區只做分析，不產生邀約文字。",
    safety_reminder: "禁止私訊草稿、邀約文字、自動聯繫、收訂金與開場承諾。",
  };
}

async function callOpenAiCompatible(request: AiPromptRequest): Promise<AiProviderResult> {
  const provider = process.env.AI_PROVIDER || "openai-compatible";
  const model = process.env.AI_MODEL_NAME || "gpt-4o-mini";
  const apiKey = process.env.AI_API_KEY;
  const endpoint = process.env.AI_API_BASE_URL || "https://api.openai.com/v1/chat/completions";

  if (process.env.AI_ENABLED !== "true" || !apiKey) {
    return {
      provider_name: "mock",
      model_name: process.env.AI_MODEL_NAME || "mock-bodyfix-safe",
      created_at: createdAt(),
      output: withDraftNotice(request.module_key, mockOutput(request.module_key, request.input)),
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: request.system },
        { role: "user", content: request.prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider error: ${response.status} ${await response.text()}`);
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);
  const sanitized = sanitizeAiText(parsed) as Record<string, unknown>;
  return {
    provider_name: provider,
    model_name: model,
    created_at: createdAt(),
    output: withDraftNotice(request.module_key, {
      ...sanitized,
      safety_warnings: findSafetyWarnings(parsed),
    }),
  };
}

export async function generateAiCopilotOutput(moduleKey: AiModuleKey, input: Record<string, unknown>) {
  const request = { module_key: moduleKey, system: getSystemPrompt(moduleKey), prompt: buildPrompt(moduleKey, input), input };
  return callOpenAiCompatible(request);
}
