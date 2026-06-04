import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";
import { createSupabaseAdminClient, getSupabaseAdminEnvStatus } from "@/lib/supabase/server";

export async function requireBookingAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!verifyAdminSessionToken(token)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  const envStatus = getSupabaseAdminEnvStatus();
  const supabase = envStatus.ok ? createSupabaseAdminClient() : null;
  if (!supabase) {
    const payload = {
      error: envStatus.errors[0] ?? "Supabase admin environment is not configured",
      errorType: envStatus.missingEnv.length ? "missing env" : "invalid url",
      envErrors: envStatus.errors,
      missingEnv: envStatus.missingEnv,
      requiredEnv: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
      supportedPublicKeys: ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    };
    console.error("Booking admin Supabase config unavailable", payload);

    return {
      ok: false as const,
      response: NextResponse.json(payload, { status: 500 })
    };
  }

  return { ok: true as const, supabase };
}
