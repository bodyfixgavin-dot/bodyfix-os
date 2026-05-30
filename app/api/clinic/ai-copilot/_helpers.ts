import { NextResponse } from "next/server";
import { requireClinicAdmin, readJson } from "@/lib/clinic-api";
import { SERVICES } from "@/src/bodyfix-foundation";
import { ALLOWED_LOG_STATUSES } from "@/src/bodyfix-ai";
import { generateAiCopilotOutput } from "@/src/bodyfix-ai/provider";
import type { AiLogStatus, AiModuleKey } from "@/src/bodyfix-ai/types";

type SupabaseAdmin = { from: (table: string) => any };

export async function withAiAdmin(handler: (auth: { supabase: SupabaseAdmin }, body: Record<string, unknown>) => Promise<NextResponse>, req?: Request) {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const body = req ? await readJson(req) : {};
  return handler({ supabase: auth.supabase as SupabaseAdmin }, body as Record<string, unknown>);
}

export function getId(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export function foundationServices() {
  return SERVICES.map((service) => ({
    serviceCode: service.serviceCode,
    nameZh: service.nameZh,
    recommendedPriceTwd: service.recommendedPriceTwd,
    durationMinutes: service.durationMinutes,
    status: service.status,
    revenueModel: service.revenueModel,
    internalPositioning: service.positioning,
    externalOneLiner: service.externalOneLiner,
  }));
}

export async function generateAndLog(params: {
  supabase: SupabaseAdmin;
  moduleKey: AiModuleKey;
  targetType?: string;
  targetId?: string | null;
  input: Record<string, unknown>;
}) {
  try {
    const result = await generateAiCopilotOutput(params.moduleKey, params.input);
    const output = { ...result.output, model_name: result.model_name, provider_name: result.provider_name, created_at: result.created_at };
    const { data: log, error } = await params.supabase
      .from("ai_copilot_logs")
      .insert({
        module_key: params.moduleKey,
        target_type: params.targetType,
        target_id: params.targetId || null,
        input_snapshot: params.input,
        output_payload: output,
        model_name: result.model_name,
        provider_name: result.provider_name,
        status: "generated",
        created_by: "gavin-admin",
      })
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ output, log });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI generation failed";
    await params.supabase.from("ai_copilot_logs").insert({
      module_key: params.moduleKey,
      target_type: params.targetType,
      target_id: params.targetId || null,
      input_snapshot: params.input,
      output_payload: { draft_notice: "AI 產生失敗，未建立可使用草稿。" },
      status: "error",
      error_message: message,
      provider_name: process.env.AI_PROVIDER || "mock",
      model_name: process.env.AI_MODEL_NAME || "mock-bodyfix-safe",
      created_by: "gavin-admin",
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export function validateLogStatus(status: unknown): status is AiLogStatus {
  return typeof status === "string" && ALLOWED_LOG_STATUSES.includes(status as AiLogStatus);
}
