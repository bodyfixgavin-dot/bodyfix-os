import Link from "next/link";
import { PulseShell } from "@/components/pulse/PulseShell";
import { getPulseMetrics, money } from "@/lib/pulse/data";

const copy = {
  危險: "預約池偏薄，今天先回訪舊客。",
  注意: "預約量普通，建議補 2 位本週客。",
  穩定: "目前節奏穩，維持回訪與排程。",
};

export const dynamic = "force-dynamic";

export default async function PulseDashboardPage() {
  const metrics = await getPulseMetrics();

  return (
    <PulseShell title="今天，店有在呼吸嗎？">
      <div className={`status status-${metrics.status}`}>
        <div>
          <small>{metrics.date} · 今日狀態</small>
          <strong>{metrics.status}</strong>
        </div>
        <p>{copy[metrics.status]}</p>
      </div>

      <section className="hero-metric">
        <span>今天還差</span>
        <strong>{money(metrics.todayRemaining)}</strong>
        <p>{metrics.todayRemaining === 0 ? "今日已達標，漂亮收工。" : "先把今天做好，月底就不會追著你跑。"}</p>
        <div>
          <span>已收 <b>{money(metrics.todayIncome)}</b></span>
          <span>目標 <b>{money(metrics.todayTarget)}</b></span>
        </div>
      </section>

      <h2 className="section-label">本月節奏</h2>
      <section className="metric-grid">
        <article><span>本月已收</span><b>{money(metrics.monthIncome)}</b></article>
        <article><span>本月目標</span><b>{money(metrics.monthTarget)}</b></article>
        <article><span>本月還差</span><b>{money(metrics.monthRemaining)}</b></article>
        <article><span>可工作日</span><b>{metrics.remainingWorkdays}<small> 天</small></b></article>
      </section>

      <section className="appointments-card">
        <div>
          <small>NEXT 7 DAYS</small>
          <h2>未來 7 天預約</h2>
          <p>已排與待確認的預約池</p>
        </div>
        <strong>{metrics.appointmentsNext7Days}<small> 位</small></strong>
      </section>

      <div className="section-row">
        <h2 className="section-label">今天先做什麼</h2>
        <Link href="/admin/pulse/income">記收入 →</Link>
      </div>
      <section className="followup-list">
        <article>
          <span className="priority">1</span>
          <div>
            <b>回訪池</b>
            <p>v0.9 尚未接正式回訪資料，先保留空狀態。</p>
          </div>
          <Link href="/admin/pulse/followups">查看</Link>
        </article>
      </section>
    </PulseShell>
  );
}
