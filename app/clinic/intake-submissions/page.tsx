"use client";

import { useState } from "react";
import { ClinicNotice, ClinicShell, useClinicFetch } from "@/components/clinic/ClinicShell";

type CandidateClient = { id: string; display_name?: string | null; birthday?: string | null; phone?: string | null; line_id?: string | null; instagram?: string | null; last_session_date?: string | null; aliases?: string[]; identifiers?: Array<{ identifier_type: string; identifier_value?: string | null; normalized_value?: string | null }> };
type IntakeSubmission = { id: string; created_at: string; display_name: string; line_id?: string | null; phone?: string | null; goals?: string[] | null; body_locations?: string[] | null; duration?: string | null; comfort_score?: number | null; state_trend?: string | null; service_interest?: string | null; preferred_place?: string | null; preferred_time_note?: string | null; note?: string | null; status?: string | null; resolution_status?: string | null; resolution_reason?: string | null; birthday?: string | null; instagram?: string | null; candidate_client_ids?: string[] | null };
type IntakeResponse = { submissions: IntakeSubmission[]; candidate_clients?: CandidateClient[] };
function formatDate(dateText: string) { return dateText ? new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(new Date(dateText)) : "—"; }
function mask(value?: string | null) { if (!value) return "—"; return value.length <= 4 ? "••••" : `${"•".repeat(Math.max(2, value.length - 4))}${value.slice(-4)}`; }
function joinList(items?: string[] | null) { return items?.length ? items.join("、") : "—"; }
function last4(client: CandidateClient) { return [client.phone, client.line_id, client.instagram, ...(client.identifiers ?? []).map((item) => item.normalized_value || item.identifier_value)].filter(Boolean).map((v) => mask(v)).join(" / ") || "—"; }
export default function IntakeSubmissionsPage() {
  const { data, loading, error, reload } = useClinicFetch<IntakeResponse>("/api/clinic/intake-submissions");
  const submissions = data?.submissions ?? [];
  const candidateMap = new Map((data?.candidate_clients ?? []).map((client) => [client.id, client]));
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const filtered = submissions.filter((s) => filter === "all" || (filter === "new" ? s.resolution_status === "created_new" : filter === "linked" ? s.resolution_status === "linked_existing" : filter === "review" ? s.resolution_status === "needs_review" : s.resolution_status === "resolved_manually"));
  async function resolve(submission: IntakeSubmission, action: string, clientId?: string) {
    setBusy(`${submission.id}:${action}:${clientId ?? "new"}`); setMessage("");
    try {
      const res = await fetch(`/api/clinic/intake-submissions/${submission.id}/resolve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, clientId, resolutionReason: `manual_${action}` }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "人工處理失敗");
      setMessage("人工處理已保存。"); await reload();
    } catch (err) { setMessage(err instanceof Error ? err.message : "人工處理失敗"); }
    finally { setBusy(null); }
  }
  return <ClinicShell title="問卷回覆列表" subtitle="公開 /intake 送出的預約前狀態整理表會進到這裡，方便 Gavin 手動整理成新客資料、預約前狀態與後續追蹤候選。">
    <ClinicNotice loading={loading} error={error} />
    {message && <div className="bf-card">{message}</div>}
    {!loading && !error && <section className="bf-card bf-section-gap">
      <div className="clinic-actions"><a className="bf-primary" href="/intake" target="_blank" rel="noreferrer">開啟公開問卷</a>{[["all", "全部"], ["new", "新客戶"], ["linked", "已連結既有客戶"], ["review", "待辨認"], ["manual", "已人工處理"]].map(([value, label]) => <button className={filter === value ? "bf-primary" : "bf-secondary"} key={value} type="button" onClick={() => setFilter(value)}>{label}</button>)}</div>
      <div className="bf-table-wrap bf-section-gap"><table className="bf-admin-table"><thead><tr><th>送出時間</th><th>客戶</th><th>想處理 / 位置</th><th>狀態傾向</th><th>預約偏好</th><th>備註 / 人工辨認</th></tr></thead><tbody>
        {filtered.map((submission) => { const candidates = (submission.candidate_client_ids ?? []).map((id) => candidateMap.get(id)).filter(Boolean) as CandidateClient[]; return <tr key={submission.id}>
          <td>{formatDate(submission.created_at)}<br /><span className="bf-tag">{submission.resolution_status ?? submission.status ?? "new"}</span><br /><small>{submission.resolution_reason || "—"}</small></td>
          <td><strong>{submission.display_name}</strong><br />生日：{submission.birthday || "—"}<br />LINE：{mask(submission.line_id)}<br />電話：{mask(submission.phone)}<br />IG：{mask(submission.instagram)}</td>
          <td>{joinList(submission.goals)}<br /><small>{joinList(submission.body_locations)}｜{submission.duration || "—"}｜{submission.comfort_score ?? "—"}</small></td>
          <td>{submission.state_trend || "—"}</td><td>{submission.service_interest || "—"}<br /><small>{submission.preferred_place || "—"}｜{submission.preferred_time_note || "—"}</small></td>
          <td>{submission.note || "—"}{submission.resolution_status === "needs_review" && <div className="bf-section-gap"><strong>可能客戶</strong>{candidates.length ? candidates.map((client) => <div className="clinic-item" key={client.id}><strong>{client.display_name || client.id}</strong><span>aliases：{client.aliases?.join("、") || "—"}</span><small>生日：{client.birthday || "—"}｜末四碼：{last4(client)}｜最近服務：{client.last_session_date || "—"}</small><div className="clinic-actions"><button className="bf-secondary" disabled={!!busy} type="button" onClick={() => resolve(submission, "link_existing", client.id)}>連結到此客戶</button><button className="bf-secondary" disabled={!!busy} type="button" onClick={() => resolve(submission, "add_alias", client.id)}>加入別名</button></div></div>) : <p>目前沒有候選客戶。</p>}<div className="clinic-actions"><button className="bf-secondary" disabled={!!busy} type="button" onClick={() => resolve(submission, "create_new")}>建立新客戶</button><button className="bf-secondary" disabled={!!busy} type="button" onClick={() => resolve(submission, "keep_separate")}>保持分開</button></div><small>人工操作會保存 resolved_at、resolved_by、resolution_reason；不提供一鍵合併 clients。</small></div>}</td>
        </tr>; })}
        {!filtered.length && <tr><td colSpan={6}>目前尚無問卷回覆。可先從 /intake 測試送出。</td></tr>}
      </tbody></table></div>
    </section>}
  </ClinicShell>;
}
