import { createSign } from "crypto";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const TIME_ZONE = "Asia/Taipei";

let cachedToken: { token: string; expiresAt: number } | null = null;

type CalendarEvent = {
  id?: string;
  summary?: string;
  status?: string;
  transparency?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

type BusyPeriod = { start: number; end: number };

export type BodyFixSlot = {
  start: string;
  end: string;
  label: string;
  dateLabel: string;
  location: string;
};

function getCredentials() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !privateKey) {
    throw new Error("Google service account environment is not configured");
  }
  return { email, privateKey };
}

export function getGoogleCalendarConfig() {
  return {
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
    primaryCalendarId: process.env.GOOGLE_PRIMARY_CALENDAR_ID || "",
    bookingCalendarId: process.env.GOOGLE_BOOKING_CALENDAR_ID || ""
  };
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;

  const { email, privateKey } = getCredentials();
  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt(
    { alg: "RS256", typ: "JWT" },
    {
      iss: email,
      scope: CALENDAR_SCOPE,
      aud: TOKEN_URL,
      exp: now + 3600,
      iat: now
    },
    privateKey
  );

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    }),
    cache: "no-store"
  });

  if (!res.ok) throw new Error("Google token request failed: " + res.status + " " + (await res.text()));
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function googleFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  const res = await fetch(CALENDAR_API + path, {
    ...init,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      ...(init.headers || {})
    },
    cache: "no-store"
  });
  return res;
}

export async function testCalendarAccess() {
  const config = getGoogleCalendarConfig();
  const result: Record<string, unknown> = {
    serviceAccountEmail: config.serviceAccountEmail,
    primaryCalendarConfigured: Boolean(config.primaryCalendarId),
    bookingCalendarConfigured: Boolean(config.bookingCalendarId)
  };

  if (config.primaryCalendarId) {
    const now = new Date();
    const later = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const res = await googleFetch("/freeBusy", {
      method: "POST",
      body: JSON.stringify({
        timeMin: now.toISOString(),
        timeMax: later.toISOString(),
        timeZone: TIME_ZONE,
        items: [{ id: config.primaryCalendarId }]
      })
    });
    result.primaryCalendarStatus = res.status;
    if (!res.ok) result.primaryCalendarError = await res.text();
  }

  if (config.bookingCalendarId) {
    const qs = new URLSearchParams({
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "5"
    });
    const res = await googleFetch(
      "/calendars/" + encodeURIComponent(config.bookingCalendarId) + "/events?" + qs.toString()
    );
    result.bookingCalendarStatus = res.status;
    if (!res.ok) result.bookingCalendarError = await res.text();
  }

  return result;
}

function parseTimedEvent(event: CalendarEvent) {
  const start = event.start?.dateTime ? Date.parse(event.start.dateTime) : NaN;
  const end = event.end?.dateTime ? Date.parse(event.end.dateTime) : NaN;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return { start, end };
}

function isAvailabilityEvent(event: CalendarEvent) {
  return (event.summary || "").trim().startsWith("可預約");
}

function getLocation(event: CalendarEvent) {
  const parts = (event.summary || "").split("｜");
  return parts[1]?.trim() || "六張犁";
}

function overlaps(start: number, end: number, busy: BusyPeriod[]) {
  return busy.some((item) => start < item.end && end > item.start);
}

function taipeiDayKey(timestamp: number) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(timestamp));
}

function dateLabel(timestamp: number) {
  const date = new Date(timestamp);
  const md = new Intl.DateTimeFormat("zh-TW", {
    timeZone: TIME_ZONE,
    month: "numeric",
    day: "numeric"
  }).format(date);
  const weekday = new Intl.DateTimeFormat("zh-TW", {
    timeZone: TIME_ZONE,
    weekday: "short"
  }).format(date);
  return md + "（" + weekday + "）";
}

function timeLabel(timestamp: number) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(timestamp));
}

async function listBookingEvents(timeMin: string, timeMax: string) {
  const { bookingCalendarId } = getGoogleCalendarConfig();
  if (!bookingCalendarId) throw new Error("GOOGLE_BOOKING_CALENDAR_ID is not configured");

  const qs = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "2500"
  });

  const res = await googleFetch(
    "/calendars/" + encodeURIComponent(bookingCalendarId) + "/events?" + qs.toString()
  );
  if (!res.ok) throw new Error("Google booking calendar read failed: " + res.status + " " + (await res.text()));
  const data = (await res.json()) as { items?: CalendarEvent[] };
  return (data.items || []).filter((event) => event.status !== "cancelled");
}

async function getPrimaryBusy(timeMin: string, timeMax: string) {
  const { primaryCalendarId } = getGoogleCalendarConfig();
  if (!primaryCalendarId) throw new Error("GOOGLE_PRIMARY_CALENDAR_ID is not configured");

  const res = await googleFetch("/freeBusy", {
    method: "POST",
    body: JSON.stringify({
      timeMin,
      timeMax,
      timeZone: TIME_ZONE,
      items: [{ id: primaryCalendarId }]
    })
  });

  if (!res.ok) throw new Error("Google primary calendar freeBusy failed: " + res.status + " " + (await res.text()));
  const data = (await res.json()) as {
    calendars?: Record<string, { busy?: Array<{ start: string; end: string }> }>;
  };

  return (data.calendars?.[primaryCalendarId]?.busy || [])
    .map((item) => ({ start: Date.parse(item.start), end: Date.parse(item.end) }))
    .filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end));
}

function spreadSlots<T>(items: T[], max: number) {
  if (items.length <= max) return items;
  const result: T[] = [];
  for (let i = 0; i < max; i++) {
    const index = Math.round((i * (items.length - 1)) / (max - 1));
    result.push(items[index]);
  }
  return result;
}

export async function getBodyFixAvailability(options?: {
  days?: number;
  requiredMinutes?: number;
  stepMinutes?: number;
  maxSlotsPerDay?: number;
}) {
  const days = options?.days ?? 7;
  const requiredMinutes = options?.requiredMinutes ?? 120;
  const stepMinutes = options?.stepMinutes ?? 30;
  const maxSlotsPerDay = options?.maxSlotsPerDay ?? 5;

  const now = Date.now();
  const timeMin = new Date(now).toISOString();
  const timeMax = new Date(now + days * 24 * 60 * 60 * 1000).toISOString();

  const [events, primaryBusy] = await Promise.all([
    listBookingEvents(timeMin, timeMax),
    getPrimaryBusy(timeMin, timeMax)
  ]);

  const availabilityWindows = events
    .filter(isAvailabilityEvent)
    .map((event) => {
      const parsed = parseTimedEvent(event);
      return parsed ? { ...parsed, location: getLocation(event) } : null;
    })
    .filter(Boolean) as Array<BusyPeriod & { location: string }>;

  const bookingBusy = events
    .filter((event) => !isAvailabilityEvent(event) && event.transparency !== "transparent")
    .map(parseTimedEvent)
    .filter(Boolean) as BusyPeriod[];

  const allBusy = [...primaryBusy, ...bookingBusy];
  const requiredMs = requiredMinutes * 60 * 1000;
  const stepMs = stepMinutes * 60 * 1000;
  const grouped = new Map<string, BodyFixSlot[]>();

  for (const window of availabilityWindows) {
    let start = Math.max(window.start, now);
    const remainder = start % stepMs;
    if (remainder) start += stepMs - remainder;

    for (; start + requiredMs <= window.end; start += stepMs) {
      const end = start + requiredMs;
      if (overlaps(start, end, allBusy)) continue;

      const key = taipeiDayKey(start);
      const slot: BodyFixSlot = {
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        label: timeLabel(start),
        dateLabel: dateLabel(start),
        location: window.location
      };

      const list = grouped.get(key) || [];
      if (!list.some((item) => item.start === slot.start)) {
        list.push(slot);
        grouped.set(key, list);
      }
    }
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, slots]) => ({
      date,
      label: slots[0]?.dateLabel || date,
      slots: spreadSlots(slots, maxSlotsPerDay)
    }));
}

function signJwt(header: Record<string, unknown>, payload: Record<string, unknown>, privateKey: string) {
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signingInput = encodedHeader + "." + encodedPayload;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  return signingInput + "." + base64Url(signer.sign(privateKey));
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
