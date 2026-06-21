import { NextRequest, NextResponse } from "next/server";
import { getPulseSupabaseClient, getSupabaseUrlHost, isDebug, jsonError, missingSupabaseEnvResponse } from "@/lib/pulse/api";

const CLIENTS_TABLE = "clients";
const ALIASES_TABLE = "client_aliases";
const FILTERS = { client_status: ["active", "member", "vip"], is_selectable: true, display_name: "not null" };

type Row = Record<string, unknown>;

export async function GET(request: NextRequest) {
  const debug = isDebug(request);
  const supabaseUrlHost = getSupabaseUrlHost();
  const supabase = getPulseSupabaseClient();
  if (!supabase) return missingSupabaseEnvResponse();

  const baseQuery = supabase
    .from(CLIENTS_TABLE)
    .select("*")
    .in("client_status", FILTERS.client_status)
    .eq("is_selectable", FILTERS.is_selectable)
    .not("display_name", "is", null)
    .order("display_name", { ascending: true });

  const [clientsResult, aliasesResult, totalResult, selectableResult] = await Promise.all([
    baseQuery,
    supabase.from(ALIASES_TABLE).select("*"),
    debug ? supabase.from(CLIENTS_TABLE).select("id", { count: "exact", head: true }) : Promise.resolve({ count: null, error: null }),
    debug ? supabase.from(CLIENTS_TABLE).select("id", { count: "exact", head: true }).eq("is_selectable", true) : Promise.resolve({ count: null, error: null })
  ]);

  if (clientsResult.error) {
    return jsonError(clientsResult.error, 500, debug ? { supabaseUrlHost, table: CLIENTS_TABLE, queryFilters: FILTERS, rowCount: 0, rawRows: [], supabaseErrorMessage: clientsResult.error.message, totalClientsCount: totalResult.count, selectableClientsCount: selectableResult.count, filtersUsed: FILTERS } : {});
  }
  if (aliasesResult.error) {
    return jsonError(aliasesResult.error, 500, debug ? { supabaseUrlHost, table: ALIASES_TABLE, queryFilters: {}, rowCount: 0, rawRows: [], supabaseErrorMessage: aliasesResult.error.message, totalClientsCount: totalResult.count, selectableClientsCount: selectableResult.count, filtersUsed: FILTERS } : {});
  }

  const aliasesByClientId = new Map<string, Row[]>();
  for (const alias of (aliasesResult.data ?? []) as Row[]) {
    const clientId = String(alias.client_id ?? "");
    if (!clientId) continue;
    aliasesByClientId.set(clientId, [...(aliasesByClientId.get(clientId) ?? []), alias]);
  }

  const clients = ((clientsResult.data ?? []) as Row[]).map((client) => ({
    ...client,
    aliases: aliasesByClientId.get(String(client.id ?? client.client_id ?? "")) ?? []
  }));

  return NextResponse.json({
    ok: true,
    clients,
    ...(debug ? { supabaseUrlHost, table: CLIENTS_TABLE, queryFilters: FILTERS, rowCount: clients.length, rawRows: clients.slice(0, 5), supabaseErrorMessage: null, totalClientsCount: totalResult.count, selectableClientsCount: selectableResult.count, filtersUsed: FILTERS } : {})
  }, { headers: { "Cache-Control": "no-store" } });
}
