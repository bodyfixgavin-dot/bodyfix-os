"use client";

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
};

type IntakeResponse = { submissions: IntakeSubmission[] };

function formatDate(dateText: string) {
  if (!dateText) return "—";
  return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(new Date(dateText));
}

function joinList(items?: string[] | null) {
  return items?.length ? items.join("、") : "—";
}

export default function IntakeSubmissionsPage() {
  const { data, loading, error } = useClinicFetch<IntakeResponse>("/api/clinic/intake-submissions");
  const submissions = data?.submissions ?? [];

  return (
    <ClinicShell title="問卷回覆列表" subtitle="公開 /intake 送出的預約前狀態整理表會進到這裡，方便 Gavin 手動整理成新客資料、預約前狀態與後續追蹤候選。">
      <ClinicNotice loading={loading} error={error} />
      {!loading && !error && (
        <section className="bf-card bf-section-gap">
          <div className="clinic-actions">
            <a className="bf-primary" href="/intake" target="_blank" rel="noreferrer">開啟公開問卷</a>
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
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{formatDate(submission.created_at)}<br /><span className="bf-tag">{submission.status ?? "new"}</span></td>
                    <td><strong>{submission.display_name}</strong><br />LINE：{submission.line_id || "—"}<br />電話：{submission.phone || "—"}</td>
                    <td>{joinList(submission.goals)}<br /><small>{joinList(submission.body_locations)}｜{submission.duration || "—"}｜{submission.comfort_score ?? "—"}</small></td>
                    <td>{submission.state_trend || "—"}</td>
                    <td>{submission.service_interest || "—"}<br /><small>{submission.preferred_place || "—"}｜{submission.preferred_time_note || "—"}</small></td>
                    <td>{submission.note || "—"}</td>
                  </tr>
                ))}
                {!submissions.length && (
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
