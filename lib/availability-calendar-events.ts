import { addDays, localDate, slotDate, type BusyWindow, type WorkWindow } from "./availability-preview";

/**
 * Optional server-only event-detail enrichment.
 *
 * Never sent to the customer. Requires a *separate, explicit* Google Calendar
 * permission increase to read event titles. In FreeBusy-only mode, do not call
 * this function with events fetched by a privileged identity.
 */
export type CalendarEntry = {
  status?: string;
  summary?: string;
  transparency?: string;
  eventType?: string;
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
  recurringEventId?: string;
};

export type ClassifiedCalendarRules = {
  extraBusy: BusyWindow[];
  closedDates: Set<string>;
  workWindowsByDate: Record<string, WorkWindow[]>;
};

function parsePoint(t: CalendarEntry["start"]): Date | null {
  if (t.dateTime) {
    const d = new Date(t.dateTime);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  if (t.date && /^\d{4}-\d{2}-\d{2}$/.test(t.date)) {
    return slotDate(t.date, "00:00");
  }
  return null;
}
function clock(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Taipei",
  }).format(d);
}

const restPattern = /(固定休|完整休息|公休|休假|休息日|休週|^rest\b|^off\b)/i;
const workPattern = /^(?:BodyFix|BF)[\s|｜:_-]*(?:開放預約|預約開放|可接客|可預約時段|開放時段)/i;
const appointmentPattern = /(摩根|morgan|私人教練|教練課|重訓課|肌筋膜|筋膜整理|放鬆按摩|運動按摩|按摩|客戶|看房|牙醫|門診|就診|看牙|搬家|移動|交通)/i;

export function classifyCalendarEvents(events: ReadonlyArray<CalendarEntry>): ClassifiedCalendarRules {
  const extraBusy: BusyWindow[] = [];
  const closedDates = new Set<string>();
  const workWindowsByDate: Record<string, WorkWindow[]> = {};

  for (const event of events) {
    if (event.status === "cancelled") continue;
    const start = parsePoint(event.start);
    const end = parsePoint(event.end);
    if (!start || !end || end <= start) continue;
    const mins = (end.getTime() - start.getTime()) / 60000;
    const title = event.summary ?? "";
    const firstDate = localDate(start);
    const endDate = localDate(new Date(end.getTime() - 1)); // Google all-day end is exclusive

    // An older recurring "固定休週二" template is a soft day-off preference,
    // not a hard closure: Gavin accepts paid appointments on those days.
    // A deliberate one-off full rest or out-of-office still takes precedence.
    const softRecurringRest = Boolean(event.recurringEventId) &&
      /^固定休週[一二三四五六日天]$/.test(title) &&
      event.transparency === "transparent";
    if (!softRecurringRest &&
        (restPattern.test(title) || event.eventType === "outOfOffice") && mins >= 12 * 60) {
      for (let day = firstDate, guard = 0; day <= endDate && guard++ < 35; day = addDays(day, 1)) {
        closedDates.add(day);
      }
      continue;
    }

    // A deliberately labelled opening in the existing Google Calendar is
    // allowed to define hours. Generic 'free' events are NEVER opening events.
    if (workPattern.test(title) && mins >= 60 && mins <= 18 * 60) {
      const extraHours = firstDate !== localDate(end) ? 24 : 0;
      const startClock = clock(start);
      const endClock = clock(end);
      const endHour = Number(endClock.slice(0, 2)) + extraHours;
      const endLocal = String(endHour).padStart(2, "0") + endClock.slice(2);
      (workWindowsByDate[firstDate] ??= []).push({ start: startClock, end: endLocal });
      continue;
    }

    // Gavin's normal rule is "if it is in my calendar, I am occupied".
    // Calendar's FreeBusy API does not report entries marked "free".
    // Treat substantial timed entries (including meals and activities) as
    // conflicts, while excluding 24-hour reminders and quick 10-20m prompts.
    // Short explicitly named appointments are also genuine commitments.
    const timed = Boolean(event.start.dateTime) && Boolean(event.end.dateTime);
    const actualCommitment = (mins >= 30 && mins < 12 * 60) ||
      (appointmentPattern.test(title) && mins >= 10 && mins < 18 * 60);
    if (event.transparency === "transparent" && timed && actualCommitment) {
      extraBusy.push({ start: start.toISOString(), end: end.toISOString() });
    }
  }

  return { extraBusy, closedDates, workWindowsByDate };
}
