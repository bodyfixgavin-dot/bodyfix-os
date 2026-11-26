import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getIntakePlaces } from "@/lib/intake-options";
import { birthProfile, intakeSchema, normalizeIntake, validateIntake, type IntakeRecord, taipeiToday } from "@/lib/intake-v2";
import { serviceQuote } from "@/lib/bodyfix-services";
import { createHash } from "node:crypto";
const json = (body: unknown, status: number) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function saveIntakeV2(input: unknown) {
  if (!input || typeof input !== "object") return json({ error: "無效的問卷資料" }, 400);
  const body = input as Record<string, unknown>;
  if (typeof body.submissionKey !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.submissionKey)) return json({ error: "請重新整理後再送出" }, 400);
  const parsed = intakeSchema.safeParse(body.answers);
  if (!parsed.success) return json({ error: "請檢查欄位內容及長度", fields: parsed.error.flatten().fieldErrors }, 400);
  const answers = normalizeIntake(parsed.data);
  const errors = validateIntake(answers);
  if (Object.keys(errors).length) return json({ error: "請修正標示欄位", fields: errors }, 400);
  const places = await getIntakePlaces();
  const place = places.find(p => p.id === answers.place);
  if (!place) return json({ error: "此地點目前無法選擇，請重新選擇或與 Gavin 討論", fields: { place: "請重新選擇地點" } }, 400);
  const db = createSupabaseAdminClient();
  if (!db) return json({ error: "資料暫時無法儲存，請稍後重試；你的填寫內容仍保留在本頁。", stored: false }, 503);
  const now = new Date();
  const record: IntakeRecord = { version: "2.0", answers, quote: serviceQuote(answers.service, answers.extended), profile: birthProfile(answers.birthday, now), placeName: place.name, createdAt: now.toISOString(), ageAsOf: taipeiToday(now), consentVersion: "intake-2.0-2026-11" };
  // The browser supplies a random retry token. Hashing normalized content binds an immutable
  // receipt to this exact request: retries/races do nothing, edited forms create a new record.
  const hex = createHash("sha256").update(body.submissionKey + JSON.stringify(answers)).digest("hex");
  const id = `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
  try {
    const { error } = await db.from("intake_submissions").upsert({
      id, display_name: answers.name, source: "public_intake_v2", status: "new",
      line_id: answers.contactMethod === "LINE" ? answers.contact : null,
      phone: answers.contactMethod === "電話" ? answers.contact : null,
      birthday: answers.birthday || null, sun_sign: record.profile?.sunSign ?? null,
      // The base schema already has raw_message. Versioned JSON here avoids requiring
      // the older optional CRM migration, while preserving all profile/intake snapshots.
      raw_message: JSON.stringify(record),
      goals: answers.service === "movement" ? answers.trainingGoals : answers.needs,
      body_locations: answers.regions, duration: answers.duration || null,
      service_interest: record.quote.name, preferred_place: place.name,
      preferred_time_note: `${answers.date} ${answers.time}（Asia/Taipei）`, note: answers.notes || null,
    }, { onConflict: "id", ignoreDuplicates: true });
    if (error) { console.error(`intake_storage_unavailable:${error.code || "transport"}:${/fetch failed/i.test(error.message || "") ? "fetch_failed" : /invalid api key/i.test(error.message || "") ? "invalid_key" : /could not find.*table/i.test(error.message || "") ? "missing_table" : /could not find.*column/i.test(error.message || "") ? "missing_column" : "database_error"}`); return json({ error: "儲存未成功，請重試。填寫內容仍保留在本頁。", stored: false }, 503); }
    return json({ ok: true, stored: true, reference: id }, 201);
  } catch { return json({ error: "連線暫時中斷，請重試。填寫內容仍保留在本頁。", stored: false }, 503); }
}
