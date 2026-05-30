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
      .select("id,code,name,category,display_name_zh,display_name_en,duration_minutes,price,price_twd,cash_price_twd,is_active,is_addon,is_public_visible,is_direct_booking_allowed,is_city_session_allowed,requires_consultation,daily_limit,status,sort_order,booking_note,internal_note")
      .eq("is_active", true)
      .eq("is_public_visible", true)
      .eq("is_addon", false)
      .eq("is_direct_booking_allowed", true)
      .eq("status", "active")
      .order("sort_order", { ascending: true })
  ]);

  if (slotError || serviceError) {
    return NextResponse.json(
      { error: slotError?.message || serviceError?.message || "Unable to load booking data" },
      { status: 500 }
    );
  }

  return NextResponse.json({ slots: slots ?? [], services: services ?? [] });
}
