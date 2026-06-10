import { NextResponse } from "next/server";
import { requireClinicAdmin } from "@/lib/clinic-api";

const DEFAULT_CATEGORIES = ["service", "package", "quick_filter", "tension", "region", "fascia_line", "location"];

export async function GET(req: Request) {
  const auth = await requireClinicAdmin("/api/clinic/codebook");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const categories = (searchParams.get("categories") ?? DEFAULT_CATEGORIES.join(","))
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean);
  const includeInactive = searchParams.get("include_inactive") === "true";

  let query = auth.supabase
    .from("codebook_entries")
    .select("category_code,code,display_name_zh,display_name_en,description,parent_category_code,parent_code,metadata,sort_order,status")
    .in("category_code", categories)
    .order("category_code")
    .order("sort_order")
    .order("code");

  if (!includeInactive) query = query.eq("status", "active");

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const entries = data ?? [];
  const byCategory = Object.fromEntries(
    categories.map((category) => [category, entries.filter((entry) => entry.category_code === category)])
  );

  return NextResponse.json({ categories, entries, by_category: byCategory });
}
