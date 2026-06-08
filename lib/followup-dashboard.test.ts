import { describe, expect, it } from "vitest";
import { buildFollowupDashboard } from "./followup-dashboard";

const now = new Date("2026-06-08T12:00:00Z");
const clients = [{ id: "c1", display_name: "Gavin" }, { id: "c2", display_name: "新客" }, { id: "c3", display_name: "沉睡客" }];
const records = [
  { id: "r1", client_id: "c1", service_date: "2026-05-20", processed_area: "肩頸與胸廓", next_focus: "骨盆" },
  { id: "r2", client_id: "c1", service_date: "2026-05-10", processed_area: "骨盆與下肢" },
  { id: "r3", client_id: "c1", service_date: "2026-05-01", processed_area: "訓練恢復" },
  { id: "r4", client_id: "c2", service_date: "2026-06-06", processed_area: "肩頸" },
  { id: "r5", client_id: "c3", service_date: "2026-04-01", processed_area: "胸廓" }
];

describe("buildFollowupDashboard", () => {
  it("classifies rule-based follow-up, renewal, twelve-session, and sleeping clients", () => {
    const result = buildFollowupDashboard(clients, records, [], now);
    expect(result.high_priority[0].client_id).toBe("c1");
    expect(result.renewal_candidates[0].client_id).toBe("c1");
    expect(result.twelve_session_candidates[0].client_id).toBe("c1");
    expect(result.today.find((client) => client.client_id === "c2")?.followup_priority).toBe("new");
    expect(result.sleeping_clients[0].client_id).toBe("c3");
  });

  it("hides clients followed today or delayed to a future date", () => {
    const followups = [
      { id: "f1", client_id: "c1", is_done: true, sent_at: "2026-06-08T01:00:00Z", scheduled_date: "2026-06-08" },
      { id: "f2", client_id: "c2", is_done: false, scheduled_date: "2026-06-15" }
    ];
    const result = buildFollowupDashboard(clients, records, followups, now);
    expect(result.today.map((client) => client.client_id)).toEqual(["c3"]);
  });
});
