import { createSign } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  addDays, computeAvailability, localDate, sampleBusy, SERVICES, slotDate,
  type BusyWindow, type ServiceId,
} from "@/lib/availability-preview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" },
  });
}

function parseDates(raw: string | undefined) {
  return new Set((raw ?? "").split(",").map((x) => x.trim()).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)));
}

function parseWeekdays(raw: string | undefined) {
  return new Set((raw ?? "").split(",").map((x) => Number(x.trim())).filter((x) => Number.isInteger(x) && x >= 0 && x <= 6));
}

async function googleToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !privateKey) throw new Error("Google credentials not configured");
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claims = Buffer.from(JSON.stringify({
    iss: email, scope: "https://www.googleapis.com/auth/calendar.readonly",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  })).toString("base64url");
  const signedPart = header + "." + claims;
  const signature = createSign("RSA-SHA256").update(signedPart).sign(privateKey).toString("base64url");
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", cache: "no-store",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedPart + "." + signature,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!tokenResponse.ok) throw new Error("Google token request failed");
  const data = (await tokenResponse.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Google access token unavailable");
  return data.access_token;
}

async function fetchBusy(calendarId: string, startDate: string, days: number): Promise<BusyWindow[]> {
  const accessToken = await googleToken();
  const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(8000),
    headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" },
    body: JSON.stringify({
      timeMin: slotDate(startDate, "00:00").toISOString(),
      timeMax: slotDate(addDays(startDate, days), "00:00").toISOString(),
      timeZone: "Asia/Taipei", items: [{ id: calendarId }],
    }),
  });
  if (!response.ok) throw new Error("Calendar FreeBusy request failed");
  const parsed = (await response.json()) as {
    calendars?: Record<string, { busy?: BusyWindow[]; errors?: unknown[] }>;
  };
  const result = parsed.calendars?.[calendarId];
  if (!result || result.errors?.length || !Array.isArray(result.busy)) {
    throw new Error("Calendar access unavailable");
  }
  return result.busy;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const serviceId = params.get("service") ?? "fascia";
  if (!SERVICES.some((s) => s.id === serviceId)) return json({ error: "不支援的服務項目" }, 400);
  const mode = params.get("mode") === "live" ? "live" : "demo";
  const now = new Date();
  const startDate = params.get("from") || localDate(now);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      startDate < localDate(now) || startDate > addDays(localDate(now), 30)) {
    return json({ error: "日期必須介於今天起 30 天內" }, 400);
  }
  const days = Math.min(30, Math.max(1, Number(params.get("days") || "30") || 30));

  if (mode === "demo") {
    const closed = new Set([addDays(startDate, 3)]);
    const data = computeAvailability({
      mode, serviceId: serviceId as ServiceId, startDate, days, now,
      workWeekdays: new Set([0, 1, 2, 3, 4, 5, 6]),
      closedDates: closed, busy: sampleBusy(startDate),
    });
    return json(data);
  }

  // Fail closed: an empty calendar is not evidence that Gavin works that day.
  if (process.env.BODYFIX_AVAILABILITY_LIVE_ENABLED !== "true") {
    return json({ error: "真實日曆查詢尚未啟用；請先使用示範模式測試介面", status: "NOT_CONFIGURED" }, 503);
  }
  const weekdays = parseWeekdays(process.env.BODYFIX_WORK_WEEKDAYS);
  const openDates = parseDates(process.env.BODYFIX_OPEN_DATES);
  const closedDates = parseDates(process.env.BODYFIX_CLOSED_DATES);
  const calendarId = process.env.GOOGLE_PRIMARY_CALENDAR_ID;
  if (!calendarId || (!weekdays.size && !openDates.size)) {
    return json({ error: "尚未設定可開放的工作日與日曆，不能推測可預約時段", status: "NOT_CONFIGURED" }, 503);
  }

  try {
    const busy = await fetchBusy(calendarId, startDate, days);
    return json(computeAvailability({
      mode, serviceId: serviceId as ServiceId, startDate, days, now,
      workWeekdays: weekdays, openDates, closedDates, busy,
    }));
  } catch (error) {
    // Never expose event names, calendar IDs, credential errors, or secrets.
    console.error("BodyFix availability preview: Google Calendar unavailable", error instanceof Error ? error.message : "unknown");
    return json({ error: "目前無法核對 Google 行事曆，請透過 LINE 人工詢問", status: "UNAVAILABLE" }, 503);
  }
}
