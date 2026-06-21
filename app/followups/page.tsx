import { PulseShell } from "@/components/pulse/PulseShell";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { demoFollowups } from "@/lib/pulse/data";

const CLIENT_COLUMNS = "id,display_name,client_name,nickname,contact_method,line_id,ig_id,phone,source,main_issue,last_visit_date,status,note";

type PulseClient = {
  id: string;
  display_name: string | null;
  client_name: string | null;
  nickname: string | null;
  contact_method: string | null;
  line_id: string | null;
  ig_id: string | null;
  phone: string | null;
  source: string | null;
  main_issue: string | null;
  last_visit_date: string | null;
  status: string | null;
  note: string | null;
};

function clientDisplayName(client: PulseClient) {
  return client.display_name?.trim() || client.nickname?.trim() || client.client_name?.trim() || "未命名客戶";
}

function contactLabel(client: PulseClient) {
  if (client.contact_method) return client.contact_method;
  if (client.line_id) return "LINE";
  if (client.ig_id) return "IG";
  if (client.phone) return "電話";
  return "聯絡";
}

export default async function Page() {
  let clients: PulseClient[] = [];
  let error = "";
  try {
    const supabase = createSupabaseAdminClient();
    if (supabase) {
      const result = await supabase.from("clients").select(CLIENT_COLUMNS).order("last_visit_date", { ascending: true, nullsFirst: false }).limit(30);
      if (result.error) error = result.error.message;
      else clients = (result.data ?? []) as PulseClient[];
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "讀取 clients 失敗";
  }

  return <PulseShell title="今天先找誰" eyebrow="FOLLOW-UP POOL"><p className="page-intro">不是廣撒訊息，是以 clients.display_name 為正式顯示名稱。</p>{error ? <p className="page-intro">clients schema/query 錯誤：{error}</p> : null}<section className="followup-list full">{clients.length > 0 ? clients.map((client) => <article key={client.id}><span className="priority p-中">{client.status ?? "中"}</span><div><b>{clientDisplayName(client)}</b><p>{client.main_issue ?? "未填 main_issue"} · 最近來訪 {client.last_visit_date ?? "未填"}</p><small>建議：嗨 {clientDisplayName(client)}，最近身體狀況還好嗎？</small></div><button>{contactLabel(client)} 聯絡</button></article>) : demoFollowups.map((x) => <article key={x[0]}><span className={`priority p-${x[4]}`}>{x[4]}</span><div><b>{x[0]}</b><p>{x[2]} · 最近來訪 {x[1]}</p><small>示範資料：Supabase clients 無資料或無法讀取時顯示。</small></div><button>{x[3]} 聯絡</button></article>)}</section></PulseShell>;
}
