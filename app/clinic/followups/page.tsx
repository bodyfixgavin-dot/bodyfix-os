"use client";
import { ClinicNotice, ClinicShell, useClinicFetch } from "@/components/clinic/ClinicShell";
type Data = { followups: any[] };
export default function FollowupsPage() {
  const { data, loading, error, reload } = useClinicFetch<Data>("/api/clinic/followups");
  async function done(id: string) { await fetch(`/api/clinic/followups/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_done: true, response_status: "booked" }) }); reload(); }
  return <ClinicShell title="追蹤提醒" subtitle="Day 0 / Day 1 / Day 3 / Day 7 等提醒先集中管理，V1 不做 LINE 自動發送。"><ClinicNotice loading={loading} error={error} />{data && <section className="bf-card bf-section-gap">{data.followups.map((f) => <div className="clinic-item" key={f.id}><strong>{f.scheduled_date}｜{f.client_code}｜{f.display_name}</strong><span>{f.message_summary}</span><small>{f.response_status}｜{f.next_action}</small><button className="bf-small-btn" type="button" onClick={() => done(f.id)}>標記完成</button></div>)}</section>}</ClinicShell>;
}
