import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase environment is not configured" }, { status: 500 });
  }

  const now = new Date().toISOString();
  const [{ data: slots, error: slotError }, { data: services, error: serviceError }] = await Promise.all([
    supabase
      .from("public_available_slots")
      .select("id,starts_at,ends_at,city,slot_type,status,note")
      .gte("starts_at", now)
      .order("starts_at", { ascending: true }),
    supabase
      .from("services")
      .select("id,name,duration_minutes,price,is_active")
      .eq("is_active", true)
      .order("duration_minutes", { ascending: true })
  ]);

  if (slotError || serviceError) {
    return NextResponse.json(
      { error: slotError?.message || serviceError?.message || "Unable to load booking data" },
      { status: 500 }
    );
  }

  return NextResponse.json({ slots: slots ?? [], services: services ?? [] });
}
