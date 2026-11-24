import { createSign } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { classifyCalendarEvents, type CalendarEntry } from "@/lib/availability-calendar-events";
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
  return new Set((raw ?? "").split(",").map((x) => x.trim()).filter(Boolean).map(Number).filter((x) => Number.isInteger(x) && x >= 0 && x <= 6));
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

async function fetchBusy(accessToken: string, calendarId: string, startDate: string, days: number): Promise<BusyWindow[]> {
  const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(8000),
    headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" },
    body: JSON.stringify({
      timeMin: slotDate(startDate, "00:00").toISOString(),
      timeMax: slotDate(addDays(startDate, days), "00:00").toISOString(),
      timeZone: "Asia/Taipei", items: [{ id: calendarId }],
    }),
  });
  if (!response.ok) {
    let reason = "unknown";
    try {
      const details = (await response.json()) as {
        error?: { status?: string; errors?: Array<{ reason?: string }> };
      };
      reason = (details.error?.errors?.[0]?.reason || details.error?.status || "unknown")
        .replace(/[^a-zA-Z_-]/g, "").slice(0, 48);
    } catch {
      // Google might return HTML during an outage. Never log response bodies.
    }
    throw new Error("Calendar FreeBusy request failed (HTTP " + response.status + ", " + reason + ")");
  }
  const parsed = (await response.json()) as {
    calendars?: Record<string, { busy?: BusyWindow[]; errors?: unknown[] }>;
  };
  const result = parsed.calendars?.[calendarId];
  if (!result || result.errors?.length || !Array.isArray(result.busy)) {
    const errorReasons = result?.errors?.map((e) => String((e as { reason?: string }).reason ?? "unknown"))
      .join(",")?.replace(/[^a-zA-Z,\-_]/g, "").slice(0, 70) || "unknown";
    throw new Error("Calendar access unavailable (per-calendar reason: " + errorReasons + ")");
  }
  return result.busy;
}


/**
 * Event-title access is intentionally opt-in. The previously granted
 * free/busy-only sharing permission must never be silently expanded.
 */
async function fetchEventDetails(
  accessToken: string, calendarId: string, startDate: string, days: number
): Promise<CalendarEntry[]> {
  const result: CalendarEntry[] = [];
  let pageToken = "";
  for (let page = 0; page < 8; page++) {
    const params = new URLSearchParams({
      timeMin: slotDate(startDate, "00:00").toISOString(),
      timeMax: slotDate(addDays(startDate, days), "00:00").toISOString(),
      singleEvents: "true", orderBy: "startTime", maxResults: "250",
      fields: "nextPageToken,items(summary,status,transparency,eventType,start,end,recurringEventId)",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/" +
      encodeURIComponent(calendarId) + "/events?" + params.toString(),
      { headers: { Authorization: "Bearer " + accessToken }, cache: "no-store",
        signal: AbortSignal.timeout(8000) }
    );
    if (!response.ok) throw new Error("Calendar event metadata permission missing (HTTP " + response.status + ")");
    const parsed = (await response.json()) as { items?: CalendarEntry[]; nextPageToken?: string };
    result.push(...(parsed.items ?? []));
    pageToken = parsed.nextPageToken ?? "";
    if (!pageToken) return result;
  }
  // Don't publish incomplete availability when paging is truncated.
  throw new Error("Calendar event scan exceeded safe pagination limit");
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

  // Fail closed only for missing Google authorization; daily booking is the default once event coverage is verified.
  if (process.env.BODYFIX_AVAILABILITY_LIVE_ENABLED !== "true") {
    return json({ error: "真實日曆查詢尚未啟用；請先使用示範模式測試介面", status: "NOT_CONFIGURED" }, 503);
  }
  const weekdays = parseWeekdays(process.env.BODYFIX_WORK_WEEKDAYS);
  const openDates = parseDates(process.env.BODYFIX_OPEN_DATES);
  const closedDates = parseDates(process.env.BODYFIX_CLOSED_DATES);
  const closedWeekdays = parseWeekdays(process.env.BODYFIX_CLOSED_WEEKDAYS);
  const detailEnabled = process.env.BODYFIX_CALENDAR_DETAILS_ENABLED === "true";
  const calendarId = process.env.GOOGLE_PRIMARY_CALENDAR_ID;
  if (!calendarId) {
    return json({ error: "尚未指定讀取的 Google 行事曆", status: "NOT_CONFIGURED" }, 503);
  }

  // FreeBusy is the baseline. Event metadata is a separate opt-in,
  // never inferred from the existing free/busy-only calendar share.
  try {
    const accessToken = await googleToken();
    const busy = await fetchBusy(accessToken, calendarId, startDate, days);
    const details = detailEnabled
      ? classifyCalendarEvents(await fetchEventDetails(accessToken, calendarId, startDate, days))
      : { extraBusy: [] as BusyWindow[], closedDates: new Set<string>(),
          workWindowsByDate: {} as Record<string, { start: string; end: string }[]> };
    for (let i = 0; i < days; i++) {
      const date = addDays(startDate, i);
      if (closedWeekdays.has(slotDate(date, "12:00").getUTCDay())) closedDates.add(date);
    }
    for (const date of details.closedDates) closedDates.add(date);
    // Gavin accepts appointments every day by default. Calendar commitments
    // are subtracted; no extra workday schedule should be maintained.
    //
    // The current share exposes FreeBusy only, hiding "transparent" entries.
    // Keep the customer-facing slots disabled until detailed event coverage is
    // approved, or Gavin deliberately confirms ALL real events are marked busy.
    const calendarCoverageVerified = detailEnabled ||
      process.env.BODYFIX_FREEBUSY_ONLY_POLICY_CONFIRMED === "true";
    const scheduleConfigured = calendarCoverageVerified;
    return json({
      ...computeAvailability({
        mode, serviceId: serviceId as ServiceId, startDate, days, now,
        defaultOpen: calendarCoverageVerified,
        workWeekdays: weekdays,
        openDates,
        closedDates, workWindowsByDate: details.workWindowsByDate,
        busy: [...busy, ...details.extraBusy],
      }),
      calendarConnected: true,
      scheduleConfigured,
      connectionNote: calendarCoverageVerified
        ? "每天預設可洽詢；已扣除行事曆安排與休息日，實際預約仍須確認"
        : "Google 行事曆已連線；部分標記為有空的活動無法讀取，暫不顯示可能錯誤的可約時段",
    });
  } catch (error) {
    // Never expose event names, calendar IDs, credential errors, or secrets.
    const serviceProject = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.split("@")[1] ?? "")
      .replace(".iam.gserviceaccount.com", "").replace(/[^a-z0-9-]/g, "").slice(0, 48) || "unknown";
    console.error("BodyFix calendar FreeBusy diagnostic", {
      project: serviceProject,
      reason: error instanceof Error ? error.message : "unknown",
    });
    return json({ error: "目前無法核對 Google 行事曆，請透過 LINE 人工詢問", status: "UNAVAILABLE" }, 503);
  }
}
