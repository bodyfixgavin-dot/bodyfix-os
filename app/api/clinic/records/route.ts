import { NextResponse } from "next/server";
import { RECORD_FIELDS, cleanPayload, readJson, requireClinicAdmin } from "@/lib/clinic-api";

export async function GET() {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase.from("service_records").select("*").order("service_date", { ascending: false }).limit(80);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ service_records: data ?? [] });
}

export async function POST(req: Request) {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const payload = cleanPayload(await readJson(req), RECORD_FIELDS);
  if (!payload.client_id) return NextResponse.json({ error: "client_id is required" }, { status: 400 });
  const { data, error } = await auth.supabase.from("service_records").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await auth.supabase.from("clients").update({ last_session_date: data.service_date, next_followup_date: data.next_followup_date, updated_at: new Date().toISOString() }).eq("id", data.client_id);
  return NextResponse.json({ service_record: data }, { status: 201 });
}
