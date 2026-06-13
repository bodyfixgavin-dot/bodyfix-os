export type FollowupPriority = "P1" | "P2" | "P3";
export type FollowupSource = "followup_task" | "package_candidate";
export type FollowupMode = "關懷模式" | "接續模式" | "續約模式" | "喚醒模式";

export type FollowupClient = {
  item_id: string;
  source: FollowupSource;
  client_id: string;
  client_code: string | null;
  client_name: string;
  priority: FollowupPriority;
  category: string;
  category_label: string;
  due_date: string | null;
  last_visit_date: string | null;
  days_since_visit: number | null;
  service_count: number;
  reason: string;
  suggested_message: string;
  package_label: string | null;
  mode: FollowupMode;
  last_focus: string;
  package_status: string;
};

export type FollowupDashboardData = {
  generated_at: string;
  today: FollowupClient[];
  p1: FollowupClient[];
  p2: FollowupClient[];
  dormant_clients: FollowupClient[];
  package_candidates: FollowupClient[];
  counts: { clients: number; service_records: number; open_tasks: number; package_candidates: number };
};

type Row = Record<string, unknown>;

const DAY_MS = 86_400_000;

function text(row: Row, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function nullableText(row: Row, keys: string[]) {
  return text(row, keys) || null;
}

function dateText(row: Row, keys: string[]) {
  const value = text(row, keys);
  return value ? value.slice(0, 10) : null;
}

function numberValue(row: Row, keys: string[]) {
  for (const key of keys) {
    const value = Number(row[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

function priorityValue(row: Row): FollowupPriority {
  const priority = text(row, ["priority", "priority_level"]).toUpperCase();
  if (priority === "P1" || priority === "HIGH") return "P1";
  if (priority === "P2" || priority === "MEDIUM") return "P2";
  return "P3";
}

function categoryValue(row: Row) {
  return text(row, ["task_type", "category", "segment", "reason_code", "followup_type", "candidate_type", "type"]);
}

function categoryLabel(category: string, source: FollowupSource) {
  if (category === "dormant_client") return "沉睡客戶";
  if (source === "package_candidate") return "方案候選";
  return category ? category.replaceAll("_", " ") : "一般關心";
}

function isOpen(row: Row) {
  const status = text(row, ["status", "task_status"]).toLowerCase();
  return !status || ["open", "pending", "todo", "not_started"].includes(status);
}

function daysSince(date: string | null, today: string) {
  if (!date) return null;
  const difference = new Date(`${today}T00:00:00Z`).getTime() - new Date(`${date}T00:00:00Z`).getTime();
  return Math.max(0, Math.floor(difference / DAY_MS));
}

function sortItems(items: FollowupClient[]) {
  const priorityRank = { P1: 0, P2: 1, P3: 2 };
  return items.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]
    || (a.due_date ?? "9999-12-31").localeCompare(b.due_date ?? "9999-12-31")
    || (b.days_since_visit ?? -1) - (a.days_since_visit ?? -1));
}

function followupMode(source: FollowupSource, category: string, days: number | null): FollowupMode {
  if (category === "dormant_client" || (days ?? 0) >= 60) return "喚醒模式";
  if (source === "package_candidate") return "續約模式";
  if ((days ?? 0) >= 21) return "關懷模式";
  return "接續模式";
}

export function buildFollowupDashboard(
  clients: Row[],
  records: Row[],
  followupTasks: Row[],
  packageCandidates: Row[],
  now = new Date()
): FollowupDashboardData {
  const today = now.toISOString().slice(0, 10);
  const clientsById = new Map(clients.map((client) => [String(client.id), client]));
  const recordsByClient = new Map<string, Row[]>();

  for (const record of records) {
    const clientId = String(record.client_id ?? "");
    const list = recordsByClient.get(clientId) ?? [];
    list.push(record);
    recordsByClient.set(clientId, list);
  }
  for (const list of recordsByClient.values()) {
    list.sort((a, b) => text(b, ["service_date", "created_at"]).localeCompare(text(a, ["service_date", "created_at"])));
  }

  function normalize(row: Row, source: FollowupSource): FollowupClient {
    const clientId = String(row.client_id ?? "");
    const client = clientsById.get(clientId) ?? {};
    const clientRecords = recordsByClient.get(clientId) ?? [];
    const lastVisit = dateText(clientRecords[0] ?? {}, ["service_date", "created_at"])
      ?? dateText(client, ["last_session_date", "last_visit_date"]);
    const category = categoryValue(row);
    const visitDays = daysSince(lastVisit, today);
    const latestRecord = clientRecords[0] ?? {};
    return {
      item_id: String(row.id ?? `${source}-${clientId}`),
      source,
      client_id: clientId,
      client_code: nullableText(client, ["client_code"]),
      client_name: text(client, ["display_name", "client_name", "nickname"]) || "未命名客戶",
      priority: priorityValue(row),
      category,
      category_label: categoryLabel(category, source),
      due_date: dateText(row, ["due_date", "scheduled_date", "followup_date", "next_followup_date"]),
      last_visit_date: lastVisit,
      days_since_visit: visitDays,
      service_count: clientRecords.length || numberValue(client, ["total_sessions", "service_count"]),
      reason: text(row, ["reason", "trigger_reason", "task_reason", "notes", "description"]) || "依目前追蹤節奏安排",
      suggested_message: text(row, ["suggested_message", "message", "message_template", "suggested_pitch", "proposal_message"]) || "嗨，最近還好嗎？想關心一下你近期的狀態與安排。",
      package_label: source === "package_candidate" ? nullableText(row, ["package_name", "suggested_package", "offer_title", "candidate_type", "package_type"]) : null,
      mode: followupMode(source, category, visitDays),
      last_focus: text(latestRecord, ["next_focus", "processed_area", "main_complaint", "after_change"]) || "尚未記錄上次整理重點",
      package_status: text(row, ["package_status", "balance_summary", "remaining_sessions", "status"]) || "尚未記錄方案狀態"
    };
  }

  const openTasks = followupTasks.filter(isOpen).map((row) => normalize(row, "followup_task"));
  const candidates = packageCandidates.map((row) => normalize(row, "package_candidate"));

  return {
    generated_at: now.toISOString(),
    today: sortItems(openTasks.filter((item) => !item.due_date || item.due_date <= today)),
    p1: sortItems(openTasks.filter((item) => item.priority === "P1")),
    p2: sortItems(openTasks.filter((item) => item.priority === "P2")),
    dormant_clients: sortItems(openTasks.filter((item) => item.category === "dormant_client")),
    package_candidates: sortItems(candidates),
    counts: { clients: clients.length, service_records: records.length, open_tasks: openTasks.length, package_candidates: candidates.length }
  };
}
