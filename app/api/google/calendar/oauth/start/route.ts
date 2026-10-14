import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REDIRECT_URI = "https://bodyfix-os.vercel.app/api/google/calendar/oauth/callback";

export async function GET() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { ok: false, error: "GOOGLE_OAUTH_CLIENT_ID is not configured" },
      { status: 503 }
    );
  }

  const state = randomBytes(24).toString("hex");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state
  });

  const response = NextResponse.redirect(
    "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString()
  );

  response.cookies.set("bodyfix_google_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/"
  });

  return response;
}
