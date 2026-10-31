import { describe, expect, it } from "vitest";
import { convertBBookingActions } from "./richmenu-b-migration";

const action = (type, data, x) => ({
  bounds: { x, y: 1420, width: 800, height: 185 },
  action: { type, label: "測試", data }
});

describe("B menu migration", () => {
  const base = () => [
    action("richmenuswitch", "richmenu=bodyfix-a", 0),
    action("postback", "action=booking&mode=immediate", 30),
    action("postback", "action=booking&mode=this-week", 850),
    action("postback", "action=booking&mode=notice", 1680),
    action("postback", "action=location&location=luzhangli", 1220)
  ];
  it("updates exactly two booking actions and preserves all other areas", () => {
    const before = base();
    const next = convertBBookingActions(before);
    expect(next).toHaveLength(before.length);
    expect(next[1].action).toEqual({ type: "message", label: "測試", text: "我想預約 BodyFix" });
    expect(next[2].action).toEqual({ type: "message", label: "測試", text: "我想查看本週可約時段" });
    expect(next[1].bounds).toEqual(before[1].bounds);
    expect(next[2].bounds).toEqual(before[2].bounds);
    expect(next[0]).toEqual(before[0]);
    expect(next[3]).toEqual(before[3]);
    expect(next[4]).toEqual(before[4]);
    expect(before[1].action.type).toBe("postback");
  });
  it("refuses to proceed with missing booking buttons", () => {
    expect(() => convertBBookingActions(base().slice(0, 2))).toThrow();
  });
  it("refuses to create duplicates when B is already migrated", () => {
    expect(() => convertBBookingActions(convertBBookingActions(base()))).toThrow();
  });
  it("refuses repeated booking actions", () => {
    const before = base();
    before.push(action("postback", "action=booking&mode=immediate", 1400));
    expect(() => convertBBookingActions(before)).toThrow();
  });
});
