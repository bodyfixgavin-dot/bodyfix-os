import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getTodayInTaipei } from "@/lib/pulse/date";

export type PulseStatus = "危險" | "注意" | "穩定";
export type PulseMetrics = { date:string; todayIncome:number; todayTarget:number; todayRemaining:number; monthTarget:number; monthIncome:number; monthRemaining:number; remainingWorkdays:number; appointmentsNext7Days:number; status:PulseStatus };

type Settings = { month_target:number; period_start:string; period_end:string; rest_weekdays:number[] };
type Income = { entry_date:string; amount_actual:number | null; amount:number | null };

export const localDate = getTodayInTaipei;
export function remainingWorkdays(today:string,end:string,rest=[2]) { let count=0; for(let d=new Date(`${today}T12:00:00+08:00`), e=new Date(`${end}T12:00:00+08:00`);d<=e;d.setDate(d.getDate()+1)) if(!rest.includes(d.getDay())) count++; return count; }

function defaultSettings(date: string): Settings {
  const [year, month] = date.split("-").map(Number);
  const periodEnd = new Date(Date.UTC(year, month, 0));
  return { month_target: 150000, period_start: `${date.slice(0, 7)}-01`, period_end: periodEnd.toISOString().slice(0, 10), rest_weekdays: [2] };
}

export async function getPulseMetrics():Promise<PulseMetrics>{
 const date=getTodayInTaipei(); let settings:Settings=defaultSettings(date); let income:Income[]=[]; let appointmentCount=0;
 try { const db=createSupabaseAdminClient(); if(db){ const s=await db.from("pulse_settings").select("month_target,period_start,period_end,rest_weekdays").limit(1).maybeSingle(); if(s.data) settings=s.data as Settings; const i=await db.from("pulse_income_entries").select("entry_date,amount_actual,amount").gte("entry_date",settings.period_start).lte("entry_date",settings.period_end); if(i.data) income=i.data as Income[]; const end=new Date(`${date}T12:00:00+08:00`); end.setDate(end.getDate()+6); const a=await db.from("pulse_appointments").select("id",{count:"exact",head:true}).gte("appointment_date",date).lte("appointment_date",getTodayInTaipei(end)).in("status",["已排","待確認"]); appointmentCount=a.count??0; }} catch { /* keep zeroed metrics when Supabase is unavailable */ }
 const amountOf=(x:Income)=>Number(x.amount_actual ?? x.amount ?? 0); const monthIncome=income.reduce((n,x)=>n+amountOf(x),0), todayIncome=income.filter(x=>x.entry_date===date).reduce((n,x)=>n+amountOf(x),0), monthRemaining=Math.max(0,settings.month_target-monthIncome), workdays=Math.max(1,remainingWorkdays(date,settings.period_end,settings.rest_weekdays)), todayTarget=Math.ceil(monthRemaining/workdays), todayRemaining=Math.max(0,todayTarget-todayIncome); const status:PulseStatus=appointmentCount>=8?"穩定":appointmentCount>=4?"注意":"危險";
 return {date,todayIncome,todayTarget,todayRemaining,monthTarget:settings.month_target,monthIncome,monthRemaining,remainingWorkdays:workdays,appointmentsNext7Days:appointmentCount,status};
}
export const money=(n:number)=>new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(n);
