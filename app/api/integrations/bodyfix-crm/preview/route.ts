import { NextRequest, NextResponse } from "next/server";
import { verifyCrmToolAuth, unauthorizedResponse, createConfirmationToken } from "@/lib/integrations/bodyfix-crm-auth";
import { CrmIntakePayloadSchema } from "@/lib/integrations/bodyfix-crm-schema";
import { resolveClient } from "@/lib/integrations/bodyfix-client-resolver";
import { createSupabaseAdminClient, getSupabaseAdminEnvStatus } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!verifyCrmToolAuth(request)) return unauthorizedResponse();

  const parsed = CrmIntakePayloadSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ status: "error", message: "請求格式錯誤", issues: parsed.error.issues }, { status: 400 });
  }

  const envStatus = getSupabaseAdminEnvStatus();
  const supabase = envStatus.ok ? createSupabaseAdminClient() : null;
  if (!supabase) {
    return NextResponse.json({ status: "error", message: "Supabase admin environment is not configured" }, { status: 500 });
  }

  const resolution = await resolveClient(supabase, parsed.data.client_search);
  if (resolution.status !== "resolved") return NextResponse.json(resolution);

  const normalizedPayload = {
    ...parsed.data,
    client_search: { client_id: resolution.client.client_id }
  };
  const confirmationToken = createConfirmationToken(normalizedPayload);

  return NextResponse.json({
    status: "preview",
    client: resolution.client,
    service_preview: normalizedPayload.service,
    followup_preview: normalizedPayload.followup ?? null,
    commit_request: {
      payload: normalizedPayload,
      confirmation_token: confirmationToken
    },
    message: "預覽完成；只有在 Gavin 明確確認後才能呼叫 commit。"
  });
}
