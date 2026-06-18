import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type PulseStatus="危險"|"注意"|"穩定";
export type PulseMetrics = { date:string; todayIncome:number; todayTarget:number; todayRemaining:number; monthTarget:number; monthIncome:number; monthRemaining:number; remainingWorkdays:number; appointmentsNext7Days:number; status:PulseStatus };
export type PulseFollowup = { id:string; clientId:string|null; clientName:string; lastVisitDate:string|null; mainIssue:string|null; contactMethod:string|null; priority:"高"|"中"|"低"; suggestedMessage:string|null };
export type PulseClient = { id:string; display_name:string; contact_method:string|null; line_id:string|null; ig_id:string|null; phone:string|null; main_issue:string|null };

const timeZone = "Asia/Taipei";

export function taipeiDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function monthRangeTaipei(dateText = taipeiDate()) {
  const [year, month] = dateText.split("-").map(Number);
  const endDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { start: `${year}-${String(month).padStart(2, "0")}-01`, end: `${year}-${String(month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}` };
}

function addDaysTaipei(dateText:string, days:number) { const d = new Date(`${dateText}T00:00:00+08:00`); d.setDate(d.getDate()+days); return taipeiDate(d); }
function dayOfWeekTaipei(dateText:string) { return new Date(`${dateText}T00:00:00+08:00`).getDay(); }
function remainingWorkdays(start:string,end:string,rest:number[]){let n=0, cursor=start; while(cursor<=end){if(!rest.includes(dayOfWeekTaipei(cursor))) n++; cursor=addDaysTaipei(cursor,1);} return n;}

export async function getPulseMetrics(): Promise<PulseMetrics>{
 const date=taipeiDate(); const range=monthRangeTaipei(date); const fallback={month_target:150000,period_start:range.start,period_end:range.end,rest_weekdays:[2]};
 let settings=fallback; let income:{entry_date:string;amount:number}[]=[]; let appointmentCount=0;
 try { const db=createSupabaseAdminClient(); if(db){ const s=await db.from("pulse_settings").select("*").order("updated_at",{ascending:false}).limit(1).maybeSingle(); if(s.data) settings={...fallback,...s.data, period_start:s.data.period_start ?? range.start, period_end:s.data.period_end ?? range.end}; const i=await db.from("pulse_income_entries").select("entry_date,amount").gte("entry_date",settings.period_start).lte("entry_date",settings.period_end); if(i.data) income=i.data; const end=addDaysTaipei(date,6); const a=await db.from("pulse_appointments").select("id",{count:"exact",head:true}).gte("appointment_date",date).lte("appointment_date",end).in("status",["已排","待確認"]); appointmentCount=a.count??0; }} catch { /* empty metrics until Supabase is configured */ }
 const monthIncome=income.reduce((n,x)=>n+Number(x.amount || 0),0), todayIncome=income.filter(x=>x.entry_date===date).reduce((n,x)=>n+Number(x.amount || 0),0), monthRemaining=Math.max(0,settings.month_target-monthIncome), workdays=Math.max(1,remainingWorkdays(date,settings.period_end,settings.rest_weekdays ?? [])), todayTarget=Math.ceil(monthRemaining/workdays), todayRemaining=Math.max(0,todayTarget-todayIncome); const status:PulseStatus=appointmentCount>=8?"穩定":appointmentCount>=4?"注意":"危險";
 return {date,todayIncome,todayTarget,todayRemaining,monthTarget:settings.month_target,monthIncome,monthRemaining,remainingWorkdays:workdays,appointmentsNext7Days:appointmentCount,status};
}

export async function getPulseFollowups(): Promise<PulseFollowup[]> { const db=createSupabaseAdminClient(); if(!db) return []; const { data } = await db.from("pulse_followups").select("id,client_id,client_name_snapshot,client_name,last_visit_date,main_issue,contact_method,priority,suggested_message,followup_status").in("followup_status",["未聯絡","已聯絡"]).order("last_visit_date",{ascending:true}).limit(50); return (data ?? []).map((x:any)=>({id:x.id, clientId:x.client_id ?? null, clientName:x.client_name_snapshot ?? x.client_name ?? "未命名客戶", lastVisitDate:x.last_visit_date ?? null, mainIssue:x.main_issue ?? null, contactMethod:x.contact_method ?? null, priority:x.priority ?? "中", suggestedMessage:x.suggested_message ?? null})); }
export async function getPulseClients(): Promise<PulseClient[]> { const db=createSupabaseAdminClient(); if(!db) return []; const { data } = await db.from("clients").select("id,display_name,contact_method,line_id,ig_id,phone,main_issue").order("display_name").limit(500); return data ?? []; }
