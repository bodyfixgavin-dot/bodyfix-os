"use client";

import Link from "next/link";
import { useState } from "react";
import { ClinicNotice, ClinicShell, useClinicFetch } from "@/components/clinic/ClinicShell";
import type { FollowupClient } from "@/lib/followup-dashboard";

type DashboardData = {
  generated_at: string;
  today: FollowupClient[];
  high_priority: FollowupClient[];
  renewal_candidates: FollowupClient[];
  twelve_session_candidates: FollowupClient[];
  sleeping_clients: FollowupClient[];
};

type SectionProps = { title: string; eyebrow: string; empty: string; clients: FollowupClient[]; onAction: (client: FollowupClient, action: "done" | "delay") => Promise<void>; onCopy: (client: FollowupClient) => Promise<void>; copiedId: string };

const priorityLabels = { high: "高優先", medium: "中優先", new: "新客追蹤", sleeping: "沉睡客戶", watch: "持續觀察" };

function FollowupCard({ client, onAction, onCopy, copiedId }: { client: FollowupClient; onAction: SectionProps["onAction"]; onCopy: SectionProps["onCopy"]; copiedId: string }) {
  return <article className="followup-card">
    <div className="followup-card-head"><div><span className={`followup-priority priority-${client.followup_priority}`}>{priorityLabels[client.followup_priority]}</span><h3>{client.client_name}</h3><small>{client.client_code ?? "尚未設定客戶編號"} · 累計 {client.service_count} 次</small></div><strong className="followup-days">{client.days_since_visit}<small>天未回訪</small></strong></div>
    <dl className="followup-meta"><div><dt>上次服務</dt><dd>{client.last_visit_date} · {client.last_service_type}</dd></div><div><dt>主要標籤</dt><dd className="followup-tags">{client.main_tags.map((tag) => <span key={tag}>{tag}</span>)}</dd></div><div><dt>上次整理重點</dt><dd>{client.last_notes}</dd></div><div><dt>建議下一步</dt><dd>{client.next_recommended_action}</dd></div></dl>
    <div className="followup-message"><span>可複製私訊文案</span><p>{client.message}</p></div>
    <div className="followup-actions"><button className="bf-primary" type="button" onClick={() => onCopy(client)}>{copiedId === client.client_id ? "已複製" : "複製私訊"}</button><button className="bf-small-btn" type="button" onClick={() => onAction(client, "done")}>標記已追蹤</button><button className="bf-small-btn" type="button" onClick={() => onAction(client, "delay")}>延後 7 天</button><Link className="bf-small-btn" href={`/clinic/clients/${client.client_id}`}>查看客戶檔案</Link></div>
  </article>;
}

function FollowupSection({ title, eyebrow, empty, clients, onAction, onCopy, copiedId }: SectionProps) {
  return <section className="followup-section bf-section-gap"><header><div><span>{eyebrow}</span><h2>{title}</h2></div><strong>{clients.length}</strong></header>{clients.length ? <div className="followup-card-grid">{clients.map((client) => <FollowupCard key={client.client_id} client={client} onAction={onAction} onCopy={onCopy} copiedId={copiedId} />)}</div> : <div className="followup-empty">{empty}</div>}</section>;
}

export default function FollowupDashboard() {
  const { data, loading, error, diagnostics, reload } = useClinicFetch<DashboardData>("/api/clinic/followups");
  const [copiedId, setCopiedId] = useState("");
  const [actionError, setActionError] = useState("");

  async function copyMessage(client: FollowupClient) {
    await navigator.clipboard.writeText(client.message);
    setCopiedId(client.client_id);
    window.setTimeout(() => setCopiedId(""), 1800);
  }

  async function updateTask(client: FollowupClient, action: "done" | "delay") {
    setActionError("");
    const delayed = new Date();
    delayed.setUTCDate(delayed.getUTCDate() + 7);
    const body = action === "done"
      ? { is_done: true, sent_at: new Date().toISOString(), response_status: "no_reply", next_action: "已完成本次主動追蹤" }
      : { scheduled_date: delayed.toISOString().slice(0, 10), next_action: "延後 7 天再追蹤", is_done: false };
    const createBody = { ...body, client_id: client.client_id, followup_type: action === "delay" ? "day7" : "other", message_summary: client.message };
    const response = await fetch(client.followup_id ? `/api/clinic/followups/${client.followup_id}` : "/api/clinic/followups", { method: client.followup_id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(client.followup_id ? body : createBody) });
    if (!response.ok) { const result = await response.json().catch(() => ({})); setActionError(result.error ?? "更新追蹤狀態失敗，請稍後再試。"); return; }
    await reload();
  }

  return <ClinicShell title="追蹤提醒儀表板" subtitle="用 BodyFix 規則整理今天該關心的人、續約機會與 12 次完整計畫候選。V1 不使用 AI API，也不自動發送訊息。">
    <ClinicNotice loading={loading} error={error} diagnostics={diagnostics} />
    {actionError ? <div className="bf-notice bf-section-gap" role="alert">{actionError}</div> : null}
    {data ? <>
      <section className="followup-summary bf-section-gap"><div><span>今日待追蹤</span><strong>{data.today.length}</strong><small>先從最需要關心的人開始</small></div><div><span>高優先回訪</span><strong>{data.high_priority.length}</strong><small>超過 14 天且已有回訪紀錄</small></div><div><span>續約 / 回購候選</span><strong>{data.renewal_candidates.length}</strong><small>近 30 天內累計 3 次以上</small></div><div><span>沉睡客戶</span><strong>{data.sleeping_clients.length}</strong><small>超過 30 天未回訪</small></div></section>
      <FollowupSection title="今日待追蹤" eyebrow="Daily focus" empty="今天沒有需要主動追蹤的客戶，可以安心整理其他營運工作。" clients={data.today} onAction={updateTask} onCopy={copyMessage} copiedId={copiedId} />
      <FollowupSection title="高優先回訪" eyebrow="High priority" empty="目前沒有高優先回訪客戶。" clients={data.high_priority} onAction={updateTask} onCopy={copyMessage} copiedId={copiedId} />
      <FollowupSection title="續約 / 套票候選" eyebrow="Renewal opportunities" empty="目前沒有符合規則的續約候選。" clients={data.renewal_candidates} onAction={updateTask} onCopy={copyMessage} copiedId={copiedId} />
      <FollowupSection title="12 次計畫候選" eyebrow="Fascia Chain Reset" empty="目前沒有符合規則的 12 次完整計畫候選。" clients={data.twelve_session_candidates} onAction={updateTask} onCopy={copyMessage} copiedId={copiedId} />
      <FollowupSection title="沉睡客戶" eyebrow="Reconnect" empty="目前沒有超過 30 天未回訪的客戶。" clients={data.sleeping_clients} onAction={updateTask} onCopy={copyMessage} copiedId={copiedId} />
    </> : null}
  </ClinicShell>;
}
