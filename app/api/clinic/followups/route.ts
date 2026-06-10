import { NextResponse } from "next/server";
import { requireClinicAdmin } from "@/lib/clinic-api";
import { buildFollowupDashboard } from "@/lib/followup-dashboard";

export async function GET() {
  const auth = await requireClinicAdmin("/api/clinic/followups");
  if (!auth.ok) return auth.response;

  const { supabase } = auth;
  const [clients, records, tasks, candidates] = await Promise.all([
    supabase.from("clients").select("*").limit(2000),
    supabase.from("service_records").select("*").limit(5000),
    supabase.from("followup_tasks").select("*").limit(2000),
    supabase.from("package_candidates").select("*").limit(2000)
  ]);
  const result = [clients, records, tasks, candidates].find((query) => query.error);
  if (result?.error) {
    return NextResponse.json({
      error: result.error.message,
      requestPath: "/api/clinic/followups",
      failedRequest: "Supabase existing follow-up tables select"
    }, { status: 500 });
  }

  return NextResponse.json(buildFollowupDashboard(
    clients.data ?? [],
    records.data ?? [],
    tasks.data ?? [],
    candidates.data ?? []
  ));
}
