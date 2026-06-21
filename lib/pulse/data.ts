import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type PulseStatus = "危險" | "注意" | "穩定";
export type PulseMetrics = { date:string; todayIncome:number; todayTarget:number; todayRemaining:number; monthTarget:number; monthIncome:number; monthRemaining:number; remainingWorkdays:number; appointmentsNext7Days:number; status:PulseStatus; debug?: { pulseSettingsError?: string } };
const TAIPEI = "Asia/Taipei";
export function getTodayInTaipei(date=new Date()){ return new Intl.DateTimeFormat("en-CA",{timeZone:TAIPEI,year:"numeric",month:"2-digit",day:"2-digit"}).format(date); }
export const localDate = getTodayInTaipei;
function monthBounds(date:string) { return { period_start: `${date.slice(0, 7)}-01`, period_end: new Date(Number(date.slice(0,4)), Number(date.slice(5,7)), 0).toISOString().slice(0,10) }; }
export function remainingWorkdays(today:string,end:string,rest=[2]) { let count=0; for(let d=new Date(`${today}T12:00:00+08:00`), e=new Date(`${end}T12:00:00+08:00`);d<=e;d.setDate(d.getDate()+1)) if(!rest.includes(d.getDay())) count++; return count; }
export async function getPulseMetrics():Promise<PulseMetrics>{
 const date=getTodayInTaipei(); const bounds=monthBounds(date); const fallback={month_target:150000,period_start:bounds.period_start,period_end:bounds.period_end,rest_weekdays:[2]};
 let settings=fallback; let income:{entry_date:string;amount_actual?:number;amount?:number}[]=[]; let appointmentCount=0; let pulseSettingsError: string | undefined;
 const db=createSupabaseAdminClient();
 if(db){
   const s=await db.from("pulse_settings").select("*").limit(1).maybeSingle();
   if(s.error) pulseSettingsError=s.error.message; else if(s.data) settings={...fallback,...s.data};
   const i=await db.from("pulse_income_entries").select("entry_date,amount_actual,amount").gte("entry_date",settings.period_start).lte("entry_date",settings.period_end);
   if(i.error) throw new Error(i.error.message); if(i.data) income=i.data;
   const end=new Date(`${date}T12:00:00+08:00`); end.setDate(end.getDate()+6);
   const a=await db.from("pulse_appointments").select("id",{count:"exact",head:true}).gte("appointment_date",date).lte("appointment_date",getTodayInTaipei(end)).in("status",["已排","待確認"]);
   if(!a.error) appointmentCount=a.count??0;
 }
 const monthIncome=income.reduce((n,x)=>n+Number(x.amount_actual ?? x.amount ?? 0),0), todayIncome=income.filter(x=>x.entry_date===date).reduce((n,x)=>n+Number(x.amount_actual ?? x.amount ?? 0),0), monthRemaining=Math.max(0,settings.month_target-monthIncome), workdays=Math.max(1,remainingWorkdays(date,settings.period_end,settings.rest_weekdays)), todayTarget=Math.ceil(monthRemaining/workdays), todayRemaining=Math.max(0,todayTarget-todayIncome); const status:PulseStatus=appointmentCount>=8?"穩定":appointmentCount>=4?"注意":"危險";
 return {date,todayIncome,todayTarget,todayRemaining,monthTarget:settings.month_target,monthIncome,monthRemaining,remainingWorkdays:workdays,appointmentsNext7Days:appointmentCount,status,debug:pulseSettingsError?{pulseSettingsError}:undefined};
}
export const money=(n:number)=>new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(n);
