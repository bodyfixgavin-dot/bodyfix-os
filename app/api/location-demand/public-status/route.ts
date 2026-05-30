import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { corsJson, handleOptions } from "@/lib/cors";

const MESSAGE = "登記頁建置中，預計 6 月開始系統化登記。現在可先留言或私訊：城市名＋想處理的問題。目前已收到宜蘭、高雄、台中等城市需求，歡迎繼續留言。";

async function readStatus() {
  const envStatus = process.env.LOCATION_DEMAND_PUBLIC_STATUS;
  if (envStatus) return envStatus;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return "coming_soon";
  const { data } = await supabase.from("location_settings").select("public_status").eq("setting_key", "location_demand_public_status").maybeSingle();
  return data?.public_status ?? "coming_soon";
}

export async function GET(req: Request) {
  const status = await readStatus();
  return corsJson(req, { status, message: MESSAGE });
}

export async function OPTIONS(req: Request) {
  return handleOptions(req, "GET,OPTIONS");
}
