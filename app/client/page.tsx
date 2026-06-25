import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseUserServerClient } from "@/lib/supabase/server";
import { loadClientPortalData } from "@/lib/client-portal";
import { signOutClientPortal } from "./actions";
import { CompleteRecommendationButton } from "./_components/CompleteRecommendationButton";

const LOGIN_HREF = "/client/login?next=/client";

type AuthState = "unauthenticated" | "auth_error" | "authenticated";

export default async function ClientPortalPage() {
  const supabase = await createSupabaseUserServerClient();
  if (!supabase) return <ClientShell><StateCard title="系統尚未連線" body="客戶入口需要 Supabase 環境變數才能安全讀取資料。" /></ClientShell>;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const authState: AuthState = userError && !isMissingSessionError(userError) ? "auth_error" : userData.user ? "authenticated" : "unauthenticated";

  if (authState === "auth_error") {
    console.error("[client-portal] auth status check failed", { name: userError?.name, message: userError?.message, status: userError?.status });
    return <ClientShell><StateCard title="登入狀態確認失敗" body="目前無法確認登入狀態，請稍後重新整理或重新登入。" actions={<Link className="portal-button" href={LOGIN_HREF}>登入 Client Portal</Link>} /></ClientShell>;
  }

  if (authState === "unauthenticated" || !userData.user) {
    redirect(LOGIN_HREF);
  }

  const data = await loadPortalDataSafely(supabase, userData.user.id);
  if (data === "error") {
    return <ClientShell><StateCard title="資料讀取失敗" body="請稍後再試；若持續發生，請聯絡服務人員確認帳號權限。" /></ClientShell>;
  }

  if (data.status === "missing_profile") {
    return <ClientShell><StateCard title="帳號尚未連結" body="你的登入帳號尚未連結 BodyFix 客戶檔案，請聯絡 BodyFix 協助確認。" actions={<><Link className="portal-button portal-button-secondary" href="/">返回 BodyFix</Link><form action={signOutClientPortal}><button className="portal-button" type="submit">登出</button></form></>} /></ClientShell>;
  }

  if (data.status === "inactive_profile") {
    return <ClientShell><StateCard title="客戶入口未啟用" body="此客戶入口目前未啟用，請聯絡 BodyFix 協助確認。" actions={<><Link className="portal-button portal-button-secondary" href="/">返回 BodyFix</Link><form action={signOutClientPortal}><button className="portal-button" type="submit">登出</button></form></>} /></ClientShell>;
  }

  const portalData = data.data;

  return <ClientShell displayName={portalData.profile.display_name ?? undefined}>
    <section className="client-portal-grid" aria-label="Client portal dashboard">
      <article className="client-portal-card">
        <p className="portal-kicker">Next</p><h2>下一次安排</h2>
        {portalData.nextBooking ? <div className="client-detail-list"><b>{formatDateTime(portalData.nextBooking.start_at)}</b><span>{portalData.nextBooking.service_name}</span><span>{portalData.nextBooking.location_label ?? "地點待確認"}</span><span>{portalData.nextBooking.booking_status}</span></div> : <EmptyText>目前沒有已確認的服務安排。</EmptyText>}
      </article>
      <article className="client-portal-card">
        <p className="portal-kicker">Latest</p><h2>最近一次服務摘要</h2>
        {portalData.latestRecord ? <div className="client-detail-list"><b>{formatDate(portalData.latestRecord.service_date)} · {portalData.latestRecord.service_name}</b><span>本次整理重點：{portalData.latestRecord.session_focus ?? "尚未填寫"}</span><span>客戶可見摘要：{portalData.latestRecord.client_summary ?? "尚未填寫"}</span><span>後續觀察方向：{portalData.latestRecord.follow_up_focus ?? "尚未填寫"}</span></div> : <EmptyText>第一筆服務紀錄完成後，這裡會開始累積。</EmptyText>}
      </article>
      <article className="client-portal-card client-wide-card">
        <p className="portal-kicker">Home practice</p><h2>居家建議</h2>
        {portalData.recommendations.length ? <div className="client-recommendation-list">{portalData.recommendations.map((item) => <section key={item.id}><h3>{item.title}</h3><p>{item.instructions}</p><small>{item.dosage ?? "依當天狀態調整"}</small>{item.caution ? <em>{item.caution}</em> : null}<CompleteRecommendationButton id={item.id} completed={item.completed_today} /></section>)}</div> : <EmptyText>目前沒有可見的居家建議。</EmptyText>}
      </article>
      <article className="client-portal-card">
        <p className="portal-kicker">Recent</p><h2>近期狀態</h2>
        <div className="client-metric-grid"><Metric label="最近服務次數" value={`${portalData.recentServiceCount}`} /><Metric label="最近一次回報時間" value={portalData.latestCheckin ? formatDate(portalData.latestCheckin.checkin_date) : "尚未回報"} /><Metric label="活動容易度" value={portalData.latestCheckin?.movement_ease ?? "尚未回報"} /><Metric label="緊繃感變化" value={portalData.latestCheckin?.tension_level ?? "尚未回報"} /><Metric label="居家建議完成狀態" value={`${portalData.completedRecommendationCount}/${portalData.recommendations.length}`} /></div>
      </article>
    </section>
  </ClientShell>;
}

function ClientShell({ children, displayName }: { children: React.ReactNode; displayName?: string }) { return <main className="portal-page client-portal-page"><div className="portal-shell client-portal-shell"><nav className="portal-nav"><Link className="portal-wordmark" href="/"><span>BF</span><strong>BodyFix OS</strong></Link><Link className="portal-admin-link client-login-link" href={LOGIN_HREF}>登入</Link></nav><section className="client-portal-hero"><p className="portal-kicker">BODYFIX CLIENT PORTAL</p><h1>BODYFIX CLIENT PORTAL</h1><p className="portal-lead">你的身體整理紀錄，從這裡接著走。</p><p className="portal-intro">查看服務摘要、居家建議與近期狀態。這些內容用來協助你理解與延續身體使用，不作為醫療診斷。</p>{displayName ? <p className="client-welcome">{displayName}，歡迎回來。</p> : null}</section>{children}<footer className="client-safety-note">若出現持續疼痛、明顯腫脹、麻木、無力、發燒、外傷或其他疑似醫療問題，請先尋求合格醫療專業人員評估。</footer></div></main> }
function StateCard({ title, body, actions }: { title: string; body: string; actions?: React.ReactNode }) { return <section className="client-state-card"><h2>{title}</h2><p>{body}</p>{actions ? <div className="client-state-actions">{actions}</div> : null}</section>; }
function EmptyText({ children }: { children: React.ReactNode }) { return <p className="client-empty-text">{children}</p>; }
function Metric({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium" }).format(new Date(value)); }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }

function isMissingSessionError(error: { name?: string; message?: string; status?: number }) {
  return error.name === "AuthSessionMissingError" || error.status === 400 && /session.*missing|Auth session missing/i.test(error.message ?? "");
}

async function loadPortalDataSafely(supabase: Awaited<ReturnType<typeof createSupabaseUserServerClient>>, authUserId: string) {
  if (!supabase) return "error" as const;
  try {
    return await loadClientPortalData(supabase, authUserId);
  } catch (error) {
    console.error("[client-portal] data load failed", error instanceof Error ? { name: error.name, message: error.message } : { error: String(error) });
    return "error" as const;
  }
}
