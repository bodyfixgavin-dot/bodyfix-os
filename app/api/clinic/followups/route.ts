import { NextResponse } from "next/server";
import { FOLLOWUP_FIELDS, cleanPayload, readJson, requireClinicAdmin } from "@/lib/clinic-api";
import { buildFollowupDashboard } from "@/lib/followup-dashboard";

export async function GET() {
  const auth = await requireClinicAdmin("/api/clinic/followups");
  if (!auth.ok) return auth.response;

  const { supabase } = auth;
  const [clients, records, followups] = await Promise.all([
    supabase.from("clients").select("*").limit(2000),
    supabase.from("service_records").select("*").order("service_date", { ascending: false }).limit(5000),
    supabase.from("followups").select("*").order("scheduled_date", { ascending: false }).limit(2000)
  ]);
  const error = clients.error || records.error || followups.error;
  if (error) {
    const failedRequest = clients.error ? "Supabase clients select" : records.error ? "Supabase service_records select" : "Supabase followups select";
    return NextResponse.json({ error: error.message, requestPath: "/api/clinic/followups", failedRequest }, { status: 500 });
  }

  return NextResponse.json(buildFollowupDashboard(clients.data ?? [], records.data ?? [], followups.data ?? []));
}

export async function POST(req: Request) {
  const auth = await requireClinicAdmin("/api/clinic/followups");
  if (!auth.ok) return auth.response;
  const payload = cleanPayload(await readJson(req), FOLLOWUP_FIELDS);
  const { data, error } = await auth.supabase.from("followups").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ followup: data }, { status: 201 });
}
