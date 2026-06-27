import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { normalizePhone, normalizeText, resolveIntakeClient, type CandidateClient } from "@/lib/intake-crm-resolver";

type IntakeBody = { name?: string; line?: string; lineUserId?: string; phone?: string; instagram?: string; birthday?: string; birthTime?: string; birthPlace?: string; time?: string; timeNote?: string; note?: string; selections?: Record<string, string[]>; sunSign?: string; chartInterest?: string; birthDataLevel?: string; stateTrend?: string; message?: string; safetyNote?: string; pressureNote?: string; consent?: boolean };
const CHART = new Set(["curious", "later", "not_now", "not_selected"]);
const LEVEL = new Set(["none", "date_only", "full"]);
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const list = (input: Record<string, string[]> | undefined, key: string) => Array.isArray(input?.[key]) ? input[key].filter((item) => typeof item === "string" && item.trim()) : [];
function validDate(value: string) { if (!value) return ""; if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return ""; const d = new Date(`${value}T00:00:00Z`); return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value ? "" : value; }
function chartInterest(value: string) { return CHART.has(value) ? value : "not_selected"; }
function birthDataLevel(value: string, birthday: string, birthTime: string, birthPlace: string) { const inferred = !birthday ? "none" : birthTime && birthPlace ? "full" : "date_only"; return LEVEL.has(value) ? value : inferred; }
function jsonArray(ids: string[]) { return ids.length ? ids : []; }
async function checked<T>(label: string, result: PromiseLike<{ data: T; error: { message?: string } | null }>) { const { data, error } = await result; if (error) throw new Error(`${label}: ${error.message ?? "unknown error"}`); return data; }
async function addClientIds(set: Set<string>, rows: Array<{ id?: string | null; client_id?: string | null }> | null | undefined) { (rows ?? []).forEach((row) => { const id = row.client_id ?? row.id; if (id) set.add(id); }); }
async function fetchCandidates(supabase: any, body: IntakeBody) {
  const ids = new Set<string>();
  const queries: Promise<void>[] = [];
  const addQuery = (query: PromiseLike<{ data: Array<{ id?: string; client_id?: string }> | null; error: { message?: string } | null }>, label: string) => {
    queries.push(checked(label, query).then((rows) => addClientIds(ids, rows)));
  };
  const lineUserId = normalizeText(text(body.lineUserId));
  const lineId = normalizeText(text(body.line));
  const instagram = normalizeText(text(body.instagram));
  const phone = normalizePhone(text(body.phone));
  const name = text(body.name);
  const normalizedName = normalizeText(name);
  if (lineUserId) addQuery(supabase.from("clients").select("id").eq("line_user_id", text(body.lineUserId)).limit(20), "candidate line_user_id clients");
  if (lineUserId) addQuery(supabase.from("client_identifiers").select("client_id").eq("identifier_type", "line_user_id").eq("normalized_value", lineUserId).limit(20), "candidate line_user_id identifiers");
  if (phone) addQuery(supabase.from("clients").select("id").eq("phone", text(body.phone)).limit(20), "candidate phone clients");
  if (phone) addQuery(supabase.from("client_identifiers").select("client_id").eq("identifier_type", "phone").eq("normalized_value", phone).limit(20), "candidate phone identifiers");
  if (lineId) addQuery(supabase.from("clients").select("id").eq("line_id", text(body.line)).limit(20), "candidate line_id clients");
  if (lineId) addQuery(supabase.from("client_identifiers").select("client_id").eq("identifier_type", "line_id").eq("normalized_value", lineId).limit(20), "candidate line_id identifiers");
  if (instagram) addQuery(supabase.from("clients").select("id").eq("instagram", text(body.instagram)).limit(20), "candidate instagram clients");
  if (instagram) addQuery(supabase.from("client_identifiers").select("client_id").eq("identifier_type", "instagram").eq("normalized_value", instagram).limit(20), "candidate instagram identifiers");
  if (name) addQuery(supabase.from("clients").select("id").eq("display_name", name).limit(20), "candidate display_name clients");
  if (normalizedName) addQuery(supabase.from("client_aliases").select("client_id").eq("alias_normalized", normalizedName).limit(20), "candidate aliases");
  await Promise.all(queries);
  if (!ids.size) return [];
  const idList = [...ids];
  const clients = await checked<any[]>("load candidate clients", supabase.from("clients").select("id, display_name, birthday, line_user_id, line_id, phone, instagram, last_session_date").in("id", idList));
  const aliases = await checked<any[]>("load candidate aliases", supabase.from("client_aliases").select("client_id, alias").in("client_id", idList));
  const identifiers = await checked<any[]>("load candidate identifiers", supabase.from("client_identifiers").select("client_id, identifier_type, identifier_value, normalized_value, is_verified, is_active").in("client_id", idList));
  return clients.map((c) => ({ ...c, aliases: aliases.filter((a) => a.client_id === c.id).map((a) => a.alias), identifiers: identifiers.filter((i) => i.client_id === c.id) })) as CandidateClient[];
}
async function markFailed(supabase: any, submissionId: string, error: unknown) { console.error("intake CRM promotion failed", error); await supabase.from("intake_submissions").update({ resolution_status: "failed", resolution_reason: error instanceof Error ? error.message : "unknown_error", resolved_at: null, resolved_by: null, updated_at: new Date().toISOString() }).eq("id", submissionId); }
export async function POST(req: Request) {
  let body: IntakeBody = {};
  try { body = await req.json(); } catch { body = {}; }
  const name = text(body.name); const line = text(body.line); const phoneRaw = text(body.phone); const instagramRaw = text(body.instagram); const lineUserId = text(body.lineUserId);
  const phone = normalizePhone(phoneRaw); const lineNorm = normalizeText(line); const instagram = normalizeText(instagramRaw);
  if (!name) return NextResponse.json({ error: "請填寫稱呼。" }, { status: 400 });
  if (!lineNorm && !phone && !instagram) return NextResponse.json({ error: "請至少留下 LINE ID、手機或 Instagram 其中一種聯絡方式。" }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ error: "請先同意資料使用說明。" }, { status: 400 });
  const birthday = validDate(text(body.birthday)); const birthTime = text(body.birthTime); const birthPlace = text(body.birthPlace);
  const payload = { display_name: name, line_id: line || null, line_user_id: lineUserId || null, phone: phoneRaw || null, instagram: instagramRaw || null, birthday: birthday || null, birth_time_note: birthTime || null, birth_place: birthPlace || null, sun_sign: text(body.sunSign) || null, chart_interest: chartInterest(text(body.chartInterest)), birth_data_level: birthDataLevel(text(body.birthDataLevel), birthday, birthTime, birthPlace), consent_at: new Date().toISOString(), raw_payload: body, goals: list(body.selections, "goal"), body_locations: list(body.selections, "location"), duration: list(body.selections, "duration")[0] ?? null, comfort_score: list(body.selections, "comfort")[0] ? Number(list(body.selections, "comfort")[0]) : null, previous_support: list(body.selections, "history"), trigger_moments: list(body.selections, "triggerMoment"), exercise_frequency: list(body.selections, "exerciseFrequency")[0] ?? null, exercise_types: list(body.selections, "exerciseTypes"), trainer_status: list(body.selections, "trainerStatus")[0] ?? null, safety_flags: list(body.selections, "safetyFlags"), pressure_preferences: list(body.selections, "pressurePreferences"), safety_note: text(body.safetyNote) || null, pressure_note: text(body.pressureNote) || null, state_recent: list(body.selections, "stateRecent")[0] ?? null, state_improve: list(body.selections, "stateImprove")[0] ?? null, state_feeling: list(body.selections, "stateFeeling")[0] ?? null, state_trend: text(body.stateTrend) || null, service_interest: list(body.selections, "service")[0] ?? null, preferred_place: list(body.selections, "place")[0] ?? null, available_times: list(body.selections, "availableTimes"), last_minute_ok: list(body.selections, "lastMinute")[0] ?? null, preferred_time_note: text(body.timeNote || body.time) || null, note: text(body.note) || null, raw_message: text(body.message) || null, source: "public_intake", status: "new", resolution_status: "pending" };
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ ok: true, stored: false, reason: "supabase_not_configured" }, { status: 202 });
  const submission = await checked<any>("insert intake submission", supabase.from("intake_submissions").insert(payload).select("id, created_at").single()).catch((error) => { console.error("intake submission insert failed", error); return null; });
  if (!submission) return NextResponse.json({ ok: true, stored: false }, { status: 202 });
  try {
    const candidates = await fetchCandidates(supabase, body);
    const resolution = resolveIntakeClient({ name, birthday: birthday || null, lineUserId: lineUserId || null, lineId: line || null, phone: phoneRaw || null, instagram: instagramRaw || null }, candidates);
    await checked("process intake CRM resolution", supabase.rpc("process_intake_crm_resolution", { p_submission_id: submission.id, p_resolution_status: resolution.status, p_resolution_reason: resolution.reason, p_candidate_client_ids: jsonArray(resolution.candidateClientIds), p_client_id: resolution.clientId ?? null, p_create_client: resolution.status === "created_new", p_resolved_by: "system", p_manual: false, p_action: "public_intake" }));
  } catch (error) {
    await markFailed(supabase, submission.id, error);
  }
  return NextResponse.json({ ok: true, stored: true, submission }, { status: 201 });
}
