import { describe, expect, it } from "vitest";
import { computeAvailability, slotDate } from "./availability-preview";

const NOW = new Date("2026-11-23T03:00:00.000Z"); // 11/23 11:00 Taipei
const TODAY = "2026-11-23";

describe("BodyFix availability preview", () => {
  it("never turns an unspecified workday into an available day", () => {
    const r = computeAvailability({ mode: "live", serviceId: "fascia", startDate: TODAY, now: NOW, days: 1 });
    expect(r.days[0].status).toBe("NOT_OPEN");
    expect(r.nextAvailableAt).toBeNull();
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
    expect(r.days[0].slots).not.toContain("17:00");
    expect(r.days[0].status).toBe("LIMITED");
  });

  it("enforces the full 90-minute service when deciding a slot", () => {
    const busy = [{ start: slotDate(TODAY, "15:20").toISOString(), end: slotDate(TODAY, "15:40").toISOString() }];
    const base = { mode: "demo" as const, startDate: TODAY, now: NOW, days: 1, openDates: new Set([TODAY]), busy };
    const short = computeAvailability({ ...base, serviceId: "fascia" });
    const long = computeAvailability({ ...base, serviceId: "multi" });
    expect(short.days[0].slots).toContain("14:00");
    expect(long.days[0].slots).not.toContain("14:00");
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
});
