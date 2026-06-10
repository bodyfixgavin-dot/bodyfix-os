"use client";

import Link from "next/link";
import { useState } from "react";
import { ClinicNotice, ClinicShell, useClinicFetch } from "@/components/clinic/ClinicShell";
import type { FollowupClient, FollowupDashboardData } from "@/lib/followup-dashboard";

type Action = "complete" | "postpone";
type SectionProps = {
  title: string;
  eyebrow: string;
  empty: string;
  items: FollowupClient[];
  onAction: (item: FollowupClient, action: Action) => Promise<void>;
  onCopy: (item: FollowupClient) => Promise<void>;
  copiedId: string;
  busyId: string;
  actionable?: boolean;
};

function dateLabel(value: string | null) {
  return value ? value.replaceAll("-", "/") : "未設定日期";
}

function FollowupCard({ item, onAction, onCopy, copiedId, busyId, actionable = true }: Omit<SectionProps, "title" | "eyebrow" | "empty" | "items"> & { item: FollowupClient }) {
  const busy = busyId === item.item_id;
  return <article className="followup-card">
    <div className="followup-card-head">
      <div>
        <div className="followup-badges"><span className={`followup-priority priority-${item.priority.toLowerCase()}`}>{item.priority}</span><span className="followup-category">{item.category_label}</span></div>
        <h3>{item.client_name}</h3>
        <small>{item.client_code ?? "尚未設定客戶編號"} · 累計 {item.service_count} 次紀錄</small>
      </div>
      <strong className="followup-due"><small>{item.source === "package_candidate" ? "方案候選" : "預計聯繫"}</small>{dateLabel(item.due_date)}</strong>
    </div>
    <dl className="followup-meta">
      <div><dt>最近紀錄</dt><dd>{dateLabel(item.last_visit_date)}{item.days_since_visit === null ? "" : ` · ${item.days_since_visit} 天前`}</dd></div>
      {item.package_label ? <div><dt>建議方案</dt><dd>{item.package_label}</dd></div> : null}
      <div><dt>提醒原因</dt><dd>{item.reason}</dd></div>
    </dl>
    <div className="followup-message"><span>suggested_message</span><p>{item.suggested_message}</p></div>
    <div className="followup-actions">
      <button className="bf-primary" type="button" onClick={() => onCopy(item)}>{copiedId === item.item_id ? "已複製" : "複製私訊"}</button>
      {actionable ? <><button className="bf-small-btn" type="button" disabled={busy} onClick={() => onAction(item, "complete")}>{busy ? "更新中…" : "標記已追蹤"}</button><button className="bf-small-btn" type="button" disabled={busy} onClick={() => onAction(item, "postpone")}>延後 7 天</button></> : null}
      <Link className="bf-small-btn" href={`/clinic/clients/${item.client_id}`}>查看客戶檔案</Link>
    </div>
  </article>;
}

function FollowupSection({ title, eyebrow, empty, items, ...props }: SectionProps) {
  return <section className="followup-section bf-section-gap">
    <header><div><span>{eyebrow}</span><h2>{title}</h2></div><strong>{items.length}</strong></header>
    {items.length ? <div className="followup-card-grid">{items.map((item) => <FollowupCard key={`${item.source}-${item.item_id}`} item={item} {...props} />)}</div> : <div className="followup-empty">{empty}</div>}
  </section>;
}

export default function FollowupDashboard() {
  const { data, loading, error, diagnostics, reload } = useClinicFetch<FollowupDashboardData>("/api/clinic/followups");
  const [copiedId, setCopiedId] = useState("");
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");

  async function copyMessage(item: FollowupClient) {
    await navigator.clipboard.writeText(item.suggested_message);
    setCopiedId(item.item_id);
    window.setTimeout(() => setCopiedId(""), 1800);
  }

  async function updateTask(item: FollowupClient, action: Action) {
    setActionError("");
    setBusyId(item.item_id);
    const delayed = new Date();
    delayed.setDate(delayed.getDate() + 7);
    const response = await fetch(`/api/clinic/followups/${item.item_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, due_date: delayed.toISOString().slice(0, 10) })
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setActionError(result.error ?? "更新提醒失敗，請稍後再試。");
      setBusyId("");
      return;
    }
    await reload();
    setBusyId("");
  }

  const shared = { onAction: updateTask, onCopy: copyMessage, copiedId, busyId };
  return <ClinicShell title="追蹤提醒儀表板" subtitle="直接整理現有追蹤任務與方案候選，讓今天的聯繫順序一眼清楚。">
    <ClinicNotice loading={loading} error={error} diagnostics={diagnostics} />
    {actionError ? <div className="bf-notice bf-section-gap" role="alert">{actionError}</div> : null}
    {data ? <>
      <section className="followup-summary bf-section-gap">
        <div><span>今日待追蹤</span><strong>{data.today.length}</strong><small>今天到期或尚未設定日期</small></div>
        <div><span>P1 高優先回訪</span><strong>{data.p1.length}</strong><small>優先完成本輪聯繫</small></div>
        <div><span>P2 中優先回訪</span><strong>{data.p2.length}</strong><small>依排程持續關心</small></div>
        <div><span>沉睡客戶</span><strong>{data.dormant_clients.length}</strong><small>dormant_client 提醒</small></div>
        <div><span>方案候選</span><strong>{data.package_candidates.length}</strong><small>來自 package_candidates</small></div>
      </section>
      <p className="followup-data-note">目前讀取：{data.counts.clients} 位客戶、{data.counts.service_records} 筆服務紀錄、{data.counts.open_tasks} 筆 open 任務、{data.counts.package_candidates} 位方案候選。</p>
      <FollowupSection title="今日待追蹤" eyebrow="Today" empty="今天沒有待追蹤提醒。" items={data.today} {...shared} />
      <FollowupSection title="P1 高優先回訪" eyebrow="Priority one" empty="目前沒有 P1 回訪提醒。" items={data.p1} {...shared} />
      <FollowupSection title="P2 中優先回訪" eyebrow="Priority two" empty="目前沒有 P2 回訪提醒。" items={data.p2} {...shared} />
      <FollowupSection title="沉睡客戶" eyebrow="Dormant client" empty="目前沒有 dormant_client 提醒。" items={data.dormant_clients} {...shared} />
      <FollowupSection title="方案候選" eyebrow="Package candidates" empty="目前沒有方案候選。" items={data.package_candidates} {...shared} actionable={false} />
    </> : null}
  </ClinicShell>;
}
