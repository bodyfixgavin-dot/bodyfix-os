import { NextResponse } from "next/server";
import { CLIENT_FIELDS, cleanPayload, readJson, requireClinicAdmin } from "@/lib/clinic-api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Params) {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const [client, serviceRecords, homeworkTasks, followups, planCandidates, caseAssets] = await Promise.all([
    auth.supabase.from("clients").select("*").eq("id", id).single(),
    auth.supabase.from("service_records").select("*").eq("client_id", id).order("service_date", { ascending: false }),
    auth.supabase.from("homework_tasks").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    auth.supabase.from("followups").select("*").eq("client_id", id).order("scheduled_date", { ascending: false }),
    auth.supabase.from("plan_candidates").select("*").eq("client_id", id).order("plan_score", { ascending: false }),
    auth.supabase.from("case_assets").select("*").eq("client_id", id).order("created_at", { ascending: false })
  ]);
  if (client.error) return NextResponse.json({ error: client.error.message }, { status: 404 });
  const error = serviceRecords.error || homeworkTasks.error || followups.error || planCandidates.error || caseAssets.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ client: client.data, service_records: serviceRecords.data ?? [], homework_tasks: homeworkTasks.data ?? [], followups: followups.data ?? [], plan_candidates: planCandidates.data ?? [], case_assets: caseAssets.data ?? [] });
}

export async function PATCH(req: Request, ctx: Params) {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const payload = cleanPayload(await readJson(req), CLIENT_FIELDS);
  payload.updated_at = new Date().toISOString();
  const { data, error } = await auth.supabase.from("clients").update(payload).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ client: data });
}
