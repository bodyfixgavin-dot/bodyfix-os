import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type NewClientPayload = {
  display_name?: string;
  contact_method?: string;
  line_id?: string;
  ig_id?: string;
  main_issue?: string;
};

function clientDisplayName(row: Record<string, unknown>) {
  return String(row.display_name ?? row.client_name ?? row.nickname ?? "未命名客戶");
}

export async function GET() {
  const db = createSupabaseAdminClient();
  if (!db) return NextResponse.json({ error: "Supabase client is unavailable" }, { status: 503 });

  const clientsQuery = await db
    .from("clients")
    .select("id, display_name, client_name, nickname, line_id, instagram, main_issue")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (clientsQuery.error) return NextResponse.json({ error: clientsQuery.error.message }, { status: 500 });

  const servicesQuery = await db
    .from("service_catalog")
    .select("service_code, service_line, service_name, service_variant, standard_price")
    .order("service_code", { ascending: true });

  return NextResponse.json({
    clients: (clientsQuery.data ?? []).map((client) => ({ ...client, display_label: clientDisplayName(client) })),
    services: servicesQuery.error ? [] : (servicesQuery.data ?? []),
    services_error: servicesQuery.error?.message ?? null,
  });
}

export async function POST(request: Request) {
  const db = createSupabaseAdminClient();
  if (!db) return NextResponse.json({ error: "Supabase client is unavailable" }, { status: 503 });

  const body = await request.json();
  let clientId = body.client_id as string | undefined;
  let clientNameSnapshot = body.client_name_snapshot as string | undefined;

  if (body.client_mode === "new") {
    const client = (body.new_client ?? {}) as NewClientPayload;
    const displayName = client.display_name?.trim();
    if (!displayName) return NextResponse.json({ error: "請填寫新客戶名稱" }, { status: 400 });

    const createClientQuery = await db
      .from("clients")
      .insert({
        display_name: displayName,
        client_name: displayName,
        line_id: client.line_id || null,
        instagram: client.ig_id || null,
        main_issue: client.main_issue || null,
        internal_notes: client.contact_method ? `contact_method：${client.contact_method}` : null,
      })
      .select("id, display_name, client_name")
      .single();

    if (createClientQuery.error) return NextResponse.json({ error: createClientQuery.error.message }, { status: 500 });
    clientId = createClientQuery.data.id;
    clientNameSnapshot = clientDisplayName(createClientQuery.data);
  }

  if (!clientId || !clientNameSnapshot) return NextResponse.json({ error: "請選擇或新增客戶" }, { status: 400 });

  const insertQuery = await db.from("pulse_income_entries").insert({
    entry_date: body.entry_date,
    client_id: clientId,
    client_name_snapshot: clientNameSnapshot,
    service_code: body.service_code,
    service_line: body.service_line,
    service_name: body.service_name,
    service_variant: body.service_variant,
    standard_price: body.standard_price,
    amount_actual: body.amount_actual,
    source: body.source,
    note: body.note,
  }).select("id").single();

  if (insertQuery.error) return NextResponse.json({ error: insertQuery.error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: insertQuery.data.id });
}
