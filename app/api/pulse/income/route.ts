import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

async function resolveClient(db: NonNullable<ReturnType<typeof createSupabaseAdminClient>>, form: FormData) {
  if (form.get("client_mode") === "new") {
    const display_name = String(form.get("new_display_name") ?? "").trim();
    if (!display_name) throw new Error("請輸入新客名稱");
    const { data, error } = await db.from("clients").insert({ display_name, contact_method: form.get("new_contact_method"), line_id: form.get("new_line_id") || null, ig_id: form.get("new_ig_id") || null, main_issue: form.get("new_main_issue") || null }).select("id,display_name").single();
    if (error) throw error; return data;
  }
  const id = String(form.get("client_id") ?? ""); if (!id) return null;
  const { data, error } = await db.from("clients").select("id,display_name").eq("id", id).single(); if (error) throw error; return data;
}
export async function POST(request: Request) { const db = createSupabaseAdminClient(); if (!db) return NextResponse.json({ error: "Supabase 尚未設定" }, { status: 503 }); try { const form = await request.formData(); const client = await resolveClient(db, form); const amount = Number(form.get("amount") ?? 0); const { error } = await db.from("pulse_income_entries").insert({ entry_date: form.get("date"), client_id: client?.id ?? null, client_name_snapshot: client?.display_name ?? null, service_type: form.get("service_type"), amount, source: form.get("source"), note: form.get("note") }); if (error) throw error; return NextResponse.json({ ok: true }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "儲存失敗" }, { status: 400 }); } }
