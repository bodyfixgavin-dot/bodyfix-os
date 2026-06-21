import { PulseShell } from "@/components/pulse/PulseShell";
export const dynamic="force-dynamic";
import { getPulseFollowups } from "@/lib/pulse/data";

export default async function Page(){
  const followups = await getPulseFollowups();
  return <PulseShell title="今天先找誰" eyebrow="FOLLOW-UP POOL"><p className="page-intro">不是廣撒訊息，是把值得照顧的人找回來。</p><section className="followup-list full">{followups.length ? followups.map(x=><article key={x.id}><span className={`priority p-${x.priority ?? "中"}`}>{x.priority ?? "中"}</span><div><b>{x.client_name}</b><p>{x.main_issue ?? "未填主要問題"} · 最近來訪 {x.last_visit_date ?? "未填"}</p><small>{x.suggested_message ?? `建議：嗨 ${x.client_name}，最近身體狀況還好嗎？上次提到的${x.main_issue ?? "狀況"}有沒有比較穩？`}</small></div><button>{x.contact_method ?? "未填"} 聯絡</button></article>) : <div className="followup-empty">目前沒有回訪任務，請先從客戶資料建立回訪。</div>}</section></PulseShell>;
}
