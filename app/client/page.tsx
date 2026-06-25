import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseUserServerClient } from "@/lib/supabase/server";
import { loadClientPortalData } from "@/lib/client-portal";
import { CompleteRecommendationButton } from "./_components/CompleteRecommendationButton";

export default async function ClientPortalPage() {
  const supabase = await createSupabaseUserServerClient();
  if (!supabase) return <ClientShell><StateCard title="系統尚未連線" body="客戶入口需要 Supabase 環境變數才能安全讀取資料。" /></ClientShell>;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return <ClientShell><StateCard title="登入狀態確認失敗" body="請重新登入後再試。" /></ClientShell>;
  if (!userData.user) redirect("/client/login?next=/client");

  const data = await loadPortalDataSafely(supabase, userData.user.id);
  if (data === "error") {
    return <ClientShell><StateCard title="資料讀取失敗" body="請稍後再試；若持續發生，請聯絡服務人員確認帳號權限。" /></ClientShell>;
  }

  if (!data) {
    return <ClientShell><StateCard title="帳號尚未連結" body="這個登入帳號尚未連結到 BodyFix 客戶檔案。請聯絡服務人員確認，不會依姓名、email 或電話自動合併資料。" /></ClientShell>;
  }

  return <ClientShell displayName={data.profile.display_name ?? undefined}>
    <section className="client-portal-grid" aria-label="Client portal dashboard">
      <article className="client-portal-card">
        <p className="portal-kicker">Next</p><h2>下一次安排</h2>
        {data.nextBooking ? <div className="client-detail-list"><b>{formatDateTime(data.nextBooking.start_at)}</b><span>{data.nextBooking.service_name}</span><span>{data.nextBooking.location_label ?? "地點待確認"}</span><span>{data.nextBooking.booking_status}</span></div> : <EmptyText>目前沒有已確認的服務安排。</EmptyText>}
      </article>
      <article className="client-portal-card">
        <p className="portal-kicker">Latest</p><h2>最近一次整理</h2>
        {data.latestRecord ? <div className="client-detail-list"><b>{formatDate(data.latestRecord.service_date)} · {data.latestRecord.service_name}</b><span>本次整理重點：{data.latestRecord.session_focus ?? "尚未填寫"}</span><span>客戶可見摘要：{data.latestRecord.client_summary ?? "尚未填寫"}</span><span>後續觀察方向：{data.latestRecord.follow_up_focus ?? "尚未填寫"}</span></div> : <EmptyText>第一筆服務紀錄完成後，這裡會開始累積。</EmptyText>}
      </article>
      <article className="client-portal-card client-wide-card">
        <p className="portal-kicker">Home practice</p><h2>這週帶回去做</h2>
        {data.recommendations.length ? <div className="client-recommendation-list">{data.recommendations.map((item) => <section key={item.id}><h3>{item.title}</h3><p>{item.instructions}</p><small>{item.dosage ?? "依當天狀態調整"}</small>{item.caution ? <em>{item.caution}</em> : null}<CompleteRecommendationButton id={item.id} completed={item.completed_today} /></section>)}</div> : <EmptyText>目前沒有可見的居家建議。</EmptyText>}
      </article>
      <article className="client-portal-card">
        <p className="portal-kicker">Recent</p><h2>近期變化</h2>
        <div className="client-metric-grid"><Metric label="最近服務次數" value={`${data.recentServiceCount}`} /><Metric label="最近一次回報時間" value={data.latestCheckin ? formatDate(data.latestCheckin.checkin_date) : "尚未回報"} /><Metric label="活動容易度" value={data.latestCheckin?.movement_ease ?? "尚未回報"} /><Metric label="緊繃感變化" value={data.latestCheckin?.tension_level ?? "尚未回報"} /><Metric label="居家建議完成狀態" value={`${data.completedRecommendationCount}/${data.recommendations.length}`} /></div>
      </article>
    </section>
  </ClientShell>;
}

function ClientShell({ children, displayName }: { children: React.ReactNode; displayName?: string }) { return <main className="portal-page client-portal-page"><div className="portal-shell client-portal-shell"><nav className="portal-nav"><Link className="portal-wordmark" href="/"><span>BF</span><strong>BodyFix OS</strong></Link><Link className="portal-admin-link" href="/client/login">登入</Link></nav><section className="client-portal-hero"><p className="portal-kicker">BODYFIX CLIENT PORTAL</p><h1>BODYFIX CLIENT PORTAL</h1><p className="portal-lead">你的身體整理紀錄，從這裡接著走。</p><p className="portal-intro">查看服務摘要、居家建議與近期狀態。這些內容用來協助你理解與延續身體使用，不作為醫療診斷。</p>{displayName ? <p className="client-welcome">{displayName}，歡迎回來。</p> : null}</section>{children}<footer className="client-safety-note">若出現持續疼痛、明顯腫脹、麻木、無力、發燒、外傷或其他疑似醫療問題，請先尋求合格醫療專業人員評估。</footer></div></main> }
function StateCard({ title, body }: { title: string; body: string }) { return <section className="client-state-card"><h2>{title}</h2><p>{body}</p></section>; }
function EmptyText({ children }: { children: React.ReactNode }) { return <p className="client-empty-text">{children}</p>; }
function Metric({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium" }).format(new Date(value)); }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }


async function loadPortalDataSafely(supabase: Awaited<ReturnType<typeof createSupabaseUserServerClient>>, authUserId: string) {
  if (!supabase) return "error" as const;
  try {
    return await loadClientPortalData(supabase, authUserId);
  } catch {
    return "error" as const;
  }
}
