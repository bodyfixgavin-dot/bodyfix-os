import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getTaipeiMonthRange, getTodayInTaipei } from "@/lib/pulse/date";

export type PulseStatus = "危險" | "注意" | "穩定";
export type PulseMetrics = { date:string; todayIncome:number; todayTarget:number; todayRemaining:number; monthTarget:number; monthIncome:number; monthRemaining:number; remainingWorkdays:number; appointmentsNext7Days:number; status:PulseStatus };
export type PulseFollowup = { id:string; client_name:string; last_visit_date:string|null; main_issue:string|null; contact_method:string|null; priority:string|null; suggested_message:string|null };

export const localDate = getTodayInTaipei;

export function remainingWorkdays(today:string,end:string,rest=[2]) { let count=0; for(let d=new Date(`${today}T12:00:00+08:00`), e=new Date(`${end}T12:00:00+08:00`);d<=e;d.setDate(d.getDate()+1)) if(!rest.includes(d.getDay())) count++; return count; }

export async function getPulseMetrics():Promise<PulseMetrics>{
 const date=getTodayInTaipei(); const month=getTaipeiMonthRange(date); const fallback={month_target:150000,period_start:month.start,period_end:month.end,rest_weekdays:[2]};
 let settings=fallback; let income:{entry_date:string;amount_actual:number|null;amount:number|null}[]=[]; let appointmentCount=0;
 try { const db=createSupabaseAdminClient(); if(db){ const s=await db.from("pulse_settings").select("*").limit(1).maybeSingle(); if(s.data) settings={...fallback,...s.data}; const i=await db.from("pulse_income_entries").select("entry_date,amount_actual,amount").gte("entry_date",settings.period_start).lte("entry_date",settings.period_end); if(i.data) income=i.data; const end=new Date(`${date}T12:00:00+08:00`); end.setDate(end.getDate()+6); const a=await db.from("pulse_appointments").select("id",{count:"exact",head:true}).gte("appointment_date",date).lte("appointment_date",getTodayInTaipeiFromDate(end)).in("status",["已排","待確認"]); appointmentCount=a.count??0; }} catch { /* Supabase not ready: return empty live metrics instead of demo data. */ }
 const amountOf=(x:{amount_actual:number|null;amount:number|null})=>Number(x.amount_actual ?? x.amount ?? 0); const monthIncome=income.reduce((n,x)=>n+amountOf(x),0), todayIncome=income.filter(x=>x.entry_date===date).reduce((n,x)=>n+amountOf(x),0), monthRemaining=Math.max(0,settings.month_target-monthIncome), workdays=Math.max(1,remainingWorkdays(date,settings.period_end,settings.rest_weekdays)), todayTarget=Math.ceil(monthRemaining/workdays), todayRemaining=Math.max(0,todayTarget-todayIncome); const status:PulseStatus=appointmentCount>=8?"穩定":appointmentCount>=4?"注意":"危險";
 return {date,todayIncome,todayTarget,todayRemaining,monthTarget:settings.month_target,monthIncome,monthRemaining,remainingWorkdays:workdays,appointmentsNext7Days:appointmentCount,status};
}

function getTodayInTaipeiFromDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit"}).format(date);
}

export async function getPulseFollowups(): Promise<PulseFollowup[]> {
  try {
    const db = createSupabaseAdminClient();
    if (!db) return [];
    const tasks = await db.from("pulse_followups").select("id, client_name, last_visit_date, main_issue, contact_method, priority, suggested_message").in("followup_status", ["未聯絡", "已聯絡"]).order("last_visit_date", { ascending: true }).limit(50);
    if (tasks.data?.length) return tasks.data as PulseFollowup[];
    const clients = await db.from("clients").select("id, display_name, last_visit_date, main_issue, contact_method, priority").in("client_status", ["active", "member", "vip"]).eq("is_selectable", true).not("display_name", "is", null).not("last_visit_date", "is", null).order("last_visit_date", { ascending: true }).limit(50);
    return (clients.data ?? []).map((client:any) => ({ id: client.id, client_name: client.display_name, last_visit_date: client.last_visit_date, main_issue: client.main_issue, contact_method: client.contact_method, priority: client.priority ?? "中", suggested_message: null }));
  } catch { return []; }
}
export const money=(n:number)=>new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(n);
