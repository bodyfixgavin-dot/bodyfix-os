import { NextResponse } from "next/server";
import { FOLLOWUP_FIELDS, cleanPayload, readJson, requireClinicAdmin } from "@/lib/clinic-api";
export async function GET() {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase.from("today_followups").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ followups: data ?? [] });
}
export async function POST(req: Request) {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const payload = cleanPayload(await readJson(req), FOLLOWUP_FIELDS);
  const { data, error } = await auth.supabase.from("followups").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ followup: data }, { status: 201 });
}
