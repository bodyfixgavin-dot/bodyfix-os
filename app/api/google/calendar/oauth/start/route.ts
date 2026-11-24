import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { previewOAuthRedirectUri } from "@/lib/availability-oauth-preview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  let REDIRECT_URI: string;
  try {
    REDIRECT_URI = previewOAuthRedirectUri();
  } catch {
    return NextResponse.json({ ok: false, error: "Preview callback unavailable" }, { status: 503 });
  }
  // This only exposes the callback URL (not OAuth credentials).
  // Owner registers this exact URI in Google Cloud before starting OAuth.
  if (new URL(req.url).searchParams.get("check") === "1") {
    return NextResponse.json({
      ok: true, redirectUri: REDIRECT_URI,
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      credentialConfigured: Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID &&
        process.env.GOOGLE_OAUTH_CLIENT_SECRET),
    }, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  }
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
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    access_type: "offline",
    prompt: "consent",
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
