import { NextResponse } from "next/server";
import { requireClinicAdmin, withoutIdentity } from "@/lib/clinic-api";
type Params = { params: Promise<{ id: string }> };
export async function GET(_req: Request, ctx: Params) {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const [client, records, plans] = await Promise.all([
    auth.supabase.from("clients").select("*").eq("id", id).single(),
    auth.supabase.from("service_records").select("service_date, service_code, service_name_snapshot, duration_minutes, main_complaint, fatigue_state_assessment, processed_area, strategy, client_reaction, after_change, next_focus, main_tension_area, body_region").eq("client_id", id).order("service_date", { ascending: false }).limit(6),
    auth.supabase.from("plan_candidates").select("suggested_plan_type, trigger_reason, suggested_pitch, status").eq("client_id", id).order("plan_score", { ascending: false }).limit(3)
  ]);
  if (client.error) return NextResponse.json({ error: client.error.message }, { status: 404 });
  if (records.error || plans.error) return NextResponse.json({ error: (records.error || plans.error)?.message }, { status: 500 });
  return NextResponse.json({ summary: withoutIdentity(client.data), records: records.data ?? [], plan_candidates: plans.data ?? [] });
}
