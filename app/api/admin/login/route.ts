import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionMaxAge,
  hasAdminPassword,
  hasAdminSessionSecret,
  isAdminBypassAllowed
} from "@/lib/admin-session";

function setAdminCookie(res: NextResponse) {
  res.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: createAdminSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getAdminSessionMaxAge()
  });
}

export async function POST(req: Request) {
  const { password, bypass } = await req.json();

  if (bypass === true) {
    if (!isAdminBypassAllowed()) {
      return NextResponse.json({ error: "Admin bypass is not allowed" }, { status: 403 });
    }

    if (!hasAdminSessionSecret()) {
      return NextResponse.json({ error: "Admin session secret is not configured" }, { status: 500 });
    }

    const res = NextResponse.json({ ok: true, bypass: true });
    setAdminCookie(res);
    return res;
  }

  if (!hasAdminPassword()) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not configured" }, { status: 500 });
  }

  if (!hasAdminSessionSecret()) {
    return NextResponse.json({ error: "Admin session secret is not configured" }, { status: 500 });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  setAdminCookie(res);

  return res;
}
