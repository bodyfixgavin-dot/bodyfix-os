import { NextResponse } from "next/server";
import { CITY_SESSION_FIELDS, cleanPayload, readJson, requireClinicAdmin } from "@/lib/clinic-api";
export async function GET() {
  const auth = await requireClinicAdmin("/api/clinic/city-sessions");
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase.from("city_sessions").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ city_sessions: data ?? [] });
}
export async function POST(req: Request) {
  const auth = await requireClinicAdmin("/api/clinic/city-sessions");
  if (!auth.ok) return auth.response;
  const payload = cleanPayload(await readJson(req), CITY_SESSION_FIELDS) as Record<string, unknown>;
  payload.session_status ||= "draft";
  payload.updated_at = new Date().toISOString();
  const { data, error } = await auth.supabase.from("city_sessions").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ city_session: data }, { status: 201 });
}
