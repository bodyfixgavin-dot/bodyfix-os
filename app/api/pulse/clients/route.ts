import { NextResponse } from "next/server";
import { PULSE_CLIENT_SELECT } from "@/lib/pulse/clients";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ clients: [] });
  const { data, error } = await supabase
    .from("clients")
    .select(PULSE_CLIENT_SELECT)
    .order("display_name", { ascending: true })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message, clients: [] }, { status: 500 });
  return NextResponse.json({ clients: data ?? [] });
}
