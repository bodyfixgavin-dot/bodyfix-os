import { NextResponse } from "next/server";
import { PLAN_FIELDS, cleanPayload, readJson, requireClinicAdmin } from "@/lib/clinic-api";
export async function GET() {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase.from("plan_candidate_summary").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plan_candidates: data ?? [] });
}
export async function POST(req: Request) {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const payload = cleanPayload(await readJson(req), PLAN_FIELDS);
  const { data, error } = await auth.supabase.from("plan_candidates").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ plan_candidate: data }, { status: 201 });
}
