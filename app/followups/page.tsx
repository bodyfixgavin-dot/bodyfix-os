import { PulseShell } from "@/components/pulse/PulseShell";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Followup = { id:string; client_id?:string; followup_type?:string; scheduled_date?:string; message_summary?:string; next_action?:string; response_status?:string; clients?:{display_name?:string;nickname?:string;client_name?:string}|null };

export default async function Page(){
 const db=createSupabaseAdminClient();
 let items: Followup[] = []; let error = "";
 if(db){ const res=await db.from("followups").select("id,client_id,followup_type,scheduled_date,message_summary,next_action,response_status,clients(display_name,nickname,client_name)").eq("is_done",false).order("scheduled_date",{ascending:true}).limit(50); if(res.error) error=res.error.message; else items=(res.data??[]) as Followup[]; }
 return <PulseShell title="今天先找誰" eyebrow="FOLLOW-UP POOL"><p className="page-intro">不是廣撒訊息，是把值得照顧的人找回來。</p>{error?<p className="form-error">{error}</p>:null}<section className="followup-list full">{items.length?items.map((x)=><article key={x.id}><span className="priority">{x.response_status ?? "open"}</span><div><b>{x.clients?.display_name || x.clients?.nickname || x.clients?.client_name || x.client_id}</b><p>{x.followup_type ?? "回訪"} · 預計 {x.scheduled_date ?? "—"}</p><small>{x.message_summary || x.next_action || "請從客戶資料確認回訪內容。"}</small></div><button>聯絡</button></article>):<p className="followup-empty">目前沒有回訪任務，請先從客戶資料建立回訪。</p>}</section></PulseShell>;
}
