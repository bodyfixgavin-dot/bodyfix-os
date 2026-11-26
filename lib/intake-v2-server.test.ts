import { beforeEach, describe, expect, it, vi } from "vitest";
import { emptyIntake, taipeiToday } from "./intake-v2";
const { state } = vi.hoisted(() => ({ state: { configured: true, fails: false, rows: new Map<string, any>() } }));
vi.mock("@/lib/intake-options", () => ({ getIntakePlaces: async () => [{ id: "discuss", name: "指定地點／與 Gavin 討論" }] }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseAdminClient: () => !state.configured ? null : { from: (table: string) => ({ upsert: async (row: any, options: any) => {
  expect(table).toBe("intake_submissions"); expect(options).toEqual({ onConflict: "id", ignoreDuplicates: true });
  if (state.fails) return { error: { message: "private database details" } };
  if (!state.rows.has(row.id)) state.rows.set(row.id, row);
  return { error: null };
} }) } }));
import { saveIntakeV2 } from "./intake-v2-server";
const request = () => ({ version: "2.0", submissionKey: "32f81e20-8b6a-4826-a1a2-86508a013a20", answers: { ...emptyIntake(), name: "測試", visit: "我之前來過", contact: "測試 LINE", contactMethod: "LINE", service: "body-reset", date: taipeiToday(), time: "14:00", place: "discuss", safety: "沒有上述需要告知的狀況", privacyConsent: true, serviceConsent: true } });
describe("V2 persistence boundary", () => {
  beforeEach(() => { state.rows.clear(); state.configured = true; state.fails = false; });
  it("deduplicates concurrent retries atomically without overwriting immutable snapshots", async () => {
    const [a, b] = await Promise.all([saveIntakeV2(request()), saveIntakeV2(request())]);
    expect(a.status).toBe(201); expect(b.status).toBe(201);
    expect(state.rows.size).toBe(1); expect(await a.json()).toEqual(await b.json());
    const row = [...state.rows.values()][0];
    expect(JSON.parse(row.raw_message).quote).toMatchObject({ name: "肌筋膜整理按摩", amount: 2200 });
    expect(row.resolution_status).toBeUndefined(); expect(row.client_id).toBeUndefined();
  });
  it("returns explicit failure without a false receipt when database fails/is missing", async () => {
    state.fails = true; const response = await saveIntakeV2(request());
    expect(response.status).toBe(503); expect(await response.json()).toMatchObject({ stored: false });
    state.configured = false; expect((await saveIntakeV2(request())).status).toBe(503); expect(state.rows.size).toBe(0);
  });
  it("rejects missing safety, invalid dates, forged location and missing consent", async () => {
    for (const changes of [{ safety: "" }, { date: "2000-01-01" }, { place: "forged" }, { privacyConsent: false }]) {
      const body = request(); Object.assign(body.answers, changes); expect((await saveIntakeV2(body)).status).toBe(400);
    }
    expect(state.rows.size).toBe(0);
  });
  it("strips inactive profile and service fields; no private values in receipts", async () => {
    const body = request(); Object.assign(body.answers, { birthday: "1990-11-26", height: "175", service: "movement", extended: true, regions: ["肩頸"], safetyNote: "secret", pelvicConsent: true, lineUserId: "forged" });
    const result = await saveIntakeV2(body); expect(result.status).toBe(201);
    const row = [...state.rows.values()][0];
    expect(JSON.parse(row.raw_message).answers).toMatchObject({ birthday: "", height: "", regions: [], safetyNote: "", pelvicConsent: false, extended: false });
    expect(row.line_user_id).toBeUndefined(); expect(JSON.parse(row.raw_message).answers.lineUserId).toBeUndefined();
    expect(Object.keys(await result.json()).sort()).toEqual(["ok", "reference", "stored"]);
  });
});
