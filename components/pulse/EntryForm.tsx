"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field } from "./PulseShell";

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

function todayTaipei() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function EntryForm({ kind }: { kind: "income" | "appointment" }) {
  const [clients, setClients] = useState<PulseClient[]>([]);
  const [clientId, setClientId] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const appointment = kind === "appointment";
  const selectedClient = useMemo(() => clients.find((client) => client.id === clientId) ?? null, [clients, clientId]);

  useEffect(() => {
    let alive = true;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setMessage("尚未設定 Supabase 瀏覽器環境變數，無法讀取 clients。");
      return;
    }
    supabase
      .from("clients")
      .select(CLIENT_COLUMNS)
      .order("display_name", { ascending: true, nullsFirst: false })
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setMessage(`clients schema/query 錯誤：${error.message}`);
        else setClients((data ?? []) as PulseClient[]);
      });
    return () => { alive = false; };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setMessage("");
    if (!selectedClient) {
      setMessage("請先選擇 clients 表內的客戶。");
      return;
    }
    const form = new FormData(event.currentTarget);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setMessage("尚未設定 Supabase 瀏覽器環境變數，無法儲存。");
      return;
    }
    setSaving(true);
    const displayName = clientDisplayName(selectedClient);
    const { error } = appointment
      ? await supabase.from("pulse_appointments").insert({
          appointment_date: String(form.get("date") ?? ""),
          start_time: String(form.get("time") ?? "") || null,
          client_id: selectedClient.id,
          client_name_snapshot: displayName,
          service_type: String(form.get("serviceType") ?? ""),
          estimated_amount: Number(form.get("amount") || 0) || null,
          status: String(form.get("status") ?? "已排"),
          note: String(form.get("note") ?? "") || null,
        })
      : await supabase.from("pulse_income_entries").insert({
          entry_date: String(form.get("date") ?? ""),
          client_id: selectedClient.id,
          client_name_snapshot: displayName,
          service_type: String(form.get("serviceType") ?? ""),
          amount: Number(form.get("amount") || 0),
          source: String(form.get("source") ?? selectedClient.source ?? ""),
          note: String(form.get("note") ?? "") || null,
        });
    setSaving(false);
    if (error) setMessage(`儲存失敗：${error.message}`);
    else {
      setSaved(true);
      event.currentTarget.reset();
      setClientId("");
    }
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <Field label="日期"><input name="date" type="date" defaultValue={todayTaipei()} required /></Field>
      {appointment && <Field label="時間"><input name="time" type="time" defaultValue="14:00" /></Field>}
      <Field label="客戶（clients.display_name）">
        <select name="clientId" value={clientId} onChange={(event) => setClientId(event.target.value)} required>
          <option value="">從 clients 表選擇客戶</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{clientDisplayName(client)}</option>)}
        </select>
      </Field>
      {selectedClient ? <p className="api-note"><small>client_id = {selectedClient.id}</small><small>client_name_snapshot = {clientDisplayName(selectedClient)}</small></p> : null}
      <Field label="服務類型"><select name="serviceType"><option>60 分</option><option>90 分</option><option>120 分</option><option>骨盆核心延長</option><option>教練課</option><option>其他</option></select></Field>
      <Field label={appointment ? "預估金額" : "金額"}><input name="amount" type="number" inputMode="numeric" placeholder="0" required={!appointment} /></Field>
      {appointment ? <Field label="狀態"><select name="status">{["已排", "待確認", "已完成", "取消"].map((x) => <option key={x}>{x}</option>)}</select></Field> : <Field label="來源"><select name="source">{["LINE", "IG", "軟體", "熟客", "FansOne", "其他"].map((x) => <option key={x}>{x}</option>)}</select></Field>}
      <Field label="備註"><textarea name="note" placeholder="有什麼值得記住？" /></Field>
      {message ? <p className="page-intro">{message}</p> : null}
      <button className="save" disabled={saving}>{saving ? "儲存中…" : saved ? "已儲存到 Supabase" : "儲存紀錄"}</button>
    </form>
  );
}
