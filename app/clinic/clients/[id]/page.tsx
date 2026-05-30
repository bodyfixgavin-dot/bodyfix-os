"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ClinicNotice, ClinicShell, planLabels, stageLabels, useClinicFetch } from "@/components/clinic/ClinicShell";

type ClientDetail = { client: any; service_records: any[]; homework_tasks: any[]; followups: any[]; plan_candidates: any[]; case_assets: any[] };
export default function ClinicClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useClinicFetch<ClientDetail>(`/api/clinic/clients/${id}`);
  return <ClinicShell title="客戶個人頁" subtitle="把服務紀錄、回家作業、追蹤、方案候選與案例素材集中管理。">
    <ClinicNotice loading={loading} error={error} />
    {data && <>
      <section className="bf-card bf-section-gap"><h2 className="bf-section-title">基本資料</h2><div className="clinic-detail-grid"><p><b>客戶代號</b><br />{data.client.client_code}</p><p><b>顯示名稱</b><br />{data.client.display_name}</p><p><b>目前階段</b><br />{stageLabels[data.client.current_stage] ?? data.client.current_stage}</p><p><b>總來訪次數</b><br />{data.client.total_sessions ?? 0}</p><p><b>主要問題</b><br />{data.client.main_issue ?? "—"}</p><p><b>下一次追蹤</b><br />{data.client.next_followup_date ?? "—"}</p></div><Link className="bf-small-btn" href={`/clinic/clients/${id}/summary`}>去識別化摘要 / 列印頁</Link></section>
      <section className="clinic-grid bf-section-gap"><div className="bf-card"><h2 className="bf-section-title">歷次服務紀錄 timeline</h2>{data.service_records.map((r) => <div className="clinic-item" key={r.id}><strong>{r.service_date}｜{r.service_name_snapshot ?? r.service_code}</strong><span>判讀：{r.main_complaint}</span><span>整理：{r.processed_area}</span><span>整理後變化：{r.after_change}</span><small>下次重點：{r.next_focus}</small></div>)}</div><div className="bf-card"><h2 className="bf-section-title">回家作業</h2>{data.homework_tasks.map((h) => <div className="clinic-item" key={h.id}><strong>{h.status}</strong><span>{h.breathing_cue}</span><span>{h.movement_cue}</span></div>)}</div><div className="bf-card"><h2 className="bf-section-title">追蹤紀錄</h2>{data.followups.map((f) => <div className="clinic-item" key={f.id}><strong>{f.scheduled_date}｜{f.followup_type}</strong><span>{f.message_summary}</span><small>{f.response_status}｜{f.next_action}</small></div>)}</div><div className="bf-card"><h2 className="bf-section-title">方案候選</h2>{data.plan_candidates.map((p) => <div className="clinic-item" key={p.id}><strong>{planLabels[p.suggested_plan_type] ?? p.suggested_plan_type}｜{p.plan_score}</strong><span>{p.trigger_reason}</span><small>{p.suggested_pitch}</small></div>)}</div><div className="bf-card"><h2 className="bf-section-title">案例素材</h2>{data.case_assets.map((c) => <div className="clinic-item" key={c.id}><strong>{c.case_code}｜{c.case_type}</strong><span>{c.ai_summary}</span></div>)}</div></section>
    </>}
  </ClinicShell>;
}
