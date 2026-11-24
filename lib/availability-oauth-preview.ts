/**
 * Preview-only OAuth redirect. Never trust the request Host header.
 * VERCEL_BRANCH_URL is a stable alias when Vercel provides it.
 */
export function previewOAuthRedirectUri(): string {
  const raw = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL || "";
  const host = raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!/^[a-z0-9][a-z0-9.-]*\.vercel\.app$/i.test(host)) {
    throw new Error("Preview Google OAuth callback URL unavailable");
  }
  return "https://" + host + "/api/google/calendar/oauth/callback";
}
