import { describe, expect, it } from "vitest";
import { buildFollowupDashboard } from "./followup-dashboard";

const now = new Date("2026-06-08T12:00:00Z");
const clients = [{ id: "c1", display_name: "Gavin" }, { id: "c2", display_name: "沉睡客" }];
const records = [{ id: "r1", client_id: "c1", service_date: "2026-05-20" }, { id: "r2", client_id: "c2", service_date: "2026-04-01" }];
const tasks = [
  { id: "f1", client_id: "c1", priority: "P1", due_date: "2026-06-08", status: "open", suggested_message: "今天問候" },
  { id: "f2", client_id: "c2", priority: "P2", due_date: "2026-06-10", status: "open", task_type: "dormant_client", suggested_message: "好久不見" },
  { id: "f3", client_id: "c1", priority: "P1", due_date: "2026-06-01", status: "completed" }
];
const candidates = [{ id: "p1", client_id: "c1", priority: "P2", status: "open", package_name: "節奏方案", suggested_message: "一起看看下一步安排" }];

describe("buildFollowupDashboard", () => {
  it("reads existing open tasks into today, P1, P2 and dormant sections", () => {
    const result = buildFollowupDashboard(clients, records, tasks, candidates, now);
    expect(result.today.map((item) => item.item_id)).toEqual(["f1"]);
    expect(result.p1.map((item) => item.item_id)).toEqual(["f1"]);
    expect(result.p2.map((item) => item.item_id)).toEqual(["f2"]);
    expect(result.dormant_clients.map((item) => item.item_id)).toEqual(["f2"]);
    expect(result.counts.open_tasks).toBe(2);
  });

  it("uses stored suggested messages and package candidates", () => {
    const result = buildFollowupDashboard(clients, records, tasks, candidates, now);
    expect(result.p1[0].suggested_message).toBe("今天問候");
    expect({ item_id: result.package_candidates[0].item_id, package_label: result.package_candidates[0].package_label, suggested_message: result.package_candidates[0].suggested_message }).toEqual({ item_id: "p1", package_label: "節奏方案", suggested_message: "一起看看下一步安排" });
  });
});
