import { NextResponse } from "next/server";
import { cleanPayload, FOLLOWUP_FIELDS, makeClientCode, readJson, requireClinicAdmin } from "@/lib/clinic-api";

const CALENDAR_BACKFILL_SOURCE = "google_calendar_backfill";
const BACKFILL_NOTE_MARKER = "來源：Google Calendar 回填";

const statusToStage: Record<string, string> = {
  熟客: "repeat",
  觀察: "followup",
  新客: "first_done",
  流失: "lost",
  未判斷: "followup"
};

const contactFieldByMethod: Record<string, "line_id" | "instagram" | "phone" | null> = {
  LINE: "line_id",
  IG: "instagram",
  電話: "phone",
  其他: null,
  未知: null
};

const followupTypeByDelay: Record<string, string> = {
  "3d": "day3",
  "7d": "day7",
  "14d": "day14",
  custom: "other"
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function buildFollowupDate(delay: unknown, customDate: unknown) {
  if (delay === "custom" && typeof customDate === "string" && customDate) return customDate;
  if (delay === "3d") return addDays(new Date(), 3);
  if (delay === "7d") return addDays(new Date(), 7);
  if (delay === "14d") return addDays(new Date(), 14);
  return null;
}

function buildRecordNote(body: Record<string, unknown>) {
  const recordNote = typeof body.record_note === "string" && body.record_note.trim()
    ? body.record_note.trim()
    : "行事曆回填，詳細內容未補。";
  const paymentLine = `付款狀態：${body.payment_status ?? "不確定"}${body.amount ? `｜金額：${body.amount}` : ""}`;
  const locationLine = `服務地點：${body.location ?? "未知"}`;
  return [BACKFILL_NOTE_MARKER, paymentLine, locationLine, recordNote].join("\n");
}

export async function GET() {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("service_records")
    .select("id, service_date, service_code, service_name_snapshot, body_region, price_twd, internal_notes, followup_needed, clients(client_code, display_name, client_name)")
    .ilike("internal_notes", `%${BACKFILL_NOTE_MARKER}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ records: data ?? [] });
}

export async function POST(req: Request) {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;

  const body = await readJson(req) as Record<string, unknown>;
  const clientName = String(body.client_name ?? "").trim();
  const existingClientId = String(body.existing_client_id ?? "").trim();

  if (!existingClientId && !clientName) {
    return NextResponse.json({ error: "client_name is required" }, { status: 400 });
  }

  let duplicateCandidates: unknown[] = [];
  if (!existingClientId && clientName) {
    const { data } = await auth.supabase
      .from("clients")
      .select("id, client_code, display_name, nickname, client_name")
      .or(`display_name.eq.${clientName},nickname.eq.${clientName},client_name.eq.${clientName}`)
      .limit(5);
    duplicateCandidates = data ?? [];
  }

  let clientId = existingClientId;
  let client = null;

  if (!clientId) {
    const contactMethod = String(body.contact_method ?? "未知");
    const contactValue = typeof body.contact_value === "string" ? body.contact_value.trim() : "";
    const contactField = contactFieldByMethod[contactMethod] ?? null;
    const note = typeof body.note === "string" ? body.note.trim() : "";
    const preferredLocation = String(body.preferred_location ?? "未知");
    const clientStatus = String(body.client_status ?? "未判斷");
    const clientPayload: Record<string, unknown> = {
      client_code: makeClientCode(),
      client_name: clientName,
      display_name: clientName,
      nickname: clientName,
      source: CALENDAR_BACKFILL_SOURCE,
      city: preferredLocation,
      home_city: preferredLocation,
      preferred_city: preferredLocation,
      service_mode_preference: preferredLocation,
      current_stage: statusToStage[clientStatus] ?? "followup",
      priority: clientStatus === "熟客" ? "P1" : clientStatus === "觀察" ? "P2" : "P3",
      first_contact_date: body.service_date || new Date().toISOString().slice(0, 10),
      first_pain_point: body.service_type || "行事曆回填",
      last_session_date: body.service_date || null,
      internal_notes: [
        BACKFILL_NOTE_MARKER,
        `回填客戶狀態：${clientStatus}`,
        `常見地點：${preferredLocation}`,
        contactMethod !== "未知" ? `聯絡方式：${contactMethod}${contactValue ? `｜${contactValue}` : ""}` : null,
        note || null
      ].filter(Boolean).join("\n"),
      updated_at: new Date().toISOString()
    };
    if (contactField && contactValue) clientPayload[contactField] = contactValue;
    if (!contactPayloadHasLineId(clientPayload)) clientPayload.line_id = `clinic-${clientPayload.client_code}`;

    const { data, error } = await auth.supabase.from("clients").insert(clientPayload).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    client = data;
    clientId = data.id;
  }

  const serviceType = String(body.service_type ?? "其他");
  const serviceName = String(body.service_name || serviceType);
  const paymentStatus = String(body.payment_status ?? "不確定");
  const amount = body.amount ? Number(body.amount) : null;
  const recordPayload = {
    client_id: clientId,
    service_date: body.service_date || new Date().toISOString().slice(0, 10),
    record_mode: "quick",
    service_code: serviceType,
    service_name_snapshot: serviceName,
    duration_minutes: body.duration_min ? Number(body.duration_min) : null,
    price_twd: amount,
    main_complaint: "Google Calendar 回填",
    processed_area: serviceType,
    body_region: String(body.location ?? "未知"),
    followup_needed: body.followup_delay !== "none",
    internal_notes: buildRecordNote(body)
  };

  const { data: serviceRecord, error: recordError } = await auth.supabase
    .from("service_records")
    .insert(recordPayload)
    .select("*")
    .single();
  if (recordError) return NextResponse.json({ error: recordError.message }, { status: 400 });

  await auth.supabase
    .from("clients")
    .update({ last_session_date: recordPayload.service_date, updated_at: new Date().toISOString() })
    .eq("id", clientId);

  let followup = null;
  const followupDate = buildFollowupDate(body.followup_delay, body.custom_followup_date);
  if (followupDate) {
    const followupPayload = cleanPayload({
      client_id: clientId,
      service_record_id: serviceRecord.id,
      followup_type: followupTypeByDelay[String(body.followup_delay)] ?? "other",
      scheduled_date: followupDate,
      message_summary: body.followup_action || "行事曆回填追蹤",
      next_action: body.followup_action || "確認是否需要下一次服務",
      response_status: "not_sent",
      is_done: false
    }, FOLLOWUP_FIELDS);
    const { data, error } = await auth.supabase.from("followups").insert(followupPayload).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    followup = data;
  }

  return NextResponse.json({
    client,
    client_id: clientId,
    service_record: serviceRecord,
    followup,
    duplicate_candidates: duplicateCandidates,
    ledger_entry_reserved: ["已收", "未收", "套票扣除"].includes(paymentStatus)
  }, { status: 201 });
}

function contactPayloadHasLineId(payload: Record<string, unknown>) {
  return typeof payload.line_id === "string" && payload.line_id.trim().length > 0;
}
