/**
 * BodyFix Availability Preview V1
 * Read-only availability calculation; it never creates reservations.
 * Public results must contain only slot status, never event titles.
 */
export const TIMEZONE = "Asia/Taipei";
export const START_TIMES = ["14:00", "17:00", "19:00", "22:00"] as const;
export const SERVICES = [
  { id: "relax", name: "放鬆按摩", duration: 60, price: 1600 },
  { id: "fascia", name: "肌筋膜整理按摩", duration: 60, price: 2200 },
  { id: "multi", name: "多線筋膜整合", duration: 90, price: 3600 },
  { id: "pelvic", name: "骨盆核心整理按摩", duration: 60, price: 2500 },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];
export type DayStatus = "AVAILABLE" | "LIMITED" | "FULL" | "CLOSED" | "NOT_OPEN" | "ENDED";
export type BusyWindow = { start: string; end: string };
/** Approved availability windows, in Taipei local wall-clock time.
 * "25:00" means 01:00 the following day. No windows are inferred from a blank calendar.
 */
export type WorkWindow = { start: string; end: string };
export type DayAvailability = {
  date: string;
  status: DayStatus;
  slots: string[];
  remaining: number;
};
export type AvailabilityResult = {
  timezone: typeof TIMEZONE;
  serviceId: ServiceId;
  serviceMinutes: number;
  mode: "demo" | "live";
  updatedAt: string;
  notice: string;
  days: DayAvailability[];
  nextAvailableAt: string | null;
  requiresConfirmation: true;
  /** Diagnostics only; no calendar event details are ever returned. */
  calendarConnected?: boolean;
  scheduleConfigured?: boolean;
  connectionNote?: string;
};

export function localDate(now: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}

export function addDays(date: string, amount: number): string {
  const base = new Date(date + "T12:00:00+08:00");
  base.setUTCDate(base.getUTCDate() + amount);
  return localDate(base);
}

export function slotDate(date: string, time: string): Date {
  return new Date(date + "T" + time + ":00+08:00");
}

function weekday(date: string): number {
  return slotDate(date, "12:00").getUTCDay();
}

export function computeAvailability(args: {
  mode: "demo" | "live";
  serviceId: ServiceId;
  startDate: string;
  days?: number;
  now?: Date;
  busy?: BusyWindow[];
  openDates?: ReadonlySet<string>;
  closedDates?: ReadonlySet<string>;
  workWeekdays?: ReadonlySet<number>;
  /** Gavin's rule: daily availability is the default; calendar commitments close slots. */
  defaultOpen?: boolean;
  /** Date-specific approved work windows. When present they override recurring weekday windows. */
  workWindowsByDate?: Readonly<Record<string, ReadonlyArray<WorkWindow>>>;
  leadMinutes?: number;
  /** A conservative cushion around any busy appointment; includes travel and preparation. */
  bufferMinutes?: number;
}): AvailabilityResult {
  const service = SERVICES.find((s) => s.id === args.serviceId);
  if (!service) throw new Error("Invalid service");
  const now = args.now ?? new Date();
  const count = Math.min(30, Math.max(1, args.days ?? 30));
  const leadMs = (args.leadMinutes ?? 120) * 60_000;
  const bufferMinutes = Math.max(0, Math.min(180, args.bufferMinutes ?? 45));
  const bufferMs = bufferMinutes * 60_000;
  const busy = (args.busy ?? []).map((b) => [new Date(b.start).getTime(), new Date(b.end).getTime()]);
  const results: DayAvailability[] = [];
  let nextAvailableAt: string | null = null;
  const localMinutes = (time: string) => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(time);
    if (!match) return NaN;
    const hour = Number(match[1]), minute = Number(match[2]);
    return hour >= 0 && hour <= 28 && minute >= 0 && minute < 60 ? hour * 60 + minute : NaN;
  };
  // Daily opening is allowed only when the caller explicitly enables defaultOpen.
  // This cannot be enabled from a public query parameter; API must verify event coverage.
  const standardWindow: ReadonlyArray<WorkWindow> = [{ start: "13:00", end: "25:00" }];

  for (let i = 0; i < count; i++) {
    const date = addDays(args.startDate, i);
    if (args.closedDates?.has(date)) {
      results.push({ date, status: "CLOSED", slots: [], remaining: 0 });
      continue;
    }
    const explicitWindows = args.workWindowsByDate?.[date];
    const recurringOpen = args.defaultOpen === true || args.openDates?.has(date) || (args.workWeekdays?.has(weekday(date)) ?? false);
    const windows = explicitWindows ?? (recurringOpen ? standardWindow : []);
    if (windows.length === 0) {
      results.push({ date, status: "NOT_OPEN", slots: [], remaining: 0 });
      continue;
    }

    const withinApprovedWindow = START_TIMES.filter((time) => {
      const from = localMinutes(time) - bufferMinutes;
      const until = localMinutes(time) + service.duration + bufferMinutes;
      return windows.some((w) => from >= localMinutes(w.start) && until <= localMinutes(w.end));
    });
    if (withinApprovedWindow.length === 0) {
      results.push({ date, status: "NOT_OPEN", slots: [], remaining: 0 });
      continue;
    }
    const future = withinApprovedWindow.filter((time) => slotDate(date, time).getTime() >= now.getTime() + leadMs);
    if (future.length === 0) {
      results.push({ date, status: "ENDED", slots: [], remaining: 0 });
      continue;
    }
    const available = future.filter((time) => {
      const from = slotDate(date, time).getTime() - bufferMs;
      const until = slotDate(date, time).getTime() + service.duration * 60_000 + bufferMs;
      // A slot is valid only if its entire session + travel/preparation buffer is conflict-free.
      return !busy.some(([start, end]) => from < end && until > start);
    });
    if (!nextAvailableAt && available.length) nextAvailableAt = slotDate(date, available[0]).toISOString();
    results.push({
      date,
      status: available.length === 0 ? "FULL" : available.length < future.length ? "LIMITED" : "AVAILABLE",
      slots: available,
      remaining: available.length,
    });
  }

  return {
    timezone: TIMEZONE, serviceId: service.id, serviceMinutes: service.duration,
    mode: args.mode, updatedAt: now.toISOString(),
    notice: args.mode === "demo" ? "示範資料，非真實可預約時間" : "可洽詢時段，須經 Gavin 人工確認",
    days: results, nextAvailableAt, requiresConfirmation: true,
  };
}

export function sampleBusy(startDate: string): BusyWindow[] {
  const busy: BusyWindow[] = [];
  // Deliberately generated demonstration events, not user calendar data.
  for (const [offset, times] of [
    [0, START_TIMES], [1, ["14:00", "19:00"]], [2, ["22:00"]], [4, START_TIMES],
  ] as const) {
    for (const time of times) {
      const from = slotDate(addDays(startDate, offset), time);
      busy.push({ start: from.toISOString(), end: new Date(from.getTime() + 120 * 60_000).toISOString() });
    }
  }
  return busy;
}
