import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isAdminBypassAllowed, verifyAdminSessionToken } from "@/lib/admin-session";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return NextResponse.json({ authenticated: verifyAdminSessionToken(token), bypassMode: isAdminBypassAllowed() });
}
