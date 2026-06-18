import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

async function readJson(req: Request) {
  try { return await req.json(); } catch { return {}; }
}

export async function POST(req: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin env is not configured" }, { status: 500 });
  const body = await readJson(req) as Record<string, unknown>;
  const amountActual = Number(body.amount_actual);
  if (!body.service_code) return NextResponse.json({ error: "service_code is required" }, { status: 400 });
  if (!Number.isFinite(amountActual) || amountActual < 0) return NextResponse.json({ error: "amount_actual must be a valid amount" }, { status: 400 });

  let client = null as null | { id: string; display_name: string; client_code?: string | null };
  let clientId = typeof body.client_id === "string" && body.client_id ? body.client_id : null;
  const requestedName = String(body.client_name || body.new_client_name || "").trim();

  if (!clientId && requestedName) {
    const { data, error } = await supabase.from("clients").insert({ display_name: requestedName, client_name: requestedName, line_id: `pulse-${crypto.randomUUID()}`, updated_at: new Date().toISOString() }).select("id, client_code, display_name").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    client = data;
    clientId = data.id;
  } else if (clientId) {
    const { data, error } = await supabase.from("clients").select("id, client_code, display_name").eq("id", clientId).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    client = data;
  }

  const clientNameSnapshot = client?.display_name ?? requestedName;
  const payload = {
    entry_date: String(body.entry_date || new Date().toISOString().slice(0, 10)),
    client_id: clientId,
    client_name: clientNameSnapshot,
    client_name_snapshot: clientNameSnapshot,
    service_type: body.service_name ? String(body.service_name) : String(body.service_code),
    service_code: String(body.service_code),
    service_line: String(body.service_line || ""),
    service_name: String(body.service_name || ""),
    service_variant: String(body.service_variant || ""),
    standard_price: Number(body.standard_price || amountActual),
    amount: amountActual,
    amount_actual: amountActual,
    source: String(body.source || "LINE"),
    note: String(body.note || "")
  };

  const { data, error } = await supabase.from("pulse_income_entries").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ income: data, client }, { status: 201 });
}
