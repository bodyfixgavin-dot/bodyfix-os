import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type ConversationMode = "bot" | "human" | "paused";
export type AutomationMode = "manual" | "draft" | "auto";

export type ConversationState = {
  lineUserId: string;
  conversationMode: ConversationMode;
  humanUntil: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type AutomationDecision = {
  allowAi: boolean;
  allowSend: boolean;
  reason: "global_manual" | "global_draft" | "human_takeover" | "paused" | "auto";
  state: ConversationState;
};

export function getAutomationMode(): AutomationMode {
  const value = process.env.LINE_AUTOMATION_MODE?.trim().toLowerCase();
  if (value === "auto" || value === "draft" || value === "manual") return value;
  return "manual";
}

export function isHumanActive(state: ConversationState, now = new Date()) {
  if (state.conversationMode !== "human") return false;
  if (!state.humanUntil) return true;
  const until = new Date(state.humanUntil);
  return !Number.isNaN(until.getTime()) && until.getTime() > now.getTime();
}

export async function getConversationState(lineUserId: string): Promise<ConversationState> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin environment is not configured");

  const { data, error } = await supabase
    .from("line_conversation_states")
    .select("line_user_id, conversation_mode, human_until, updated_at, updated_by")
    .eq("line_user_id", lineUserId)
    .maybeSingle();

  if (error) throw new Error(`Failed to read LINE conversation state: ${error.message}`);
  if (!data) {
    return {
      lineUserId,
      conversationMode: "bot",
      humanUntil: null,
      updatedAt: null,
      updatedBy: null
    };
  }

  return {
    lineUserId: data.line_user_id,
    conversationMode: data.conversation_mode as ConversationMode,
    humanUntil: data.human_until,
    updatedAt: data.updated_at,
    updatedBy: data.updated_by
  };
}

export async function getAutomationDecision(lineUserId: string, now = new Date()): Promise<AutomationDecision> {
  const state = await getConversationState(lineUserId);

  if (state.conversationMode === "paused") {
    return { allowAi: false, allowSend: false, reason: "paused", state };
  }

  if (isHumanActive(state, now)) {
    return { allowAi: false, allowSend: false, reason: "human_takeover", state };
  }

  const mode = getAutomationMode();
  if (mode === "manual") {
    return { allowAi: false, allowSend: false, reason: "global_manual", state };
  }
  if (mode === "draft") {
    return { allowAi: true, allowSend: false, reason: "global_draft", state };
  }
  return { allowAi: true, allowSend: true, reason: "auto", state };
}

export async function setConversationMode(input: {
  lineUserId: string;
  conversationMode: ConversationMode;
  humanUntil?: string | null;
  updatedBy: string;
}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin environment is not configured");

  const payload = {
    line_user_id: input.lineUserId,
    conversation_mode: input.conversationMode,
    human_until: input.conversationMode === "human" ? input.humanUntil ?? null : null,
    updated_by: input.updatedBy,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("line_conversation_states")
    .upsert(payload, { onConflict: "line_user_id" })
    .select("line_user_id, conversation_mode, human_until, updated_at, updated_by")
    .single();

  if (error) throw new Error(`Failed to update LINE conversation state: ${error.message}`);
  return {
    lineUserId: data.line_user_id,
    conversationMode: data.conversation_mode as ConversationMode,
    humanUntil: data.human_until,
    updatedAt: data.updated_at,
    updatedBy: data.updated_by
  } satisfies ConversationState;
}

export async function setHumanTakeover(lineUserId: string, durationMinutes: number | null, updatedBy: string) {
  const humanUntil = durationMinutes === null
    ? null
    : new Date(Date.now() + durationMinutes * 60_000).toISOString();
  return setConversationMode({ lineUserId, conversationMode: "human", humanUntil, updatedBy });
}

export async function resumeBot(lineUserId: string, updatedBy: string) {
  return setConversationMode({ lineUserId, conversationMode: "bot", humanUntil: null, updatedBy });
}

export async function pauseConversation(lineUserId: string, updatedBy: string) {
  return setConversationMode({ lineUserId, conversationMode: "paused", humanUntil: null, updatedBy });
}
