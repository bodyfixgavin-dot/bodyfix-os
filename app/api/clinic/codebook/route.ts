import { NextResponse } from "next/server";
import { clinicDataError, requireClinicAdmin } from "@/lib/clinic-api";

const CATEGORY_FIELDS = "id,category_key,category_name_zh,category_name_en,description,sort_order,is_active,created_at,updated_at";
export const dynamic = "force-dynamic";

const ITEM_FIELDS = "id,category_key,code,name_zh,name_en,short_label,description,parent_code,quick_filter_code,group_key,sort_order,is_active,is_public,is_coming_soon,is_deprecated,metadata,created_at,updated_at";

function values(searchParams: URLSearchParams, key: string) {
  return searchParams.getAll(key).flatMap((value) => value.split(",")).map((value) => value.trim()).filter(Boolean);
}

const requestPath = "/api/clinic/codebook";
const failedRequest = "Supabase codebook categories/items select";

export async function GET(req: Request) {
  const auth = await requireClinicAdmin(requestPath);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const categoryKeys = values(searchParams, "category_key").map((value) => value.toUpperCase());
  const groupKeys = values(searchParams, "group_key");
  const quickFilterCodes = values(searchParams, "quick_filter_code");
  const activeOnly = searchParams.get("active_only") === "true";

  let categoriesQuery = auth.supabase
    .from("codebook_categories")
    .select(CATEGORY_FIELDS)
    .order("sort_order")
    .order("category_key");
  let itemsQuery = auth.supabase
    .from("codebook_items")
    .select(ITEM_FIELDS)
    .order("category_key")
    .order("sort_order")
    .order("code");

  if (categoryKeys.length) {
    categoriesQuery = categoriesQuery.in("category_key", categoryKeys);
    itemsQuery = itemsQuery.in("category_key", categoryKeys);
  }
  if (groupKeys.length) itemsQuery = itemsQuery.in("group_key", groupKeys);
  if (quickFilterCodes.length) itemsQuery = itemsQuery.in("quick_filter_code", quickFilterCodes);
  if (activeOnly) {
    categoriesQuery = categoriesQuery.eq("is_active", true);
    itemsQuery = itemsQuery.eq("is_active", true);
  }

  try {
    const [categories, items] = await Promise.all([categoriesQuery, itemsQuery]);
    const error = categories.error ?? items.error;
    if (error) return clinicDataError(requestPath, error, failedRequest);

    return NextResponse.json(
      { categories: categories.data ?? [], items: items.data ?? [] },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    return clinicDataError(requestPath, error, failedRequest);
  }
}
