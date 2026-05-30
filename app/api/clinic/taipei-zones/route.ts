import { NextResponse } from "next/server";
import { requireClinicAdmin } from "@/lib/clinic-api";
export async function GET() {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase.from("taipei_service_zones").select("*").order("zone_code");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ taipei_zones: data ?? [] });
}
