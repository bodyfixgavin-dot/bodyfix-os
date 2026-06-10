import { NextResponse } from "next/server";
import { requireClinicAdmin } from "@/lib/clinic-api";

type Params = { params: Promise<{ category_key: string }> };

export async function GET(req: Request, ctx: Params) {
  const auth = await requireClinicAdmin("/api/clinic/codebook/[category_key]");
  if (!auth.ok) return auth.response;

  const { category_key: rawCategoryKey } = await ctx.params;
  const categoryKey = decodeURIComponent(rawCategoryKey).trim().toUpperCase();
  const activeOnly = new URL(req.url).searchParams.get("active_only") === "true";
  let itemsQuery = auth.supabase
    .from("codebook_items")
    .select("id,category_key,code,name_zh,name_en,short_label,description,parent_code,quick_filter_code,group_key,sort_order,is_active,is_public,is_coming_soon,is_deprecated,metadata,created_at,updated_at")
    .eq("category_key", categoryKey)
    .order("sort_order")
    .order("code");
  if (activeOnly) itemsQuery = itemsQuery.eq("is_active", true);

  let categoryQuery = auth.supabase.from("codebook_categories").select("*").eq("category_key", categoryKey);
  if (activeOnly) categoryQuery = categoryQuery.eq("is_active", true);

  const [category, items] = await Promise.all([
    categoryQuery.maybeSingle(),
    itemsQuery
  ]);
  const error = category.error ?? items.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!category.data) return NextResponse.json({ error: "Codebook category not found" }, { status: 404 });

  return NextResponse.json({ category: category.data, items: items.data ?? [] });
}
