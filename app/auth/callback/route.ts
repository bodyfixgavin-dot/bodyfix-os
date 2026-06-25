import { NextResponse } from "next/server";
import { createSupabaseUserServerClient } from "@/lib/supabase/server";

function getSafeNextPath(value: string | null): string {
  if (!value) return "/client";
  if (!value.startsWith("/")) return "/client";
  if (value.startsWith("//")) return "/client";
  if (value.startsWith("/\\")) return "/client";
  return value;
}

function redirectToLoginError(origin: string) {
  return NextResponse.redirect(new URL("/client/login?error=oauth_callback_failed", origin));
}

function logOAuthCallbackError(reason: string, error?: { name?: string; message?: string; status?: number; code?: string }) {
  console.error("OAuth callback failed", {
    reason,
    error: error
      ? {
          name: error.name,
          message: error.message,
          status: error.status,
          code: error.code
        }
      : undefined
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = getSafeNextPath(url.searchParams.get("next"));
  const supabase = await createSupabaseUserServerClient();

  if (!supabase) {
    logOAuthCallbackError("missing_supabase_client");
    return redirectToLoginError(url.origin);
  }

  if (!code) {
    logOAuthCallbackError("missing_code");
    return redirectToLoginError(url.origin);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logOAuthCallbackError("exchange_code_for_session_failed", error);
    return redirectToLoginError(url.origin);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
