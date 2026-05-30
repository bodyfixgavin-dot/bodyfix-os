"use client";
import { ClinicNotice, ClinicShell, planLabels, useClinicFetch } from "@/components/clinic/ClinicShell";
type Data = { plan_candidates: any[] };
export default function PlanCandidatesPage() {
  const { data, loading, error } = useClinicFetch<Data>("/api/clinic/plan-candidates");
  return <ClinicShell title="下一步方案候選" subtitle="包含單次追蹤、3 次短週期整理、12 次完整計畫、續航 / 訂閱、教練整合與動作整合訓練進階。"><ClinicNotice loading={loading} error={error} />{data && <section className="bf-card bf-section-gap bf-table-wrap"><table className="bf-admin-table"><thead><tr><th>分數</th><th>客戶</th><th>候選方案</th><th>觸發原因</th><th>建議說法</th><th>狀態</th></tr></thead><tbody>{data.plan_candidates.map((p) => <tr key={p.id}><td>{p.plan_score}</td><td>{p.client_code}｜{p.display_name}</td><td>{planLabels[p.suggested_plan_type] ?? p.suggested_plan_type}</td><td>{p.trigger_reason}</td><td>{p.suggested_pitch}</td><td>{p.status}</td></tr>)}</tbody></table></section>}</ClinicShell>;
}
