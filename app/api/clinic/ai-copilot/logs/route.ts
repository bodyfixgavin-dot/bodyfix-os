import { NextResponse } from "next/server";
import { withAiAdmin } from "../_helpers";

export async function GET() {
  return withAiAdmin(async ({ supabase }) => {
    const { data, error } = await supabase.from("ai_copilot_logs").select("*").order("created_at", { ascending: false }).limit(50);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ logs: data ?? [] });
  });
}
