import { NextRequest, NextResponse } from "next/server";
import { getPulseSupabaseClient, jsonError, missingSupabaseEnvResponse } from "@/lib/pulse/api";

const TABLE = "pulse_income_entries";

export async function GET(request: NextRequest) {
  const supabase = getPulseSupabaseClient();
  if (!supabase) return missingSupabaseEnvResponse();

  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  let query = supabase.from(TABLE).select("*").order("entry_date", { ascending: false }).limit(200);
  if (from) query = query.gte("entry_date", from);
  if (to) query = query.lte("entry_date", to);

  const { data, error } = await query;
  if (error) return jsonError(error);

  return NextResponse.json({ ok: true, entries: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const supabase = getPulseSupabaseClient();
  if (!supabase) return missingSupabaseEnvResponse();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = {
    entry_date: body.entry_date,
    client_id: body.client_id,
    client_name: body.client_name,
    service_code: body.service_code,
    service_type: body.service_type,
    amount: body.amount,
    amount_actual: body.amount_actual,
    source: body.source,
    note: body.note
  };

  const { data, error } = await supabase.from(TABLE).insert(payload).select("*").single();
  if (error) return jsonError(error);

  return NextResponse.json({ ok: true, entry: data });
}
