import { createSupabaseAdminClient } from "@/lib/supabase/server";
export type IntakePlace = { id: string; name: string };
// No guessed addresses or stale studio fallback. Studio names/status are maintained in existing admin.
export const DISCUSS_PLACE: IntakePlace = { id: "discuss", name: "指定地點服務（到府）／與 Gavin 討論" };
export async function getIntakePlaces(): Promise<IntakePlace[]> {
  const db = createSupabaseAdminClient();
  if (!db) return [DISCUSS_PLACE];
  try {
    const { data, error } = await db.from("taipei_service_zones").select("zone_code, display_name_zh, is_regular_base").in("status", ["active", "limited", "collecting_interest"]).order("is_regular_base", { ascending: false }).order("display_name_zh");
    if (error) return [DISCUSS_PLACE];
    return [...(data ?? []).map(p => ({ id: p.zone_code, name: p.display_name_zh + (p.is_regular_base ? "工作室 · 主要地點" : " · 次要地點，場地需確認") })), DISCUSS_PLACE];
  } catch { return [DISCUSS_PLACE]; }
}
