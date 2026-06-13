import Link from "next/link";

export default function ClientPortalPage() {
  return (
    <main className="portal-page portal-placeholder-page">
      <section className="portal-placeholder-card">
        <span className="portal-placeholder-mark">BF</span>
        <p className="portal-kicker">Coming Soon</p>
        <h1>BodyFix Client Portal</h1>
        <p>未來可查看自己的服務摘要、居家建議與身體狀態進展。</p>
        <strong>目前功能開發中。</strong>
        <Link className="portal-button" href="/">返回 BodyFix OS <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}
