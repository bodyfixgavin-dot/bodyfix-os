"use client";

import { useState } from "react";
import { ClinicNotice, ClinicShell, useClinicFetch } from "@/components/clinic/ClinicShell";

type IntakeSubmission = {
  id: string;
  created_at: string;
  display_name: string;
  line_id?: string | null;
  phone?: string | null;
  goals?: string[] | null;
  body_locations?: string[] | null;
  duration?: string | null;
  comfort_score?: number | null;
  state_trend?: string | null;
  service_interest?: string | null;
  preferred_place?: string | null;
  preferred_time_note?: string | null;
  note?: string | null;
  status?: string | null;
  resolution_status?: string | null;
  resolution_reason?: string | null;
  birthday?: string | null;
  instagram?: string | null;
  candidate_client_ids?: string[] | null;
};

type IntakeResponse = { submissions: IntakeSubmission[] };

function formatDate(dateText: string) {
  if (!dateText) return "—";
  return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(new Date(dateText));
}

function mask(value?: string | null) {
  if (!value) return "—";
  return value.length <= 4 ? "••••" : `${"•".repeat(Math.max(2, value.length - 4))}${value.slice(-4)}`;
}

function joinList(items?: string[] | null) {
  return items?.length ? items.join("、") : "—";
}

export default function IntakeSubmissionsPage() {
  const { data, loading, error } = useClinicFetch<IntakeResponse>("/api/clinic/intake-submissions");
  const submissions = data?.submissions ?? [];
  const [filter, setFilter] = useState("all");
  const filtered = submissions.filter((s) => filter === "all" || (filter === "new" ? s.resolution_status === "created_new" : filter === "linked" ? s.resolution_status === "linked_existing" : filter === "review" ? s.resolution_status === "needs_review" : s.resolution_status === "resolved_manually"));

  return (
    <ClinicShell title="問卷回覆列表" subtitle="公開 /intake 送出的預約前狀態整理表會進到這裡，方便 Gavin 手動整理成新客資料、預約前狀態與後續追蹤候選。">
      <ClinicNotice loading={loading} error={error} />
      {!loading && !error && (
        <section className="bf-card bf-section-gap">
          <div className="clinic-actions">
            <a className="bf-primary" href="/intake" target="_blank" rel="noreferrer">開啟公開問卷</a>
            {[ ["all", "全部"], ["new", "新客戶"], ["linked", "已連結既有客戶"], ["review", "待辨認"], ["manual", "已人工處理"] ].map(([value, label]) => <button className={filter === value ? "bf-primary" : "bf-secondary"} key={value} type="button" onClick={() => setFilter(value)}>{label}</button>)}
          </div>
          <div className="bf-table-wrap bf-section-gap">
            <table className="bf-admin-table">
              <thead>
                <tr>
                  <th>送出時間</th>
                  <th>客戶</th>
                  <th>想處理 / 位置</th>
                  <th>狀態傾向</th>
                  <th>預約偏好</th>
                  <th>備註</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((submission) => (
                  <tr key={submission.id}>
                    <td>{formatDate(submission.created_at)}<br /><span className="bf-tag">{submission.resolution_status ?? submission.status ?? "new"}</span><br /><small>{submission.resolution_reason || "—"}</small></td>
                    <td><strong>{submission.display_name}</strong><br />生日：{submission.birthday || "—"}<br />LINE：{mask(submission.line_id)}<br />電話：{mask(submission.phone)}<br />IG：{mask(submission.instagram)}</td>
                    <td>{joinList(submission.goals)}<br /><small>{joinList(submission.body_locations)}｜{submission.duration || "—"}｜{submission.comfort_score ?? "—"}</small></td>
                    <td>{submission.state_trend || "—"}</td>
                    <td>{submission.service_interest || "—"}<br /><small>{submission.preferred_place || "—"}｜{submission.preferred_time_note || "—"}</small></td>
                    <td>{submission.note || "—"}{submission.resolution_status === "needs_review" && <div className="bf-section-gap"><strong>可能客戶</strong><br /><small>{submission.candidate_client_ids?.join("、") || "—"}</small><div className="clinic-actions"><button className="bf-secondary" type="button">連結到此客戶</button><button className="bf-secondary" type="button">建立新客戶</button><button className="bf-secondary" type="button">保持分開</button><button className="bf-secondary" type="button">加入別名</button></div><small>人工操作會保存 resolved_at、resolved_by、resolution_reason；不提供一鍵合併 clients。</small></div>}</td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={6}>目前尚無問卷回覆。可先從 /intake 測試送出。</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </ClinicShell>
  );
}
