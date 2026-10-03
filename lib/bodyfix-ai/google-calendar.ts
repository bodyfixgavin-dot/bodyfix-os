import { JWT } from "google-auth-library";

const TIME_ZONE = "Asia/Taipei";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const DEFAULT_REQUIRED_MINUTES = 120;
const DEFAULT_STEP_MINUTES = 30;
const DEFAULT_MAX_SLOTS_PER_DAY = 5;

type ServiceAccountJson = {
  client_email: string;
  private_key: string;
};

type CalendarEvent = {
  id?: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  status?: string;
};

type BusyPeriod = { start: number; end: number };

export type BodyFixSlot = {
  start: string;
  end: string;
  label: string;
  dateLabel: string;
  location: string;
};

function getConfig() {
  const rawCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const primaryCalendarId = process.env.GOOGLE_PRIMARY_CALENDAR_ID;
  const bookingCalendarId = process.env.GOOGLE_BOOKING_CALENDAR_ID;

  const missing = [
    !rawCredentials && "GOOGLE_SERVICE_ACCOUNT_JSON",
    !primaryCalendarId && "GOOGLE_PRIMARY_CALENDAR_ID",
    !bookingCalendarId && "GOOGLE_BOOKING_CALENDAR_ID"
  ].filter(Boolean);

  if (missing.length) {
    throw new Error("Google Calendar 尚未完成設定：" + missing.join(", "));
  }

  let credentials: ServiceAccountJson;
  try {
    credentials = JSON.parse(rawCredentials as string) as ServiceAccountJson;
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON 不是有效 JSON");
  }

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error("Google Service Account JSON 缺少 client_email/private_key");
  }

  return {
    credentials,
    primaryCalendarId: primaryCalendarId as string,
    bookingCalendarId: bookingCalendarId as string
  };
}

async function getAccessToken() {
  const { credentials } = getConfig();
  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar"]
  });
  const result = await auth.getAccessToken();
  if (!result.token) throw new Error("無法取得 Google Calendar access token");
  return result.token;
}

async function googleFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  const res = await fetch(GOOGLE_CALENDAR_API + path, {
    ...init,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      ...(init.headers || {})
    },
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("Google Calendar API " + res.status + ": " + (await res.text()));
  }

  return res;
}

function isAvailabilityEvent(event: CalendarEvent) {
  return (event.summary || "").trim().startsWith("可預約");
}

function getLocation(event: CalendarEvent) {
  const title = (event.summary || "").trim();
  const parts = title.split("｜");
  return parts[1]?.trim() || "六張犁";
}

function parseTimedEvent(event: CalendarEvent) {
  const start = event.start?.dateTime ? Date.parse(event.start.dateTime) : NaN;
  const end = event.end?.dateTime ? Date.parse(event.end.dateTime) : NaN;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return { start, end };
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

function spreadSlots<T>(items: T[], max: number) {
  if (items.length <= max) return items;
  const result: T[] = [];
  for (let i = 0; i < max; i++) {
    const index = Math.round((i * (items.length - 1)) / (max - 1));
    result.push(items[index]);
  }
  return result;
}

async function listBookingEvents(timeMin: string, timeMax: string) {
  const { bookingCalendarId } = getConfig();
  const query = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "2500"
  });
  const res = await googleFetch(
    "/calendars/" + encodeURIComponent(bookingCalendarId) + "/events?" + query.toString()
  );
  const data = (await res.json()) as { items?: CalendarEvent[] };
  return (data.items || []).filter((event) => event.status !== "cancelled");
}

async function getPrimaryBusy(timeMin: string, timeMax: string) {
  const { primaryCalendarId } = getConfig();
  const res = await googleFetch("/freeBusy", {
    method: "POST",
    body: JSON.stringify({
      timeMin,
      timeMax,
      timeZone: TIME_ZONE,
      items: [{ id: primaryCalendarId }]
    })
  });
  const data = (await res.json()) as {
    calendars?: Record<string, { busy?: Array<{ start: string; end: string }> }>;
  };
  const busy = data.calendars?.[primaryCalendarId]?.busy || [];
  return busy
    .map((item) => ({ start: Date.parse(item.start), end: Date.parse(item.end) }))
    .filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end));
}

export async function getBodyFixAvailability(options?: {
  days?: number;
  requiredMinutes?: number;
  stepMinutes?: number;
  maxSlotsPerDay?: number;
}) {
  const days = options?.days ?? 7;
  const requiredMinutes = options?.requiredMinutes ?? DEFAULT_REQUIRED_MINUTES;
  const stepMinutes = options?.stepMinutes ?? DEFAULT_STEP_MINUTES;
  const maxSlotsPerDay = options?.maxSlotsPerDay ?? DEFAULT_MAX_SLOTS_PER_DAY;

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
    .filter((event) => !isAvailabilityEvent(event))
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

export function googleCalendarConfigured() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON &&
      process.env.GOOGLE_PRIMARY_CALENDAR_ID &&
      process.env.GOOGLE_BOOKING_CALENDAR_ID
  );
}
