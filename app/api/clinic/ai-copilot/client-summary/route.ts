import { NextResponse } from "next/server";
import { generateAndLog, getId, withAiAdmin } from "../_helpers";

// AI safety boundary: docs/ai-copilot-principles.md. This route reads data and logs a draft only.
export async function POST(req: Request) {
  return withAiAdmin(async ({ supabase }, body) => {
    const clientId = getId(body, "client_id");
    if (!clientId) return NextResponse.json({ error: "client_id is required" }, { status: 400 });

    const [client, records, plans, followups] = await Promise.all([
      supabase.from("clients").select("id, display_name, nickname, main_issue, first_pain_point, current_stage, priority, total_sessions, total_spent, last_session_date, next_followup_date, internal_notes").eq("id", clientId).single(),
      supabase.from("service_records").select("service_date, service_name_snapshot, service_code, record_mode, main_complaint, fatigue_state_assessment, body_region, processed_area, strategy, client_reaction, after_change, next_focus, internal_notes").eq("client_id", clientId).order("service_date", { ascending: false }).limit(3),
      supabase.from("plan_candidates").select("client_id, suggested_plan_type, status, trigger_reason, plan_score, offer_type, offer_price_twd, next_followup_at, internal_note, updated_at").eq("client_id", clientId).order("updated_at", { ascending: false }).limit(10),
      supabase.from("followups").select("client_id, followup_type, response_status, scheduled_date, message_summary, client_response, next_action, is_done").eq("client_id", clientId).order("scheduled_date", { ascending: false }).limit(10),
    ]);

    const error = client.error || records.error || plans.error || followups.error;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return generateAndLog({
      supabase,
      moduleKey: "client_summary",
      targetType: "client",
      targetId: clientId,
      input: { client: client.data, service_records: records.data ?? [], plan_candidates: plans.data ?? [], followups: followups.data ?? [] },
    });
  }, req);
}
