import { corsJson, handleOptions } from "@/lib/cors";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return corsJson(req, { service_options: [] });
  const { data, error } = await supabase
    .from("location_service_options")
    .select("service_code, display_name_zh, display_name_en, duration_minutes, price_twd, is_addon, status, sort_order, notes")
    .eq("is_location_demand_allowed", true)
    .order("sort_order", { ascending: true });
  if (error) return corsJson(req, { error: error.message }, { status: 500 });
  return corsJson(req, { service_options: data ?? [] });
}

export async function OPTIONS(req: Request) {
  return handleOptions(req, "GET,OPTIONS");
}
