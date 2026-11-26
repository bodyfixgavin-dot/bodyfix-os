import { createSupabaseAdminClient } from "@/lib/supabase/server";
export type IntakePlace = { id: string; name: string };
// Locations explicitly confirmed by Gavin for this release. No street addresses are stored here.
// Existing admin statuses/names take precedence whenever that table is available.
export const CONFIRMED_INTAKE_PLACES: IntakePlace[] = [
  { id: "liuzhangli", name: "六張犁工作室 · 主要地點" },
  { id: "ximen", name: "西門 · 次要地點，場地需確認" },
  { id: "sun_yat_sen_memorial", name: "國父紀念館 · 次要地點，場地需確認" },
];
export const DISCUSS_PLACE: IntakePlace = { id: "discuss", name: "指定地點服務（到府）／與 Gavin 討論" };
export async function getIntakePlaces(): Promise<IntakePlace[]> {
  const db = createSupabaseAdminClient();
  if (!db) return [...CONFIRMED_INTAKE_PLACES, DISCUSS_PLACE];
  try {
    const { data, error } = await db.from("taipei_service_zones").select("zone_code, display_name_zh, is_regular_base").in("status", ["active", "limited", "collecting_interest"]).order("is_regular_base", { ascending: false }).order("display_name_zh");
    if (error) return [...CONFIRMED_INTAKE_PLACES, DISCUSS_PLACE];
    return [...(data ?? []).map(p => ({ id: p.zone_code, name: p.display_name_zh + (p.is_regular_base ? "工作室 · 主要地點" : " · 次要地點，場地需確認") })), DISCUSS_PLACE];
  } catch { return [...CONFIRMED_INTAKE_PLACES, DISCUSS_PLACE]; }
}
