"use client";
import { useState } from "react";
import type { PulseClient } from "@/lib/pulse/data";
import { ClientPicker } from "./ClientPicker";
import { Field } from "./PulseShell";

export function EntryForm({kind, clients, defaultDate}:{kind:"income"|"appointment"; clients:PulseClient[]; defaultDate:string}){
  const [saved,setSaved]=useState(false); const [error,setError]=useState(""); const appointment=kind==="appointment";
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setSaved(false); setError(""); const response = await fetch(`/api/pulse/${appointment ? "appointments" : "income"}`, { method: "POST", body: new FormData(event.currentTarget) }); if (!response.ok) { const body = await response.json().catch(() => ({})); setError(body.error ?? "儲存失敗"); return; } setSaved(true); event.currentTarget.reset(); }
  return <form className="entry-form" onSubmit={submit}><Field label="日期"><input name="date" type="date" defaultValue={defaultDate} required/></Field>{appointment&&<Field label="時間"><input name="start_time" type="time" defaultValue="14:00"/></Field>}<Field label="客戶"><ClientPicker clients={clients} required={appointment}/></Field><Field label="服務類型"><select name="service_type"><option>60 分</option><option>90 分</option><option>120 分</option><option>骨盆核心延長</option><option>教練課</option><option>其他</option></select></Field><Field label={appointment?"預估金額":"金額"}><input name="amount" type="number" inputMode="numeric" placeholder="0" required={!appointment}/></Field>{appointment?<Field label="狀態"><select name="status">{["已排","待確認","已完成","取消"].map(x=><option key={x}>{x}</option>)}</select></Field>:<Field label="來源"><select name="source">{["LINE","IG","軟體","熟客","FansOne","其他"].map(x=><option key={x}>{x}</option>)}</select></Field>}<Field label="備註"><textarea name="note" placeholder="有什麼值得記住？"/></Field>{error ? <p className="form-error">{error}</p> : null}<button className="save">{saved?"已同步 Supabase":"儲存紀錄"}</button></form>
}
