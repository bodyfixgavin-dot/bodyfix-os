import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ServiceCatalogRow = {
  service_code: string | null;
  service_line: string | null;
  service_name: string | null;
  service_variant: string | null;
  standard_price: number | null;
  status: string | null;
};

export async function GET() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ services: [], error: "Supabase environment is not configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("service_catalog")
    .select("service_code, service_line, service_name, service_variant, standard_price, status")
    .in("status", ["active", "trial"])
    .order("service_line", { ascending: true })
    .order("service_code", { ascending: true });

  if (error) {
    return NextResponse.json({ services: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ services: (data ?? []) as ServiceCatalogRow[] });
}
