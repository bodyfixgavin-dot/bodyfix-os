import { NextResponse } from "next/server";
import { clinicDataError, requireClinicAdmin } from "@/lib/clinic-api";
import { buildFollowupDashboard } from "@/lib/followup-dashboard";

const requestPath = "/api/clinic/followups";
const failedRequest = "Supabase existing follow-up tables select";

export async function GET() {
  const auth = await requireClinicAdmin(requestPath);
  if (!auth.ok) return auth.response;

  const { supabase } = auth;

  try {
    const [clients, records, tasks, candidates] = await Promise.all([
      supabase.from("clients").select("*").limit(2000),
      supabase.from("service_records").select("*").limit(5000),
      supabase.from("followup_tasks").select("*").limit(2000),
      supabase.from("package_candidates").select("*").limit(2000)
    ]);
    const result = [clients, records, tasks, candidates].find((query) => query.error);
    if (result?.error) return clinicDataError(requestPath, result.error, failedRequest);

    return NextResponse.json(buildFollowupDashboard(
      clients.data ?? [],
      records.data ?? [],
      tasks.data ?? [],
      candidates.data ?? []
    ));
  } catch (error) {
    return clinicDataError(requestPath, error, failedRequest);
  }
}
