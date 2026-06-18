import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function getSupabaseUrlHost() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) return null;
  try { return new URL(supabaseUrl).host; } catch { return null; }
}

export function isDebug(request: NextRequest) {
  return request.nextUrl.searchParams.get("debug") === "1";
}

export function missingSupabaseEnvResponse() {
  return NextResponse.json({ ok: false, error: "Missing Supabase env", supabaseUrlHost: null }, { status: 500 });
}

export function getPulseSupabaseClient() {
  return createSupabaseServerClient();
}

export function jsonError(error: unknown, status = 500, extra: Record<string, unknown> = {}) {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown Supabase error";
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}
