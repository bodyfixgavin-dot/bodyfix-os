import { redirect } from "next/navigation";
import { createSupabaseUserServerClient, getMissingSupabaseBrowserEnvVars } from "@/lib/supabase/server";
import { ClientLoginForm } from "./ClientLoginForm";

export default async function ClientLoginPage({ searchParams }: { searchParams?: Promise<{ error?: string; next?: string }> }) {
  const supabase = await createSupabaseUserServerClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const params = await searchParams;

  if (data.user) redirect(params?.next || "/client");

  return (
    <main className="portal-page client-portal-page">
      <section className="client-login-card">
        <p className="portal-kicker">BodyFix Client Portal</p>
        <h1>登入你的客戶入口</h1>
        <p>登入成功後才會讀取已連結的服務摘要、居家建議與近期狀態。</p>
        {params?.error === "oauth_callback_failed" ? (
          <p className="client-state-card" role="alert">登入驗證未完成，請重新嘗試。</p>
        ) : null}
        <ClientLoginForm missingEnv={getMissingSupabaseBrowserEnvVars()} />
        <p className="client-portal-fineprint">LINE 登入即將開放；目前僅顯示已可安全運作的登入方式。</p>
      </section>
    </main>
  );
}
