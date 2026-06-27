import { NextResponse } from "next/server";
import { readJson, requireClinicAdmin } from "@/lib/clinic-api";

type Body = { action?: string; clientId?: string; resolutionReason?: string };
const ACTIONS = new Set(["link_existing", "create_new", "keep_separate", "add_alias"]);
function reason(action: string, custom?: string) { return custom?.trim() || `manual_${action}`; }
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireClinicAdmin("/api/clinic/intake-submissions/[id]/resolve");
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const body = await readJson(req) as Body;
  const action = typeof body.action === "string" ? body.action : "";
  if (!ACTIONS.has(action)) return NextResponse.json({ error: "Unsupported manual action." }, { status: 400 });
  const needsClient = action === "link_existing" || action === "add_alias";
  if (needsClient && !body.clientId) return NextResponse.json({ error: "clientId is required." }, { status: 400 });
  const createsClient = action === "create_new" || action === "keep_separate";
  const { data, error } = await auth.supabase.rpc("process_intake_crm_resolution", {
    p_submission_id: id,
    p_resolution_status: "resolved_manually",
    p_resolution_reason: reason(action, body.resolutionReason),
    p_candidate_client_ids: [],
    p_client_id: needsClient ? body.clientId : null,
    p_create_client: createsClient,
    p_resolved_by: "clinic_admin",
    p_manual: true,
    p_action: action,
  });
  if (error) {
    console.error("manual intake resolution failed", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, result: data });
}
