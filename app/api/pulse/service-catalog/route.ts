import { NextRequest, NextResponse } from "next/server";
import { getPulseSupabaseClient, getSupabaseUrlHost, isDebug, jsonError, missingSupabaseEnvResponse } from "@/lib/pulse/api";

const TABLE = "service_catalog";
const FILTERS = { status: ["active", "trial"] };

export async function GET(request: NextRequest) {
  const debug = isDebug(request);
  const supabaseUrlHost = getSupabaseUrlHost();
  const supabase = getPulseSupabaseClient();
  if (!supabase) return missingSupabaseEnvResponse();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .in("status", FILTERS.status)
    .order("service_code", { ascending: true });

  if (error) {
    return jsonError(error, 500, debug ? { supabaseUrlHost, table: TABLE, queryFilters: FILTERS, rowCount: 0, rawRows: [], supabaseErrorMessage: error.message } : {});
  }

  const services = data ?? [];
  return NextResponse.json({
    ok: true,
    services,
    service_catalog: services,
    ...(debug ? { supabaseUrlHost, table: TABLE, queryFilters: FILTERS, rowCount: services.length, rawRows: services.slice(0, 5), supabaseErrorMessage: null } : {})
  }, { headers: { "Cache-Control": "no-store" } });
}
