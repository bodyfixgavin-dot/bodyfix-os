import { generateAndLog, withAiAdmin } from "../_helpers";
import { NextResponse } from "next/server";

// AI safety boundary: docs/ai-copilot-principles.md. This route suggests follow-up priorities only.
export async function POST(req: Request) {
  return withAiAdmin(async ({ supabase }) => {
    const today = new Date().toISOString().slice(0, 10);
    const [followups, clients, plans] = await Promise.all([
      supabase.from("followups").select("id, client_id, scheduled_date, response_status, is_done, followup_type, message_summary, client_response, next_action").eq("is_done", false).lte("scheduled_date", today).order("scheduled_date", { ascending: true }).limit(50),
      supabase.from("clients").select("id, display_name, current_stage, priority, last_session_date, next_followup_date").not("next_followup_date", "is", null).order("next_followup_date", { ascending: true }).limit(50),
      supabase.from("plan_candidates").select("id, client_id, suggested_plan_type, status, plan_score, offer_price_twd, next_followup_at, updated_at").in("status", ["ready_to_pitch", "pitched", "suggested", "sent", "discussing", "nurture"]).order("plan_score", { ascending: false }).limit(50),
    ]);
    const error = followups.error || clients.error || plans.error;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return generateAndLog({
      supabase,
      moduleKey: "today_followup",
      targetType: "today",
      input: { today, followups: followups.data ?? [], clients: clients.data ?? [], plan_candidates: plans.data ?? [] },
    });
  }, req);
}
