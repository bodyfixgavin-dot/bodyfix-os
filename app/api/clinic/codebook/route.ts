import { NextResponse } from "next/server";
import { requireClinicAdmin } from "@/lib/clinic-api";

const CATEGORY_FIELDS = "id,category_key,category_name_zh,category_name_en,description,sort_order,is_active,created_at,updated_at";
const ITEM_FIELDS = "id,category_key,code,name_zh,name_en,short_label,description,parent_code,quick_filter_code,group_key,sort_order,is_active,is_public,is_coming_soon,is_deprecated,metadata,created_at,updated_at";

export async function GET(req: Request) {
  const auth = await requireClinicAdmin("/api/clinic/codebook");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const categoryKey = searchParams.get("category_key")?.trim().toUpperCase();
  const groupKey = searchParams.get("group_key")?.trim();
  const quickFilterCode = searchParams.get("quick_filter_code")?.trim().toUpperCase();
  const activeOnly = searchParams.get("active_only") === "true";

  let categoriesQuery = auth.supabase
    .from("codebook_categories")
    .select(CATEGORY_FIELDS)
    .order("sort_order")
    .order("category_key");
  let itemsQuery = auth.supabase
    .from("codebook_items")
    .select(ITEM_FIELDS)
    .order("sort_order")
    .order("code");

  if (categoryKey) {
    categoriesQuery = categoriesQuery.eq("category_key", categoryKey);
    itemsQuery = itemsQuery.eq("category_key", categoryKey);
  }
  if (groupKey) itemsQuery = itemsQuery.eq("group_key", groupKey);
  if (quickFilterCode) itemsQuery = itemsQuery.eq("quick_filter_code", quickFilterCode);
  if (activeOnly) {
    categoriesQuery = categoriesQuery.eq("is_active", true);
    itemsQuery = itemsQuery.eq("is_active", true);
  }

  const [categories, items] = await Promise.all([categoriesQuery, itemsQuery]);
  const failed = [categories, items].find((result) => result.error);
  if (failed?.error) {
    return NextResponse.json({
      error: failed.error.message,
      requestPath: "/api/clinic/codebook",
      failedRequest: "Supabase codebook reference tables select"
    }, { status: 500 });
  }

  return NextResponse.json({ categories: categories.data ?? [], items: items.data ?? [] });
}
