import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const fallbackServices = ["60 分", "90 分", "120 分", "骨盆核心延長", "教練課", "其他"].map((label) => ({ id: label, label }));

export async function GET() {
  try {
    const db = createSupabaseAdminClient();
    if (!db) return NextResponse.json({ services: fallbackServices });
    const { data, error } = await db.from("service_catalog").select("id,name,display_name,display_name_zh,price").limit(200);
    if (error) return NextResponse.json({ services: fallbackServices, error: error.message }, { status: 200 });
    const services = (data ?? []).map((service) => ({
      id: String(service.id),
      label: service.display_name_zh ?? service.display_name ?? service.name ?? "未命名服務",
      price: service.price ?? null,
    }));
    return NextResponse.json({ services: services.length ? services : fallbackServices });
  } catch {
    return NextResponse.json({ services: fallbackServices });
  }
}
