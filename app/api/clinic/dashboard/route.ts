import { NextResponse } from "next/server";
import { requireClinicAdmin } from "@/lib/clinic-api";

export async function GET() {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
  const [todayFollowups, recentClients, planCandidates, caseCandidates] = await Promise.all([
    supabase.from("today_followups").select("*").limit(20),
    supabase.from("client_progress_summary").select("*").order("last_session_date", { ascending: false, nullsFirst: false }).limit(12),
    supabase.from("plan_candidate_summary").select("*").limit(12),
    supabase.from("case_asset_candidates").select("*").limit(12)
  ]);
  const error = todayFollowups.error || recentClients.error || planCandidates.error || caseCandidates.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    today_followups: todayFollowups.data ?? [],
    recent_clients: recentClients.data ?? [],
    plan_candidates: planCandidates.data ?? [],
    case_candidates: caseCandidates.data ?? []
  });
}
