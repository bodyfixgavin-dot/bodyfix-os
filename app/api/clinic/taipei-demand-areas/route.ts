import { NextResponse } from "next/server";
import { requireClinicAdmin } from "@/lib/clinic-api";
export async function GET() {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase.from("taipei_demand_area_dashboard").select("*").order("request_count", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ taipei_demand_areas: data ?? [] });
}
