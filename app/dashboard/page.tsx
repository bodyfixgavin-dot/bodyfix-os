import Link from "next/link";

const dashboardEntries = [
  {
    title: "客戶與餘額",
    description: "查看客戶資料、剩餘堂數與基本狀態",
    href: "/dashboard/customers",
    status: "MVP",
  },
  {
    title: "服務後快速記錄 v0.2",
    description: "完成服務後快速記錄、扣除餘額、確認收款",
    href: "/dashboard/appointments",
    status: "MVP",
  },
  {
    title: "紫微／塔羅文字單",
    description: "整理文字型解析、諮詢紀錄與後續追蹤",
    href: "/dashboard/readings",
    status: "MVP",
  },
];

export default function DashboardPage() {
  return (
    <main className="bf-container bf-os-page">
      <section className="bf-hero" aria-labelledby="dashboard-title">
        <div className="bf-brand"><span className="bf-logo-box">BF</span> BodyFix OS</div>
        <p className="bf-kicker">Operations overview</p>
        <h1 id="dashboard-title">BodyFix OS Dashboard</h1>
        <p className="bf-subtitle">MVP 管理後台，先完成核心流程。</p>
        <p className="bf-body-copy">
          這裡是 BodyFix OS 的營運總覽入口。目前先保留核心管理流程，後續會逐步整合客戶、餘額、課後紀錄、紫微／塔羅文字單與 AI 營運副駕。
        </p>
      </section>

      <section className="bf-dashboard-grid" aria-label="Dashboard entries">
        {dashboardEntries.map((entry) => (
          <Link className="bf-entry-card" href={entry.href} key={entry.title}>
            <span className="bf-tag">{entry.status}</span>
            <h2>{entry.title}</h2>
            <p>{entry.description}</p>
            <span className="bf-card-arrow">前往 →</span>
          </Link>
        ))}
      </section>

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">MVP 階段提示</h2>
        <p className="bf-body-copy">
          目前為 MVP 階段。請先完成核心流程測試，再逐步開啟完整後台模組。
        </p>
      </section>
    </main>
  );
}
