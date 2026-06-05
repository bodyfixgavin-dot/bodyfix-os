import { NextResponse } from "next/server";
import { LOCATION_LEAD_FIELDS, cleanPayload, readJson, requireClinicAdmin } from "@/lib/clinic-api";

export async function GET(req: Request) {
  const auth = await requireClinicAdmin("/api/clinic/location-leads");
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  let query = auth.supabase.from("location_demand_leads").select("*");
  ["lead_type", "city_code", "client_area_code", "preferred_zone_code", "service_interest", "nurture_status"].forEach((key) => {
    const value = searchParams.get(key);
    if (value) query = query.eq(key, value);
  });
  if (searchParams.get("high_intent")) query = query.eq("high_intent", searchParams.get("high_intent") === "true");
  if (searchParams.get("grooming_interest")) query = query.eq("grooming_interest", searchParams.get("grooming_interest") === "true");
  const { data, error } = await query.order("created_at", { ascending: false }).limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data ?? [] });
}

export async function POST(req: Request) {
  const auth = await requireClinicAdmin("/api/clinic/location-leads");
  if (!auth.ok) return auth.response;
  const payload = cleanPayload(await readJson(req), LOCATION_LEAD_FIELDS) as Record<string, unknown>;
  payload.source ||= "clinic_admin";
  payload.updated_at = new Date().toISOString();
  const { data, error } = await auth.supabase.from("location_demand_leads").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ lead: data }, { status: 201 });
}
