import { corsJson, handleOptions } from "@/lib/cors";
import { LOCATION_LEAD_FIELDS, cleanPayload, readJson } from "@/lib/clinic-api";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const CLOSED_MESSAGE = "登記頁建置中，預計 6 月開始系統化登記。現在可先留言或私訊：城市名＋想處理的問題。";

async function readStatus(supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>) {
  if (process.env.LOCATION_DEMAND_PUBLIC_STATUS) return process.env.LOCATION_DEMAND_PUBLIC_STATUS;
  const { data } = await supabase.from("location_settings").select("public_status").eq("setting_key", "location_demand_public_status").maybeSingle();
  return data?.public_status ?? "coming_soon";
}

export async function POST(req: Request) {
  const supabase = createSupabaseAdminClient();
  const publicStatus = supabase ? await readStatus(supabase) : (process.env.LOCATION_DEMAND_PUBLIC_STATUS ?? "coming_soon");
  if (publicStatus === "coming_soon") {
    return corsJson(req, { error: "LOCATION_REGISTRATION_NOT_OPEN", message: CLOSED_MESSAGE }, { status: 403 });
  }
  if (!supabase) return corsJson(req, { error: "Supabase admin environment is not configured" }, { status: 500 });
  const body = await readJson(req);
  if (body.privacy_consent !== true) {
    return corsJson(req, { error: "PRIVACY_CONSENT_REQUIRED", message: "正式登記表單送出前必須同意資料使用聲明。" }, { status: 400 });
  }
  const payload = cleanPayload(body, LOCATION_LEAD_FIELDS) as Record<string, unknown>;
  payload.privacy_consent = true;
  payload.privacy_consent_at = new Date().toISOString();
  payload.source ||= "location_demand_public";
  payload.status ||= "active";
  payload.nurture_status ||= "registered";
  const { data, error } = await supabase.from("location_demand_leads").insert(payload).select("id, lead_type, city_code, client_area_code, preferred_zone_code, nurture_status").single();
  if (error) return corsJson(req, { error: error.message }, { status: 400 });
  return corsJson(req, { lead: data }, { status: 201 });
}

export async function OPTIONS(req: Request) {
  return handleOptions(req, "POST,OPTIONS");
}
