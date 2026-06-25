export default function ClientPortalLoading() {
  return (
    <main className="portal-page client-portal-page">
      <div className="portal-shell client-portal-shell">
        <section className="client-state-card" aria-live="polite">
          <p className="portal-kicker">BODYFIX CLIENT PORTAL</p>
          <h2>正在確認登入狀態…</h2>
          <p>請稍候，我們正在安全確認你的登入狀態。</p>
        </section>
      </div>
    </main>
  );
}
