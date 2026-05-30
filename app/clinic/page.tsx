"use client";
import Link from "next/link";
import { ClinicNotice, ClinicShell, planLabels, stageLabels, useClinicFetch } from "@/components/clinic/ClinicShell";

type Dashboard = { today_followups: any[]; recent_clients: any[]; plan_candidates: any[]; case_candidates: any[] };

export default function ClinicDashboardPage() {
  const { data, loading, error } = useClinicFetch<Dashboard>("/api/clinic/dashboard");
  return (
    <ClinicShell title="Clinic Dashboard" subtitle="判讀 → 整理 → 整合 → 接回使用。這裡是客戶紀錄與身體狀態管理中樞。">
      <ClinicNotice loading={loading} error={error} />
      {data && <>
        <section className="clinic-quick bf-section-gap">
          <Link className="bf-primary" href="/clinic/clients/new">快速新增客戶</Link>
          <Link className="bf-primary" href="/clinic/records/new">快速新增服務紀錄</Link>
          <Link className="bf-small-btn" href="/clinic/clients">搜尋客戶入口</Link>
        </section>
        <section className="clinic-grid bf-section-gap">
          <div className="bf-card"><h2 className="bf-section-title">今日待追蹤</h2>{data.today_followups.map((f) => <div className="clinic-item" key={f.id}><strong>{f.client_code}｜{f.display_name}</strong><span>{f.followup_type}｜{f.message_summary}</span><small>{f.next_action}</small></div>)}</div>
          <div className="bf-card"><h2 className="bf-section-title">最近更新的客戶</h2>{data.recent_clients.map((c) => <Link className="clinic-item" href={`/clinic/clients/${c.client_id ?? c.id}`} key={c.client_id ?? c.id}><strong>{c.client_code}｜{c.display_name}</strong><span>{stageLabels[c.current_stage] ?? c.current_stage}｜{c.latest_main_complaint ?? c.main_issue}</span></Link>)}</div>
          <div className="bf-card"><h2 className="bf-section-title">下一步方案候選</h2>{data.plan_candidates.map((p) => <div className="clinic-item" key={p.id}><strong>{planLabels[p.suggested_plan_type] ?? p.suggested_plan_type}｜{p.plan_score}</strong><span>{p.display_name}｜{p.trigger_reason}</span></div>)}</div>
          <div className="bf-card"><h2 className="bf-section-title">案例素材候選</h2>{data.case_candidates.map((c) => <div className="clinic-item" key={c.service_record_id}><strong>{c.client_code}｜{c.service_date}</strong><span>{c.main_complaint}</span><small>{c.after_change}</small></div>)}</div>
        </section>
      </>}
    </ClinicShell>
  );
}
