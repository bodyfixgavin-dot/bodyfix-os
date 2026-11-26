import { describe, expect, it } from "vitest";
import { POST as login } from "../app/api/admin/login/route";
import { POST as logout } from "../app/api/admin/logout/route";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "./admin-session";

function loginRequest(payload: object) {
  return new Request("http://localhost/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function cookieToken(response: Response) {
  const cookie = response.headers.get("set-cookie") ?? "";
  return cookie.match(new RegExp(`${ADMIN_SESSION_COOKIE}=([^;]+)`))?.[1];
}

async function withEnv(values: Record<string, string | undefined>, run: () => Promise<void>) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  });
  try {
    await run();
  } finally {
    Object.entries(previous).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
}

describe("admin authentication", () => {
  it("allows an explicitly configured local development bypass", async () => {
    await withEnv({ ALLOW_ADMIN_BYPASS: "true", VERCEL_ENV: undefined, NODE_ENV: "development", ADMIN_SESSION_SECRET: "preview-test-secret" }, async () => {
      const response = await login(loginRequest({ bypass: true }));
      expect(response.status).toBe(200);
      expect(verifyAdminSessionToken(cookieToken(response))).toBe(true);
    });
  });

  it("fails closed when bypass is requested in any deployed environment", async () => {
    await withEnv({ ALLOW_ADMIN_BYPASS: "true", VERCEL_ENV: "preview" }, async () => {
      expect((await login(loginRequest({ bypass: true }))).status).toBe(403);
    });
    await withEnv({ ALLOW_ADMIN_BYPASS: "true", VERCEL_ENV: "production" }, async () => {
      expect((await login(loginRequest({ bypass: true }))).status).toBe(403);
    });
  });

  it("accepts the production password and rejects a wrong password", async () => {
    await withEnv({ ALLOW_ADMIN_BYPASS: "false", VERCEL_ENV: "production", ADMIN_PASSWORD: "correct-password", ADMIN_SESSION_SECRET: "production-test-secret" }, async () => {
      const accepted = await login(loginRequest({ password: "correct-password" }));
      expect(accepted.status).toBe(200);
      expect(verifyAdminSessionToken(cookieToken(accepted))).toBe(true);
      expect((await login(loginRequest({ password: "wrong-password" }))).status).toBe(401);
    });
  });

  it("clears the shared admin session cookie on logout", async () => {
    const response = await logout();
    expect(response.status).toBe(200);
    expect((response.headers.get("set-cookie") ?? "").includes(`${ADMIN_SESSION_COOKIE}=`)).toBe(true);
    expect((response.headers.get("set-cookie") ?? "").includes("Max-Age=0")).toBe(true);
  });
});
