import { NextResponse } from "next/server";
import { clinicDataError, requireClinicAdmin } from "@/lib/clinic-api";

const requestPath = "/api/clinic/dashboard";
const failedRequest = "Supabase clinic dashboard views select";

export async function GET() {
  const auth = await requireClinicAdmin(requestPath);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  try {
    const [todayFollowups, recentClients, planCandidates, caseCandidates] = await Promise.all([
      supabase.from("today_followups").select("*").limit(20),
      supabase.from("client_progress_summary").select("*").order("last_session_date", { ascending: false, nullsFirst: false }).limit(12),
      supabase.from("plan_candidate_summary").select("*").limit(12),
      supabase.from("case_asset_candidates").select("*").limit(12)
    ]);
    const result = [todayFollowups, recentClients, planCandidates, caseCandidates].find((query) => query.error);
    if (result?.error) return clinicDataError(requestPath, result.error, failedRequest);

    return NextResponse.json({
      today_followups: todayFollowups.data ?? [],
      recent_clients: recentClients.data ?? [],
      plan_candidates: planCandidates.data ?? [],
      case_candidates: caseCandidates.data ?? []
    });
  } catch (error) {
    return clinicDataError(requestPath, error, failedRequest);
  }
}
