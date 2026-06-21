import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const db = createSupabaseAdminClient();
    if (!db) return NextResponse.json({ error: "Supabase admin env 尚未設定，未寫入資料。" }, { status: 503 });

    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: "Payload 格式錯誤。" }, { status: 400 });

    const clientId = text(body.client_id);
    const serviceId = text(body.service_id);
    const entryDate = text(body.entry_date);
    const amount = Number(body.amount ?? 0);
    if (body.kind !== "income") return NextResponse.json({ error: "Pulse v0.9 目前只開放收入寫入。" }, { status: 400 });
    if (!clientId || !serviceId || !entryDate || !Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "請選擇客戶、服務並填寫有效金額。" }, { status: 400 });
    }

    const [{ data: client }, { data: service }] = await Promise.all([
      db.from("clients").select("display_name,client_name,nickname").eq("id", clientId).maybeSingle(),
      db.from("service_catalog").select("name,display_name,display_name_zh").eq("id", serviceId).maybeSingle(),
    ]);

    const { error } = await db.from("pulse_income_entries").insert({
      entry_date: entryDate,
      client_name: client?.display_name ?? client?.client_name ?? client?.nickname ?? null,
      service_type: service?.display_name_zh ?? service?.display_name ?? service?.name ?? serviceId,
      amount,
      source: text(body.source) || null,
      note: text(body.note) || null,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "API 錯誤，資料未寫入。" }, { status: 500 });
  }
}
