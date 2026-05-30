import { generateAndLog, withAiAdmin } from "../_helpers";
import { NextResponse } from "next/server";

// AI safety boundary: docs/ai-copilot-principles.md. Location Demand is analysis-only: no invitation drafts.
export async function POST(req: Request) {
  return withAiAdmin(async ({ supabase }) => {
    const [leads, city, zones, areas, blocks] = await Promise.all([
      supabase.from("location_demand_leads").select("lead_type, city_code, client_area_code, preferred_zone_code, service_interest, high_intent, expected_budget_twd, nurture_status, notes").eq("status", "active").limit(100),
      supabase.from("city_market_dashboard").select("*").order("high_intent_count", { ascending: false }).limit(30),
      supabase.from("taipei_zone_demand_dashboard").select("*").order("request_count", { ascending: false }).limit(30),
      supabase.from("taipei_demand_area_dashboard").select("*").order("request_count", { ascending: false }).limit(30),
      supabase.from("studio_block_dashboard").select("*").order("block_date", { ascending: true }).limit(30),
    ]);
    const error = leads.error || city.error || zones.error || areas.error || blocks.error;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return generateAndLog({
      supabase,
      moduleKey: "location_analysis",
      targetType: "location_demand",
      input: {
        location_demand_leads: leads.data ?? [],
        city_market_dashboard: city.data ?? [],
        taipei_zone_demand_dashboard: zones.data ?? [],
        taipei_demand_area_dashboard: areas.data ?? [],
        studio_block_dashboard: blocks.data ?? [],
        hard_boundary: "Analysis only. No invitation drafts, no outreach copy, no automatic contact, no deposit request.",
      },
    });
  }, req);
}
