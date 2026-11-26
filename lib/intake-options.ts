import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { CONFIRMED_INTAKE_PLACES, DISCUSS_PLACE, type IntakePlace } from "./intake-places";
export { CONFIRMED_INTAKE_PLACES, DISCUSS_PLACE, type IntakePlace } from "./intake-places";
// Locations explicitly confirmed by Gavin for this release. No street addresses are stored here.
// Existing admin statuses/names take precedence whenever that table is available.
export async function getIntakePlaces(): Promise<IntakePlace[]> {
  const db = createSupabaseAdminClient();
  if (!db) return [...CONFIRMED_INTAKE_PLACES, DISCUSS_PLACE];
  try {
    const { data, error } = await db.from("taipei_service_zones").select("zone_code, display_name_zh, is_regular_base").in("status", ["active", "limited", "collecting_interest"]).order("is_regular_base", { ascending: false }).order("display_name_zh").abortSignal(AbortSignal.timeout(2500));
    if (error) return [...CONFIRMED_INTAKE_PLACES, DISCUSS_PLACE];
    return [...(data ?? []).map(p => ({ id: p.zone_code, name: p.display_name_zh + (p.is_regular_base ? "工作室 · 主要地點" : " · 次要地點，場地需確認") })), DISCUSS_PLACE];
  } catch { return [...CONFIRMED_INTAKE_PLACES, DISCUSS_PLACE]; }
}
