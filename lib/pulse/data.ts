import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { addTaipeiDays, getTodayInTaipei } from "@/lib/pulse/date";

export type PulseStatus = "危險" | "注意" | "穩定";
export type PulseMetrics = { date:string; todayIncome:number; todayTarget:number; todayRemaining:number; monthTarget:number; monthIncome:number; monthRemaining:number; remainingWorkdays:number; appointmentsNext7Days:number; status:PulseStatus };
export type PulseFollowup = { id:string; display_name:string; main_issue:string | null; contact_method:string | null; priority:string; last_visit_date:string | null; suggestion:string };

export function remainingWorkdays(today:string,end:string,rest=[2]) { let count=0; for(let d=new Date(`${today}T12:00:00+08:00`), e=new Date(`${end}T12:00:00+08:00`);d<=e;d.setDate(d.getDate()+1)) if(!rest.includes(d.getDay())) count++; return count; }

export async function getPulseMetrics():Promise<PulseMetrics>{
 const date=getTodayInTaipei(); const fallback={month_target:150000,period_start:date.slice(0,8)+"01",period_end:addTaipeiDays(date,30),rest_weekdays:[2]};
 let settings=fallback; let income:{entry_date:string;amount_actual:number | null}[]=[]; let appointmentCount=0;
 try { const db=createSupabaseAdminClient(); if(db){ const s=await db.from("pulse_settings").select("month_target,period_start,period_end,rest_weekdays").limit(1).maybeSingle(); if(s.data) settings={...settings,...s.data}; const i=await db.from("pulse_income_entries").select("entry_date,amount_actual").gte("entry_date",settings.period_start).lte("entry_date",settings.period_end); if(i.error) throw i.error; income=i.data??[]; const end=addTaipeiDays(date,6); const a=await db.from("pulse_appointments").select("id",{count:"exact",head:true}).gte("appointment_date",date).lte("appointment_date",end).in("status",["已排","待確認"]); if(a.error) throw a.error; appointmentCount=a.count??0; }} catch { /* keep zeroed Pulse metrics when Supabase is unavailable */ }
 const monthIncome=income.reduce((n,x)=>n+Number(x.amount_actual??0),0), todayIncome=income.filter(x=>x.entry_date===date).reduce((n,x)=>n+Number(x.amount_actual??0),0), monthRemaining=Math.max(0,settings.month_target-monthIncome), workdays=Math.max(1,remainingWorkdays(date,settings.period_end,settings.rest_weekdays)), todayTarget=Math.ceil(monthRemaining/workdays), todayRemaining=Math.max(0,todayTarget-todayIncome); const status:PulseStatus=appointmentCount>=8?"穩定":appointmentCount>=4?"注意":"危險";
 return {date,todayIncome,todayTarget,todayRemaining,monthTarget:settings.month_target,monthIncome,monthRemaining,remainingWorkdays:workdays,appointmentsNext7Days:appointmentCount,status};
}

export async function getPulseFollowups(limit=20):Promise<PulseFollowup[]> {
 const db=createSupabaseAdminClient(); if(!db) return [];
 const { data, error } = await db.from("clients").select("id, display_name, contact_method, main_issue, last_visit_date, status").eq("status","active").not("last_visit_date","is",null).order("last_visit_date",{ascending:true}).limit(limit);
 if(error) return [];
 return (data??[]).map((client:any)=>({ id: client.id, display_name: client.display_name, contact_method: client.contact_method, main_issue: client.main_issue, last_visit_date: client.last_visit_date, priority: "中", suggestion: `嗨 ${client.display_name}，最近身體狀況還好嗎？${client.main_issue ? `上次提到的${client.main_issue}有沒有比較穩？` : "想跟你確認一下最近狀態。"}` }));
}
export const money=(n:number)=>new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(n);
