import { NextResponse } from "next/server";
import { requireClinicAdmin } from "@/lib/clinic-api";

export async function GET() {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const [city, zones, areas, blocks, leads] = await Promise.all([
    auth.supabase.from("city_market_dashboard").select("*").order("registered_count", { ascending: false }),
    auth.supabase.from("taipei_zone_demand_dashboard").select("*").order("request_count", { ascending: false }),
    auth.supabase.from("taipei_demand_area_dashboard").select("*").order("request_count", { ascending: false }),
    auth.supabase.from("studio_block_dashboard").select("*").order("block_date", { ascending: true }).limit(20),
    auth.supabase.from("lead_nurturing_queue").select("*").limit(30)
  ]);
  const error = city.error || zones.error || areas.error || blocks.error || leads.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    city_market_dashboard: city.data ?? [],
    taipei_zone_demand_dashboard: zones.data ?? [],
    taipei_demand_area_dashboard: areas.data ?? [],
    studio_block_dashboard: blocks.data ?? [],
    lead_nurturing_queue: leads.data ?? []
  });
}
