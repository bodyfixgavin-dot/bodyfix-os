import { describe, expect, it } from "vitest";
import { computeAvailability, slotDate } from "./availability-preview";

const NOW = new Date("2026-11-23T03:00:00.000Z"); // 11/23 11:00 Taipei
const TODAY = "2026-11-23";

describe("BodyFix availability preview", () => {
  it("never turns an unspecified workday into an available day", () => {
    const r = computeAvailability({ mode: "live", serviceId: "fascia", startDate: TODAY, now: NOW, days: 1 });
    expect(r.days[0].status).toBe("NOT_OPEN");
    expect(r.nextAvailableAt).toBe(null);
  });

  it("labels true rest days CLOSED rather than FULL", () => {
    const r = computeAvailability({
      mode: "live", serviceId: "fascia", startDate: TODAY, now: NOW, days: 1,
      openDates: new Set([TODAY]), closedDates: new Set([TODAY]),
    });
    expect(r.days[0].status).toBe("CLOSED");
  });

  it("excludes a busy interval even when it only overlaps the buffer", () => {
    const r = computeAvailability({
      mode: "live", serviceId: "fascia", startDate: TODAY, now: NOW, days: 1,
      openDates: new Set([TODAY]),
      busy: [{ start: "2026-11-23T08:45:00.000Z", end: "2026-11-23T09:00:00.000Z" }],
    });
    expect(r.days[0].slots.includes("17:00")).toBe(false);
    expect(r.days[0].status).toBe("LIMITED");
  });

  it("enforces the full 90-minute service when deciding a slot", () => {
    const busy = [{ start: slotDate(TODAY, "15:50").toISOString(), end: slotDate(TODAY, "16:10").toISOString() }];
    const base = { mode: "demo" as const, startDate: TODAY, now: NOW, days: 1, openDates: new Set([TODAY]), busy };
    const short = computeAvailability({ ...base, serviceId: "fascia" });
    const long = computeAvailability({ ...base, serviceId: "multi" });
    expect(short.days[0].slots.includes("14:00")).toBe(true);
    expect(long.days[0].slots.includes("14:00")).toBe(false);
  });

  it("shows FULL only when all future candidate slots are blocked", () => {
    const busy = ["14:00", "17:00", "19:00", "22:00"].map((t) => ({
      start: slotDate(TODAY, t).toISOString(),
      end: new Date(slotDate(TODAY, t).getTime() + 60 * 60_000).toISOString(),
    }));
    const r = computeAvailability({
      mode: "demo", serviceId: "fascia", startDate: TODAY, now: NOW, days: 1,
      openDates: new Set([TODAY]), busy,
    });
    expect(r.days[0].status).toBe("FULL");
    expect(r.days[0].remaining).toBe(0);
  });

  it("finds the next available day and never creates a booking", () => {
    const r = computeAvailability({
      mode: "demo", serviceId: "relax", startDate: TODAY, now: NOW, days: 2,
      openDates: new Set(["2026-11-24"]),
    });
    expect(r.nextAvailableAt).toBe(slotDate("2026-11-24", "14:00").toISOString());
    expect(r.requiresConfirmation).toBe(true);
  });
  it("keeps all ordinary days NOT_OPEN even when FreeBusy is empty", () => {
    const r = computeAvailability({
      mode: "live", serviceId: "fascia", startDate: TODAY, now: NOW, days: 7, busy: [],
    });
    expect(r.days.every((d) => d.status === "NOT_OPEN")).toBe(true);
    expect(r.nextAvailableAt).toBe(null);
  });

  it("respects a busy Morgan shift over 17:00–24:00, preserving an early slot", () => {
    const r = computeAvailability({
      mode: "live", serviceId: "fascia", startDate: TODAY, now: NOW, days: 1,
      openDates: new Set([TODAY]),
      busy: [{ start: slotDate(TODAY, "17:00").toISOString(), end: slotDate("2026-11-24", "00:00").toISOString() }],
    });
    expect(r.days[0].slots).toEqual(["14:00"]);
    expect(r.days[0].status).toBe("LIMITED");
  });

  it("requires an approved work window for late and early slots", () => {
    const base = {
      mode: "live" as const, startDate: TODAY, days: 1, now: NOW,
      workWindowsByDate: { [TODAY]: [{ start: "16:00", end: "21:00" }] },
    };
    const short = computeAvailability({ ...base, serviceId: "fascia" });
    const long = computeAvailability({ ...base, serviceId: "multi" });
    expect(short.days[0].slots).toEqual(["17:00", "19:00"]);
    expect(long.days[0].slots).toEqual(["17:00"]);
  });

  it("never opens an explicitly closed full rest day, even if an opening window exists", () => {
    const r = computeAvailability({
      mode: "live", serviceId: "fascia", startDate: TODAY, now: NOW, days: 1,
      openDates: new Set([TODAY]), closedDates: new Set([TODAY]),
      workWindowsByDate: { [TODAY]: [{ start: "13:00", end: "25:00" }] },
      busy: [],
    });
    expect(r.days[0].status).toBe("CLOSED");
  });

  it("keeps 22:00 as an eligible 90-minute start when the day is explicitly opened", () => {
    const r = computeAvailability({
      mode: "live", serviceId: "multi", startDate: TODAY, now: NOW, days: 1,
      openDates: new Set([TODAY]), busy: [],
    });
    expect(r.days[0].slots.includes("22:00")).toBe(true);
  });

  it("opens any day by default only when the API has verified calendar coverage", () => {
    const r = computeAvailability({
      mode: "live", serviceId: "fascia", startDate: TODAY, now: NOW, days: 2,
      defaultOpen: true, busy: [],
    });
    expect(r.days.every(d => d.status === "AVAILABLE")).toBe(true);
    expect(r.days[0].slots).toEqual(["14:00", "17:00", "19:00", "22:00"]);
  });

  it("blocks an actual calendar commitment without needing a separate workday", () => {
    const r = computeAvailability({
      mode: "live", serviceId: "fascia", startDate: TODAY, now: NOW, days: 1,
      defaultOpen: true, busy: [{
        start: slotDate(TODAY, "16:30").toISOString(),
        end: slotDate(TODAY, "18:00").toISOString(),
      }],
    });
    expect(r.days[0].slots).toEqual(["14:00", "19:00", "22:00"]);
    expect(r.days[0].status).toBe("LIMITED");
  });

  it("keeps fully recorded rest days closed even with automatic daily opening", () => {
    const r = computeAvailability({
      mode: "live", serviceId: "fascia", startDate: TODAY, now: NOW, days: 1,
      defaultOpen: true, closedDates: new Set([TODAY]),
    });
    expect(r.days[0].status).toBe("CLOSED");
  });

});
