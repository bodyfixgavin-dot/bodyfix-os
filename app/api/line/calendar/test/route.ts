import { NextResponse } from "next/server";
import { getBodyFixAvailability, googleCalendarConfigured } from "@/lib/bodyfix-ai/google-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!googleCalendarConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        missing:
          "請先設定 GOOGLE_SERVICE_ACCOUNT_JSON、GOOGLE_PRIMARY_CALENDAR_ID、GOOGLE_BOOKING_CALENDAR_ID"
      },
      { status: 503 }
    );
  }

  try {
    const days = await getBodyFixAvailability({
      days: 7,
      requiredMinutes: 120,
      stepMinutes: 30,
      maxSlotsPerDay: 5
    });

    return NextResponse.json({
      ok: true,
      configured: true,
      timezone: "Asia/Taipei",
      rule: "60 分服務先要求連續 120 分鐘空間",
      days
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
