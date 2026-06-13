import Link from "next/link";

type SupabaseNotConnectedStateProps = {
  showAdminLink?: boolean;
};

const envVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const setupChecks = [
  "NEXT_PUBLIC_SUPABASE_URL 必須長得像 https://PROJECT_REF.supabase.co",
  "NEXT_PUBLIC_SUPABASE_URL 不可包含 /rest/v1、/sql、/dashboard 或任何額外 path",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY 必須設定，但畫面不會顯示 secret value"
];

export function SupabaseNotConnectedState({ showAdminLink = true }: SupabaseNotConnectedStateProps) {
  return (
    <main className="bf-container bf-os-page">
      <section className="bf-hero bf-status-hero" aria-labelledby="supabase-status-title">
        <div className="bf-brand"><span className="bf-logo-box">BF</span> BodyFix Operating System</div>
        <p className="bf-kicker">System setup</p>
        <h1 id="supabase-status-title">BodyFix OS 尚未連接資料庫</h1>
        <p className="bf-subtitle">系統已啟動，但尚未完成 Supabase 環境設定。</p>
        <p className="bf-body-copy">
          請先在 Vercel Environment Variables 設定以下環境變數，完成後重新部署：
        </p>
        <div className="bf-code-pill-row" aria-label="Required Supabase environment variables">
          {envVars.map((envVar) => (
            <code className="bf-code-pill" key={envVar}>{envVar}</code>
          ))}
        </div>
        <div className="bf-notice bf-section-gap">
          這是系統設定提示，不代表網站故障。完成環境變數設定後，Dashboard 與 BodyFix OS 模組即可讀取資料。
          <ul>
            {setupChecks.map((check) => <li key={check}>{check}</li>)}
          </ul>
        </div>
        <div className="bf-actions">
          <Link className="bf-primary bf-link-button" href="/">返回 BodyFix OS Hub</Link>
          {showAdminLink ? <Link className="bf-secondary bf-link-button" href="/admin">前往 Admin Login</Link> : null}
        </div>
      </section>
    </main>
  );
}
