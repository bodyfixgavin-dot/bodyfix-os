import { NextResponse } from "next/server";
import { testCalendarAccess } from "@/lib/bodyfix-ai/google-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ ok: false, error: "Preview only" }, { status: 403 });
  }

  try {
    const status = await testCalendarAccess();
    return NextResponse.json({ ok: true, ...status });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
