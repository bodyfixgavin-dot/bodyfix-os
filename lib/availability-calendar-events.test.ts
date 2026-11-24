import { describe, expect, it } from "vitest";
import { classifyCalendarEvents } from "./availability-calendar-events";

describe("BodyFix calendar event details: opt-in enrichment", () => {
  it("does not hard-close an older recurring Tuesday rest preference", () => {
    const r = classifyCalendarEvents([{
      summary: "固定休週二", status: "confirmed", transparency: "transparent",
      recurringEventId: "old-tuesday-rest",
      start: { date: "2026-11-24" }, end: { date: "2026-11-25" },
    }]);
    expect(r.closedDates.has("2026-11-24")).toBe(false);
    expect(r.extraBusy.length).toBe(0);
  });

  it("keeps a complete Sunday rest closed even though it is marked free", () => {
    const r = classifyCalendarEvents([{
      summary: "Rest（完整休息）", transparency: "transparent",
      start: { date: "2026-11-29" }, end: { date: "2026-11-30" },
    }]);
    expect(r.closedDates.has("2026-11-29")).toBe(true);
  });

  it("blocks Morgan shifts marked free when event-title permission is granted", () => {
    const r = classifyCalendarEvents([{
      summary: "摩根排班", transparency: "transparent",
      start: { dateTime: "2026-11-27T17:00:00+08:00" },
      end: { dateTime: "2026-11-28T00:00:00+08:00" },
    }]);
    expect(r.extraBusy.length).toBe(1);
  });

  it("ignores generic all-day transparent routine reminders", () => {
    const r = classifyCalendarEvents([{
      summary: "本週自我訓練提醒", transparency: "transparent",
      start: { date: "2026-11-25" }, end: { date: "2026-11-26" },
    }]);
    expect(r.closedDates.size).toBe(0);
    expect(r.extraBusy.length).toBe(0);
  });

  it("allows only explicitly labelled Google Calendar opening windows", () => {
    const r = classifyCalendarEvents([{
      summary: "BodyFix 可預約時段", transparency: "transparent",
      start: { dateTime: "2026-11-25T13:00:00+08:00" },
      end: { dateTime: "2026-11-26T01:00:00+08:00" },
    }]);
    expect(r.workWindowsByDate["2026-11-25"]).toEqual([{ start: "13:00", end: "25:00" }]);
    expect(r.extraBusy.length).toBe(0);
  });

  it("never opens a day from an arbitrary free event, and ignores cancelled events", () => {
    const r = classifyCalendarEvents([
      { summary: "提醒", transparency: "transparent", start: { dateTime: "2026-11-25T14:00:00+08:00" }, end: { dateTime: "2026-11-25T15:00:00+08:00" } },
      { summary: "BodyFix 開放時段", status: "cancelled", start: { dateTime: "2026-11-25T13:00:00+08:00" }, end: { dateTime: "2026-11-25T23:00:00+08:00" } },
    ]);
    expect(Object.keys(r.workWindowsByDate).length).toBe(0);
    expect(r.extraBusy.length).toBe(1);
  });
  it("blocks ordinary plans such as a dinner recorded as free", () => {
    const r = classifyCalendarEvents([{
      summary: "與朋友聚餐", transparency: "transparent",
      start: { dateTime: "2026-11-25T18:00:00+08:00" },
      end: { dateTime: "2026-11-25T20:00:00+08:00" },
    }]);
    expect(r.extraBusy.length).toBe(1);
  });

  it("ignores short free reminders so they do not occupy service time", () => {
    const r = classifyCalendarEvents([{
      summary: "提醒回覆客人", transparency: "transparent",
      start: { dateTime: "2026-11-25T13:00:00+08:00" },
      end: { dateTime: "2026-11-25T13:20:00+08:00" },
    }]);
    expect(r.extraBusy.length).toBe(0);
  });

});
