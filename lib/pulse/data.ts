import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getTodayInTaipei } from "@/lib/pulse/date";

export type PulseStatus = "危險" | "注意" | "穩定";
export type PulseMetrics = { date:string; todayIncome:number; todayTarget:number; todayRemaining:number; monthTarget:number; monthIncome:number; monthRemaining:number; remainingWorkdays:number; appointmentsNext7Days:number; status:PulseStatus };
export const demoFollowups = [["Jao","5 天前","肩頸緊","LINE","P1"],["Mina","12 天前","骨盆卡","IG","P2"],["Ken","30 天前","下背痠","LINE","P3"],["Annie","45 天前","睡眠差","IG","P2"]];
export function money(n:number){return new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(n);}
const TAIPEI="Asia/Taipei";
export function localDate(date=new Date()){ return new Intl.DateTimeFormat("en-CA",{timeZone:TAIPEI,year:"numeric",month:"2-digit",day:"2-digit"}).format(date); }
function workdaysLeft(start:string,end:string,rest:number[]){const d=new Date(`${start}T12:00:00+08:00`), e=new Date(`${end}T12:00:00+08:00`); let c=0; for(;d<=e;d.setDate(d.getDate()+1)){ if(!rest.includes(d.getDay())) c++; } return Math.max(c,1);}
export async function getPulseMetrics():Promise<PulseMetrics>{
 const date=getTodayInTaipei(); const fallback={month_target:150000,period_start:date,period_end:date,rest_weekdays:[2]};
 let settings=fallback; let income:{entry_date:string;amount?:number;amount_actual?:number}[]=[]; let appointmentCount=0;
 try { const db=createSupabaseAdminClient(); if(db){ const s=await db.from("pulse_settings").select("*").limit(1).maybeSingle(); if(s.data) settings=s.data; const i=await db.from("pulse_income_entries").select("entry_date,amount,amount_actual").gte("entry_date",settings.period_start).lte("entry_date",settings.period_end); if(i.data) income=i.data; const end=new Date(`${date}T12:00:00+08:00`); end.setDate(end.getDate()+6); const a=await db.from("pulse_appointments").select("id",{count:"exact",head:true}).gte("appointment_date",date).lte("appointment_date",localDate(end)).in("status",["已排","待確認"]); appointmentCount=a.count??0; }} catch { /* demo fallback keeps Pulse useful before Supabase setup */ }
 const monthIncome=income.reduce((s,x)=>s+Number(x.amount_actual ?? x.amount ?? 0),0); const todayIncome=income.filter(x=>x.entry_date===date).reduce((s,x)=>s+Number(x.amount_actual ?? x.amount ?? 0),0); const remainingWorkdays=workdaysLeft(date,settings.period_end,settings.rest_weekdays??[]); const monthRemaining=Math.max(settings.month_target-monthIncome,0); const todayTarget=Math.ceil(monthRemaining/remainingWorkdays); const todayRemaining=Math.max(todayTarget-todayIncome,0); const status:PulseStatus=appointmentCount>=8?"穩定":appointmentCount>=4?"注意":"危險";
 return {date,status,todayIncome,todayTarget,todayRemaining,monthIncome,monthTarget:settings.month_target,monthRemaining,remainingWorkdays,appointmentsNext7Days:appointmentCount};
}
