export type AiModuleKey = "client_summary" | "offer_message" | "today_followup" | "location_analysis";

export type AiLogStatus = "generated" | "copied" | "edited" | "accepted" | "rejected" | "error";

export type AiPermissionLevel = "read" | "suggest" | "draft";

export type AiProviderResult = {
  provider_name: string;
  model_name: string;
  created_at: string;
  output: Record<string, unknown>;
};

export type AiPromptRequest = {
  module_key: AiModuleKey;
  system: string;
  prompt: string;
  input: Record<string, unknown>;
};

export type AiCopilotLog = {
  id: string;
  module_key: AiModuleKey;
  target_type?: string | null;
  target_id?: string | null;
  input_snapshot?: Record<string, unknown> | null;
  output_payload?: Record<string, unknown> | null;
  model_name?: string | null;
  provider_name?: string | null;
  status: AiLogStatus;
  user_feedback?: string | null;
  error_message?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};
