import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { normalizePhone, normalizeText, resolveIntakeClient, type CandidateClient } from "@/lib/intake-crm-resolver";

type IntakeBody = { name?: string; line?: string; lineUserId?: string; phone?: string; instagram?: string; birthday?: string; birthTime?: string; birthPlace?: string; time?: string; timeNote?: string; note?: string; selections?: Record<string, string[]>; sunSign?: string; chartInterest?: string; birthDataLevel?: string; stateTrend?: string; message?: string; safetyNote?: string; pressureNote?: string; consent?: boolean; idempotencyKey?: string };
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const list = (input: Record<string, string[]> | undefined, key: string) => Array.isArray(input?.[key]) ? input[key].filter((item) => typeof item === "string" && item.trim()) : [];
const safeChart = (v: string) => ["curious", "later", "not_now"].includes(v) ? v : "not_selected";
const birthLevel = (birthday: string, birthTime: string, birthPlace: string) => !birthday ? "none" : birthTime && birthPlace ? "full" : "date_only";

async function fetchCandidates(supabase: any, body: IntakeBody) {
  const names = [text(body.name)].filter(Boolean).map(normalizeText);
  const phones = [text(body.phone)].filter(Boolean).map(normalizePhone);
  const identifiers = [text(body.lineUserId), text(body.line), text(body.instagram), text(body.phone)].filter(Boolean).map((v) => normalizeText(v)).concat(phones);
  const byClients = await supabase.from("clients").select("id, display_name, birthday, line_user_id, line_id, phone, instagram, last_session_date").or(`display_name.eq.${text(body.name)},line_user_id.eq.${text(body.lineUserId)},line_id.eq.${text(body.line)},phone.eq.${text(body.phone)},instagram.eq.${text(body.instagram)}`).limit(20);
  const byAliases = names.length ? await supabase.from("client_aliases").select("client_id, alias").in("alias_normalized", names).limit(20) : { data: [] };
  const byIds = identifiers.length ? await supabase.from("client_identifiers").select("client_id, identifier_type, identifier_value, normalized_value, is_verified, is_active").in("normalized_value", identifiers).limit(30) : { data: [] };
  const ids = new Set<string>((byClients.data ?? []).map((c: any) => c.id));
  (byAliases.data ?? []).forEach((a: any) => ids.add(a.client_id));
  (byIds.data ?? []).forEach((i: any) => ids.add(i.client_id));
  const loaded = ids.size ? await supabase.from("clients").select("id, display_name, birthday, line_user_id, line_id, phone, instagram, last_session_date").in("id", [...ids]) : byClients;
  const aliases = ids.size ? await supabase.from("client_aliases").select("client_id, alias").in("client_id", [...ids]) : { data: [] };
  const fullIds = ids.size ? await supabase.from("client_identifiers").select("client_id, identifier_type, identifier_value, normalized_value, is_verified, is_active").in("client_id", [...ids]) : { data: [] };
  return (loaded.data ?? []).map((c: any) => ({ ...c, aliases: (aliases.data ?? []).filter((a: any) => a.client_id === c.id).map((a: any) => a.alias), identifiers: (fullIds.data ?? []).filter((i: any) => i.client_id === c.id) })) as CandidateClient[];
}
async function addAlias(supabase: any, clientId: string, alias: string) { if (!alias) return; await supabase.from("client_aliases").upsert({ client_id: clientId, alias, alias_normalized: normalizeText(alias), alias_type: "preferred_name", source: "public_intake", is_current: true, last_seen_at: new Date().toISOString() }, { onConflict: "client_id,alias_normalized" }); }
async function addIdentifier(supabase: any, clientId: string, type: string, value: string) { if (!value) return; const normalized = type === "phone" ? normalizePhone(value) : normalizeText(value); await supabase.from("client_identifiers").upsert({ client_id: clientId, identifier_type: type, identifier_value: value, normalized_value: normalized, source: "public_intake", is_active: true, last_seen_at: new Date().toISOString() }, { onConflict: "client_id,identifier_type,normalized_value" }); }
async function ensureFollowup(supabase: any, clientId: string, submissionId: string) { await supabase.from("followups").upsert({ client_id: clientId, followup_type: "day0", scheduled_date: new Date().toISOString().slice(0, 10), message_summary: "已收到新的預約前問卷", next_action: "確認服務、地點與可行時間", response_status: "not_sent", source_key: `intake:${submissionId}` }, { onConflict: "source_key" }); }

export async function POST(req: Request) {
  let body: IntakeBody = {};
  try { body = await req.json(); } catch { body = {}; }
  const name = text(body.name); const line = text(body.line); const phone = text(body.phone); const instagram = text(body.instagram);
  if (!name) return NextResponse.json({ error: "請填寫稱呼。" }, { status: 400 });
  if (!line && !phone && !instagram) return NextResponse.json({ error: "請至少留下 LINE ID、手機或 Instagram 其中一種聯絡方式。" }, { status: 400 });
  if (!body.consent) return NextResponse.json({ error: "請先同意資料使用說明。" }, { status: 400 });
  const birthday = text(body.birthday); const birthTime = text(body.birthTime); const birthPlace = text(body.birthPlace);
  const payload = { display_name: name, line_id: line || null, line_user_id: text(body.lineUserId) || null, phone: phone || null, instagram: instagram || null, birthday: birthday || null, birth_time_note: birthTime || null, birth_place: birthPlace || null, sun_sign: text(body.sunSign) || null, chart_interest: safeChart(text(body.chartInterest)), birth_data_level: text(body.birthDataLevel) || birthLevel(birthday, birthTime, birthPlace), consent_at: new Date().toISOString(), raw_payload: body, goals: list(body.selections, "goal"), body_locations: list(body.selections, "location"), duration: list(body.selections, "duration")[0] ?? null, comfort_score: list(body.selections, "comfort")[0] ? Number(list(body.selections, "comfort")[0]) : null, previous_support: list(body.selections, "history"), trigger_moments: list(body.selections, "triggerMoment"), exercise_frequency: list(body.selections, "exerciseFrequency")[0] ?? null, exercise_types: list(body.selections, "exerciseTypes"), trainer_status: list(body.selections, "trainerStatus")[0] ?? null, safety_flags: list(body.selections, "safetyFlags"), pressure_preferences: list(body.selections, "pressurePreferences"), safety_note: text(body.safetyNote) || null, pressure_note: text(body.pressureNote) || null, state_recent: list(body.selections, "stateRecent")[0] ?? null, state_improve: list(body.selections, "stateImprove")[0] ?? null, state_feeling: list(body.selections, "stateFeeling")[0] ?? null, state_trend: text(body.stateTrend) || null, service_interest: list(body.selections, "service")[0] ?? null, preferred_place: list(body.selections, "place")[0] ?? null, available_times: list(body.selections, "availableTimes"), last_minute_ok: list(body.selections, "lastMinute")[0] ?? null, preferred_time_note: text(body.timeNote || body.time) || null, note: text(body.note) || null, raw_message: text(body.message) || null, source: "public_intake", status: "new", resolution_status: "pending" };
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ ok: true, stored: false, reason: "supabase_not_configured" }, { status: 202 });
  const { data: submission, error } = await supabase.from("intake_submissions").insert(payload).select("id, created_at").single();
  if (error) return NextResponse.json({ ok: true, stored: false, reason: error.message }, { status: 202 });
  let resolution;
  try {
    const candidates = await fetchCandidates(supabase, body);
    resolution = resolveIntakeClient({ name, birthday: birthday || null, lineUserId: text(body.lineUserId) || null, lineId: line || null, phone: phone || null, instagram: instagram || null }, candidates);
    let clientId = resolution.clientId;
    if (resolution.status === "created_new") {
      const created = await supabase.from("clients").insert({ display_name: name, client_name: name, line_id: line || null, line_user_id: text(body.lineUserId) || null, phone: phone || null, instagram: instagram || null, birthday: birthday || null, birth_time_note: birthTime || null, birth_place: birthPlace || null, sun_sign: text(body.sunSign) || null, birth_data_level: payload.birth_data_level, chart_interest: payload.chart_interest, source: "public_intake", current_stage: "lead_intake", first_contact_date: new Date().toISOString().slice(0, 10), last_intake_at: new Date().toISOString(), main_issue: payload.goals.join("、") || null }).select("id").single();
      clientId = created.data?.id;
    } else if (clientId) {
      await supabase.from("clients").update({ last_intake_at: new Date().toISOString() }).eq("id", clientId);
    }
    if (clientId && resolution.status !== "needs_review") {
      await addAlias(supabase, clientId, name); await addIdentifier(supabase, clientId, "line_user_id", text(body.lineUserId)); await addIdentifier(supabase, clientId, "line_id", line); await addIdentifier(supabase, clientId, "phone", phone); await addIdentifier(supabase, clientId, "instagram", instagram); await ensureFollowup(supabase, clientId, submission.id);
    }
    await supabase.from("intake_submissions").update({ client_id: clientId ?? null, resolution_status: resolution.status, resolution_reason: resolution.reason, candidate_client_ids: resolution.candidateClientIds, resolved_at: new Date().toISOString(), resolved_by: "system" }).eq("id", submission.id);
  } catch (e) { await supabase.from("intake_submissions").update({ resolution_status: "failed", resolution_reason: e instanceof Error ? e.message : "unknown_error" }).eq("id", submission.id); }
  return NextResponse.json({ ok: true, stored: true, submission }, { status: 201 });
}
