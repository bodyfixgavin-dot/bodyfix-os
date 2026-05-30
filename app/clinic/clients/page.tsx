"use client";
import Link from "next/link";
import { useState } from "react";
import { ClinicNotice, ClinicShell, stageLabels, useClinicFetch } from "@/components/clinic/ClinicShell";

type ClientsData = { clients: any[] };
export default function ClinicClientsPage() {
  const [q, setQ] = useState("");
  const { data, loading, error } = useClinicFetch<ClientsData>(`/api/clinic/clients${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  return <ClinicShell title="客戶列表" subtitle="用客戶代號、暱稱、LINE、IG、電話或主要問題快速回到客戶狀態。">
    <section className="bf-card bf-section-gap bf-form"><label>搜尋客戶<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="display name / nickname / line / instagram / phone / BF-xxxxxx" /></label></section>
    <ClinicNotice loading={loading} error={error} />
    {data && <section className="bf-card bf-section-gap bf-table-wrap"><table className="bf-admin-table"><thead><tr><th>客戶代號</th><th>暱稱 / 顯示名稱</th><th>城市</th><th>最近服務</th><th>目前階段</th><th>主要問題簡述</th><th>優先級</th><th>下次追蹤</th></tr></thead><tbody>{data.clients.map((c) => <tr key={c.client_id ?? c.id}><td><Link href={`/clinic/clients/${c.client_id ?? c.id}`}>{c.client_code}</Link></td><td>{c.nickname ? `${c.nickname} / ` : ""}{c.display_name}</td><td>{c.city ?? c.home_city}</td><td>{c.last_session_date ?? "—"}</td><td>{stageLabels[c.current_stage] ?? c.current_stage}</td><td>{c.latest_main_complaint ?? c.main_issue ?? "—"}</td><td>{c.priority}</td><td>{c.next_followup_date ?? "—"}</td></tr>)}</tbody></table></section>}
  </ClinicShell>;
}
