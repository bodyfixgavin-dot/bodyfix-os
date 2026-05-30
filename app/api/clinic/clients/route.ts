import { NextResponse } from "next/server";
import { CLIENT_FIELDS, cleanPayload, makeClientCode, readJson, requireClinicAdmin } from "@/lib/clinic-api";

export async function GET(req: Request) {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  let query = auth.supabase.from("client_progress_summary").select("*");
  if (searchParams.get("stage")) query = query.eq("current_stage", searchParams.get("stage"));
  if (searchParams.get("priority")) query = query.eq("priority", searchParams.get("priority"));
  if (q) query = auth.supabase.from("clients").select("id, client_code, display_name, nickname, city, home_city, current_stage, main_issue, priority, last_session_date, next_followup_date, line_id, instagram, phone").or(`display_name.ilike.%${q}%,nickname.ilike.%${q}%,line_id.ilike.%${q}%,instagram.ilike.%${q}%,phone.ilike.%${q}%,client_code.ilike.%${q}%`);
  if (searchParams.get("city")) query = query.or(`city.eq.${searchParams.get("city")},home_city.eq.${searchParams.get("city")}`);
  const { data, error } = await query.order("updated_at", { ascending: false, nullsFirst: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clients: data ?? [] });
}

export async function POST(req: Request) {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const body = await readJson(req);
  const payload = cleanPayload(body, CLIENT_FIELDS) as Record<string, unknown>;
  payload.client_code ||= makeClientCode();
  payload.display_name ||= payload.client_name || payload.nickname || "未命名客戶";
  payload.client_name ||= payload.display_name;
  payload.line_id ||= `clinic-${payload.client_code}`;
  payload.updated_at = new Date().toISOString();
  const { data, error } = await auth.supabase.from("clients").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ client: data }, { status: 201 });
}
