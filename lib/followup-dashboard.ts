export type FollowupPriority = "high" | "medium" | "new" | "sleeping" | "watch";

export type FollowupClient = {
  client_id: string;
  client_code: string | null;
  client_name: string;
  last_visit_date: string;
  days_since_visit: number;
  last_service_type: string;
  main_tags: string[];
  last_notes: string;
  next_recommended_action: string;
  followup_priority: FollowupPriority;
  service_count: number;
  is_renewal_candidate: boolean;
  is_twelve_session_candidate: boolean;
  is_sleeping: boolean;
  message: string;
  followup_id: string | null;
};

type ClientRow = Record<string, unknown> & { id: string };
type RecordRow = Record<string, unknown> & { id: string; client_id: string; service_date: string };
type FollowupRow = Record<string, unknown> & { id: string; client_id: string };

const FOCUS_TAGS = ["肩頸", "胸廓", "骨盆", "下肢", "訓練恢復"];
const DAY_MS = 86_400_000;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function dateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: Date) {
  const fromMs = new Date(`${from}T00:00:00Z`).getTime();
  const toMs = new Date(`${dateOnly(to)}T00:00:00Z`).getTime();
  return Math.max(0, Math.floor((toMs - fromMs) / DAY_MS));
}

function uniqueTags(content: string) {
  return FOCUS_TAGS.filter((tag) => content.includes(tag));
}

function priorityFor(days: number, count: number): FollowupPriority {
  if (days > 30) return "sleeping";
  if (count === 1 && days >= 1 && days <= 3) return "new";
  if (days > 14 && count >= 2) return "high";
  if (days >= 7 && days <= 14) return "medium";
  return "watch";
}

function nextAction(priority: FollowupPriority, renewal: boolean, twelveSession: boolean) {
  if (priority === "sleeping") return "重新關心近況，邀請把身體狀態接回來";
  if (priority === "new") return "確認首次整理後的身體感受";
  if (twelveSession) return "討論 Fascia Chain Reset 12 次完整計畫";
  if (renewal) return "討論下一個有節奏的整理週期";
  if (priority === "high") return "今天主動關心並安排下一次整理";
  if (priority === "medium") return "本週關心身體狀態與下一次安排";
  return "持續觀察回訪節奏";
}

function messageFor(priority: FollowupPriority, renewal: boolean, focus: string) {
  const area = focus || "上次的身體狀態";
  if (priority === "new") return "上次整理完後，這幾天身體感覺還穩嗎？有沒有哪個地方又開始緊回來？";
  if (priority === "sleeping") return `最近身體還好嗎？之前有整理過${area}，如果最近又開始緊或訓練恢復變慢，可以再約一次把狀態接回來。`;
  if (renewal) return "你最近已經有幾次身體整理紀錄，我覺得可以開始把它做成比較有節奏的追蹤，不只是單次放鬆。下次可以一起看要不要整理成一個週期。";
  return `最近身體狀態還穩嗎？上次主要整理的是${area}，如果這幾天又有卡住，我們可以接著看下一段張力路徑。`;
}

export function buildFollowupDashboard(clients: ClientRow[], records: RecordRow[], followups: FollowupRow[], now = new Date()) {
  const recordsByClient = new Map<string, RecordRow[]>();
  for (const record of records) {
    const list = recordsByClient.get(record.client_id) ?? [];
    list.push(record);
    recordsByClient.set(record.client_id, list);
  }

  const today = dateOnly(now);
  const tasksByClient = new Map<string, FollowupRow>();
  for (const followup of followups) {
    if (!tasksByClient.has(followup.client_id)) tasksByClient.set(followup.client_id, followup);
  }
  const people: FollowupClient[] = [];

  for (const client of clients) {
    const latestTask = tasksByClient.get(client.id);
    const taskIsDoneToday = latestTask?.is_done === true && text(latestTask.sent_at).slice(0, 10) === today;
    const taskIsDelayed = latestTask?.is_done !== true && text(latestTask?.scheduled_date) > today;
    if (taskIsDoneToday || taskIsDelayed) continue;

    const clientRecords = (recordsByClient.get(client.id) ?? []).sort((a, b) => b.service_date.localeCompare(a.service_date));
    const latest = clientRecords[0];
    const lastVisit = latest?.service_date || text(client.last_session_date);
    if (!lastVisit) continue;

    const days = daysBetween(lastVisit, now);
    const count = clientRecords.length || Number(client.total_sessions) || 0;
    const combined = clientRecords.map((record) => [record.main_complaint, record.main_tension_area, record.processed_area, record.body_region, record.next_focus, record.internal_notes].map(text).join(" ")).join(" ");
    const mainTags = uniqueTags(combined);
    const latestFocus = text(latest?.processed_area) || text(latest?.main_tension_area) || text(latest?.main_complaint) || text(client.main_issue);
    const latestNotes = text(latest?.after_change) || text(latest?.internal_notes) || text(latest?.main_complaint) || text(client.internal_notes) || "尚未留下整理重點";
    const priority = priorityFor(days, count);
    const renewal = count >= 3 && days <= 30;
    const twelveSession = count >= 3 && mainTags.length >= 2;
    const task = latestTask?.is_done === true ? undefined : latestTask;

    people.push({
      client_id: client.id,
      client_code: text(client.client_code) || null,
      client_name: text(client.display_name) || text(client.client_name) || text(client.nickname) || "未命名客戶",
      last_visit_date: lastVisit,
      days_since_visit: days,
      last_service_type: text(latest?.service_name_snapshot) || text(latest?.service_code) || "身體整理",
      main_tags: mainTags.length ? mainTags : [text(latest?.body_region) || "待補標籤"],
      last_notes: latestNotes,
      next_recommended_action: text(task?.next_action) || nextAction(priority, renewal, twelveSession),
      followup_priority: priority,
      service_count: count,
      is_renewal_candidate: renewal,
      is_twelve_session_candidate: twelveSession,
      is_sleeping: days > 30,
      message: text(task?.message_summary) || messageFor(priority, renewal, latestFocus),
      followup_id: task?.id ?? null
    });
  }

  const score = { sleeping: 5, high: 4, new: 3, medium: 2, watch: 1 } as const;
  people.sort((a, b) => score[b.followup_priority] - score[a.followup_priority] || b.days_since_visit - a.days_since_visit);

  return {
    generated_at: now.toISOString(),
    today: people.filter((person) => person.followup_priority !== "watch").slice(0, 8),
    high_priority: people.filter((person) => person.followup_priority === "high"),
    renewal_candidates: people.filter((person) => person.is_renewal_candidate),
    twelve_session_candidates: people.filter((person) => person.is_twelve_session_candidate),
    sleeping_clients: people.filter((person) => person.is_sleeping)
  };
}
