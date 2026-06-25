import { NextResponse } from "next/server";
import { createSupabaseUserServerClient } from "@/lib/supabase/server";

function getSafeNextPath(value: string | null): string {
  if (!value) return "/client";
  if (!value.startsWith("/")) return "/client";
  if (value.startsWith("//")) return "/client";
  if (value.startsWith("/\\")) return "/client";
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = getSafeNextPath(url.searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseUserServerClient();
    await supabase?.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
