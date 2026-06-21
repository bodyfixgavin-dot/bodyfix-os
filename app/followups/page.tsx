import { PulseShell } from "@/components/pulse/PulseShell";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type Followup = { id?: string; client_name_snapshot?: string | null; client_name?: string | null; last_visit_date?: string | null; last_session_date?: string | null; reason?: string | null; note?: string | null; contact_method?: string | null; priority?: string | null; status?: string | null };

async function getFollowups(): Promise<Followup[]> {
  const db = createSupabaseAdminClient();
  if (!db) return [];
  const { data } = await db.from("pulse_followups").select("*").in("status", ["未聯絡", "待回訪", "open"]).limit(50);
  return (data ?? []) as Followup[];
}

export default async function Page() {
  const followups = await getFollowups();
  return <PulseShell title="今天先找誰" eyebrow="FOLLOW-UP POOL"><p className="page-intro">不是廣撒訊息，是把值得照顧的人找回來。</p>{followups.length === 0 ? <section className="api-note"><p>目前沒有回訪任務，請先從客戶資料建立回訪。</p></section> : <section className="followup-list full">{followups.map((x, index) => { const name = x.client_name_snapshot || x.client_name || "未命名客戶"; const priority = x.priority || "中"; const reason = x.reason || x.note || "回訪任務"; const lastVisit = x.last_visit_date || x.last_session_date || "未記錄"; return <article key={x.id ?? `${name}-${index}`}><span className={`priority p-${priority}`}>{priority}</span><div><b>{name}</b><p>{reason} · 最近來訪 {lastVisit}</p><small>建議：嗨 {name}，最近身體狀況還好嗎？</small></div><button>{x.contact_method || "聯絡"}</button></article>; })}</section>}</PulseShell>;
}
