import { NextResponse } from "next/server";
import { foundationServices, generateAndLog, getId, withAiAdmin } from "../_helpers";

// AI safety boundary: docs/ai-copilot-principles.md. This route creates review-only proposal drafts.
export async function POST(req: Request) {
  return withAiAdmin(async ({ supabase }, body) => {
    const clientId = getId(body, "client_id");
    const candidateId = getId(body, "plan_candidate_id");
    if (!clientId && !candidateId) return NextResponse.json({ error: "client_id or plan_candidate_id is required" }, { status: 400 });

    const candidateQuery = supabase
      .from("plan_candidates")
      .select("id, client_id, suggested_plan_type, status, trigger_reason, plan_score, offer_type, offer_title, offer_price_twd, internal_rationale, client_summary, recommended_frequency, recommended_next_step, proposal_message, internal_note, next_followup_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5);
    const candidateResult = candidateId ? await candidateQuery.eq("id", candidateId) : await candidateQuery.eq("client_id", clientId);
    if (candidateResult.error) return NextResponse.json({ error: candidateResult.error.message }, { status: 500 });

    const resolvedClientId = clientId || String(candidateResult.data?.[0]?.client_id ?? "");
    if (!resolvedClientId) return NextResponse.json({ error: "Unable to resolve client for offer draft" }, { status: 400 });
    const client = await supabase.from("clients").select("id, display_name, nickname, main_issue, current_stage").eq("id", resolvedClientId).single();
    if (client.error) return NextResponse.json({ error: client.error.message }, { status: 500 });

    return generateAndLog({
      supabase,
      moduleKey: "offer_message",
      targetType: candidateId ? "plan_candidate" : "client",
      targetId: candidateId || resolvedClientId,
      input: { client: client.data, plan_candidates: candidateResult.data ?? [], services: foundationServices() },
    });
  }, req);
}
