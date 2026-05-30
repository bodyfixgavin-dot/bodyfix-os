"use client";
import { ClinicNotice, ClinicShell, useClinicFetch } from "@/components/clinic/ClinicShell";
type Data = { case_assets: any[]; case_candidates: any[] };
export default function CasesPage() {
  const { data, loading, error } = useClinicFetch<Data>("/api/clinic/cases");
  return <ClinicShell title="案例素材" subtitle="只保存可用於整理、銷售頁或社群的素材；AI 摘要必須去識別化。"><ClinicNotice loading={loading} error={error} />{data && <section className="clinic-grid bf-section-gap"><div className="bf-card"><h2 className="bf-section-title">已建立案例素材</h2>{data.case_assets.map((c) => <div className="clinic-item" key={c.id}><strong>{c.case_code}｜{c.case_type}</strong><span>{c.ai_summary}</span><small>{c.publish_permission}｜{c.content_status}</small></div>)}</div><div className="bf-card"><h2 className="bf-section-title">服務紀錄候選</h2>{data.case_candidates.map((c) => <div className="clinic-item" key={c.service_record_id}><strong>{c.client_code}｜{c.service_date}</strong><span>{c.main_complaint}</span><small>{c.after_change}</small></div>)}</div></section>}</ClinicShell>;
}
