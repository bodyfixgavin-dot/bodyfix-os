import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const fallbackServices = [
  { service_code: "BF-BR-001", service_line: "Body Reset", service_name: "筋膜鏈整理", service_variant: "標準", duration_minutes: 60, standard_price: 2200 },
  { service_code: "BF-BR-002", service_line: "Body Reset", service_name: "筋膜線指定整理", service_variant: "指定", duration_minutes: 60, standard_price: 2300 },
  { service_code: "BF-BR-EXT-001", service_line: "Body Reset", service_name: "筋膜鏈延長整理", service_variant: "延長", duration_minutes: 90, standard_price: 3300 },
  { service_code: "BF-PC-001", service_line: "Body Reset", service_name: "骨盆核心整理", service_variant: "標準", duration_minutes: 60, standard_price: 2500 }
];

export async function GET() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ clients: [], services: fallbackServices });

  const [clientsResult, servicesResult] = await Promise.all([
    supabase.from("clients").select("id, client_code, display_name").order("updated_at", { ascending: false, nullsFirst: false }).limit(100),
    supabase.from("service_catalog").select("id, service_code, service_line, service_name, service_variant, duration_minutes, standard_price").eq("is_active", true).order("sort_order", { ascending: true })
  ]);

  if (clientsResult.error) return NextResponse.json({ error: clientsResult.error.message }, { status: 500 });
  if (servicesResult.error) return NextResponse.json({ error: servicesResult.error.message }, { status: 500 });

  return NextResponse.json({ clients: clientsResult.data ?? [], services: servicesResult.data?.length ? servicesResult.data : fallbackServices });
}
