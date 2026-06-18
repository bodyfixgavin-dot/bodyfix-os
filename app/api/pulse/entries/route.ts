import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const db = createSupabaseAdminClient();
  if (!db) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  const body = await request.json();
  const service = {
    client_id: body.client_id,
    client_name_snapshot: body.client_name_snapshot,
    service_code: body.service_code,
    service_line: body.service_line,
    service_name: body.service_name,
    service_variant: body.service_variant,
    standard_price: body.standard_price,
    note: body.note || null
  };
  const table = body.kind === "appointment" ? "pulse_appointments" : "pulse_income_entries";
  const payload = body.kind === "appointment"
    ? { ...service, appointment_date: body.appointment_date, start_time: body.start_time || null, estimated_amount: body.estimated_amount, status: body.status || "已排" }
    : { ...service, entry_date: body.entry_date, amount_actual: body.amount_actual, source: body.source || null };
  const { data, error } = await db.from(table).insert(payload as Record<string, unknown>).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
