import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type PulseStatus = "危險" | "注意" | "穩定";
export type PulseMetrics = { date:string; todayIncome:number; todayTarget:number; todayRemaining:number; monthTarget:number; monthIncome:number; monthRemaining:number; remainingWorkdays:number; appointmentsNext7Days:number; status:PulseStatus };
export const demoFollowups = [
  ["勁甫","2026-06-03","肩胛、手臂、腰臀","LINE","高"],["LRC","2026-05-29","肩背痠、重訓型","IG","高"],["蜜汁熊","2026-05-21","肩背痠緊","LINE","高"],["Kai","2026-05-16","腰痠、髖內外緊","IG","高"],["Patrick","2026-05-15","肩膀沾黏、酸痛","LINE","高"],["Dustin Shen","2026-04-30","腰舊傷、運動表現","IG","中"],["Albert","2026-04-30","肩頸酸緊","LINE","中"],["Johnny","2026-04-24","背部緊","IG","中"],["Shawn翔","2026-05-09","闊背、脊柱、腰方緊","LINE","中"],["Chester","2026-05-02","腰部、臀部痠緊","LINE","中"],
];
const TAIPEI = "Asia/Taipei";
type PulseSettings = { month_target:number; period_start:string; period_end:string; rest_weekdays:number[] };
type IncomeEntry = { entry_date:string; amount:number | null; amount_actual?:number | null };
export function localDate(date=new Date()){ return new Intl.DateTimeFormat("en-CA",{timeZone:TAIPEI,year:"numeric",month:"2-digit",day:"2-digit"}).format(date); }
export function remainingWorkdays(today:string,end:string,rest=[2]) { let count=0; for(let d=new Date(`${today}T12:00:00+08:00`), e=new Date(`${end}T12:00:00+08:00`);d<=e;d.setDate(d.getDate()+1)) if(!rest.includes(d.getDay())) count++; return count; }
const incomeAmount=(entry:IncomeEntry)=>entry.amount_actual ?? entry.amount ?? 0;
export async function getPulseMetrics():Promise<PulseMetrics>{
 const date=localDate(); const fallback:PulseSettings={month_target:150000,period_start:"2026-06-01",period_end:"2026-06-30",rest_weekdays:[2]};
 let settings=fallback; let income:IncomeEntry[]=[]; let appointmentCount=0;
 try { const db=createSupabaseAdminClient(); if(db){ const s=await db.from("pulse_settings").select("*").limit(1).maybeSingle(); if(s.data) settings={...fallback,...s.data}; const i=await db.from("pulse_income_entries").select("entry_date,amount,amount_actual").gte("entry_date",settings.period_start).lte("entry_date",settings.period_end); if(i.error && i.error.message?.includes("amount_actual")){ const legacy=await db.from("pulse_income_entries").select("entry_date,amount").gte("entry_date",settings.period_start).lte("entry_date",settings.period_end); if(legacy.data) income=legacy.data; } else if(i.data) income=i.data; const end=new Date(`${date}T12:00:00+08:00`); end.setDate(end.getDate()+6); const a=await db.from("pulse_appointments").select("id",{count:"exact",head:true}).gte("appointment_date",date).lte("appointment_date",localDate(end)).in("status",["已排","待確認"]); appointmentCount=a.count??0; }} catch { /* keep zeroed fallback metrics when Supabase is unavailable */ }
 const monthIncome=income.reduce((n,x)=>n+incomeAmount(x),0), todayIncome=income.filter(x=>x.entry_date===date).reduce((n,x)=>n+incomeAmount(x),0), monthRemaining=Math.max(0,settings.month_target-monthIncome), workdays=Math.max(1,remainingWorkdays(date,settings.period_end,settings.rest_weekdays)), todayTarget=Math.ceil(monthRemaining/workdays), todayRemaining=Math.max(0,todayTarget-todayIncome); const status:PulseStatus=appointmentCount>=8?"穩定":appointmentCount>=4?"注意":"危險";
 return {date,todayIncome,todayTarget,todayRemaining,monthTarget:settings.month_target,monthIncome,monthRemaining,remainingWorkdays:workdays,appointmentsNext7Days:appointmentCount,status};
}
export const money=(n:number)=>`NT$${new Intl.NumberFormat("zh-TW",{maximumFractionDigits:0}).format(n)}`;
