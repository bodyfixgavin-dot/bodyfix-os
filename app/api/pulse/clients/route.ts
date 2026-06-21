import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const db = createSupabaseAdminClient();
    if (!db) return NextResponse.json({ clients: [] });
    const { data, error } = await db.from("clients").select("id,display_name,client_name,nickname").order("updated_at", { ascending: false }).limit(200);
    if (error) return NextResponse.json({ clients: [], error: error.message }, { status: 200 });
    return NextResponse.json({ clients: (data ?? []).map((client) => ({ id: String(client.id), label: client.display_name ?? client.client_name ?? client.nickname ?? "未命名客戶" })) });
  } catch {
    return NextResponse.json({ clients: [] });
  }
}
