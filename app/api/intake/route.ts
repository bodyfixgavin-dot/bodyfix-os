import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type IntakeBody = {
  name?: string;
  line?: string;
  phone?: string;
  birthday?: string;
  birthTime?: string;
  birthPlace?: string;
  time?: string;
  note?: string;
  selections?: Record<string, string[]>;
  sunSign?: string;
  ziweiStatus?: string;
  stateTrend?: string;
  message?: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function list(input: Record<string, string[]> | undefined, key: string) {
  const value = input?.[key];
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()) : [];
}

export async function POST(req: Request) {
  let body: IntakeBody = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const name = text(body.name);
  if (!name) return NextResponse.json({ error: "請填寫稱呼。" }, { status: 400 });

  const payload = {
    display_name: name,
    line_id: text(body.line) || null,
    phone: text(body.phone) || null,
    birthday: text(body.birthday) || null,
    birth_time_note: text(body.birthTime) || null,
    birth_place: text(body.birthPlace) || null,
    sun_sign: text(body.sunSign) || null,
    extended_profile_status: text(body.ziweiStatus) || null,
    goals: list(body.selections, "goal"),
    body_locations: list(body.selections, "location"),
    duration: list(body.selections, "duration")[0] ?? null,
    comfort_score: list(body.selections, "comfort")[0] ? Number(list(body.selections, "comfort")[0]) : null,
    previous_support: list(body.selections, "history"),
    state_recent: list(body.selections, "stateRecent")[0] ?? null,
    state_improve: list(body.selections, "stateImprove")[0] ?? null,
    state_feeling: list(body.selections, "stateFeeling")[0] ?? null,
    state_trend: text(body.stateTrend) || null,
    service_interest: list(body.selections, "service")[0] ?? null,
    preferred_place: list(body.selections, "place")[0] ?? null,
    preferred_time_note: text(body.time) || null,
    note: text(body.note) || null,
    raw_message: text(body.message) || null,
    source: "public_intake",
    status: "new",
  };

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, stored: false, reason: "supabase_not_configured" }, { status: 202 });
  }

  const { data, error } = await supabase.from("intake_submissions").insert(payload).select("id, created_at").single();
  if (error) {
    return NextResponse.json({ ok: true, stored: false, reason: error.message }, { status: 202 });
  }

  return NextResponse.json({ ok: true, stored: true, submission: data }, { status: 201 });
}
