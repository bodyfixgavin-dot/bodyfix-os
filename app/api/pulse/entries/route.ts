import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { PULSE_CLIENT_SELECT } from "@/lib/pulse/clients";

type ClientInput = { id?: string; display_name?: string; nickname?: string; contact_method?: string; line_id?: string; ig_id?: string; main_issue?: string };

function clean(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin env is not configured." }, { status: 503 });
  const body = await request.json();
  const clientInput = (body.client ?? {}) as ClientInput;
  let client = null as null | { id: string; display_name: string };

  if (clientInput.id) {
    const { data, error } = await supabase.from("clients").select(PULSE_CLIENT_SELECT).eq("id", clientInput.id).single();
    if (error || !data?.display_name) return NextResponse.json({ error: "找不到客戶 display_name。" }, { status: 400 });
    client = { id: data.id, display_name: data.display_name };
  } else {
    const displayName = clean(clientInput.display_name);
    if (!displayName) return NextResponse.json({ error: "新增客戶需要 display_name。" }, { status: 400 });
    const payload = {
      display_name: displayName,
      nickname: clean(clientInput.nickname),
      contact_method: clean(clientInput.contact_method),
      line_id: clean(clientInput.line_id),
      ig_id: clean(clientInput.ig_id),
      main_issue: clean(clientInput.main_issue)
    };
    const { data, error } = await supabase.from("clients").insert(payload).select(PULSE_CLIENT_SELECT).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    client = { id: data.id, display_name: data.display_name };
  }

  const amount = Number(body.amount ?? 0);
  const common = { client_id: client.id, client_name_snapshot: client.display_name, service_type: clean(body.service_type), note: clean(body.note) };
  const result = body.kind === "appointment"
    ? await supabase.from("pulse_appointments").insert({ ...common, appointment_date: clean(body.entry_date), start_time: clean(body.start_time), estimated_amount: amount || null, status: clean(body.status) ?? "已排" }).select("id").single()
    : await supabase.from("pulse_income_entries").insert({ ...common, entry_date: clean(body.entry_date), amount, source: clean(body.source) }).select("id").single();

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ ok: true, client });
}
