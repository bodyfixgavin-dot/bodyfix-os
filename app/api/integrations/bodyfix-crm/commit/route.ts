import { NextRequest, NextResponse } from "next/server";
import { verifyCrmToolAuth, unauthorizedResponse, verifyConfirmationToken } from "@/lib/integrations/bodyfix-crm-auth";
import { CommitRequestSchema } from "@/lib/integrations/bodyfix-crm-schema";
import { resolveClient } from "@/lib/integrations/bodyfix-client-resolver";
import { createSupabaseAdminClient, getSupabaseAdminEnvStatus } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!verifyCrmToolAuth(request)) return unauthorizedResponse();

  const parsed = CommitRequestSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ status: "error", message: "請求格式錯誤", issues: parsed.error.issues }, { status: 400 });
  }

  const { payload, confirmation_token: confirmationToken } = parsed.data;
  if (!verifyConfirmationToken(payload, confirmationToken)) {
    return NextResponse.json({ status: "error", message: "預覽確認碼不相符，請重新 preview" }, { status: 409 });
  }

  const envStatus = getSupabaseAdminEnvStatus();
  const supabase = envStatus.ok ? createSupabaseAdminClient() : null;
  if (!supabase) {
    return NextResponse.json({ status: "error", message: "Supabase admin environment is not configured" }, { status: 500 });
  }

  const resolution = await resolveClient(supabase, payload.client_search);
  if (resolution.status !== "resolved") return NextResponse.json(resolution);

  const { data, error } = await supabase.rpc("bodyfix_crm_intake", {
    p_payload: {
      client_id: resolution.client.client_id,
      idempotency_key: payload.idempotency_key,
      source: "chatgpt_bodyfix_tool",
      service: payload.service,
      followup: payload.followup ?? null
    }
  });

  if (error) {
    console.error("[bodyfix-crm commit] RPC error", { code: error.code, message: error.message });
    return NextResponse.json({ status: "error", message: `寫入失敗：${error.message}` }, { status: 500 });
  }

  return NextResponse.json(data);
}
