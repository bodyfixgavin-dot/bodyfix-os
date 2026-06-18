"use client";

import { useState } from "react";
import { Field } from "./PulseShell";
import { ClientSelect, type PulseClient } from "./ClientSelect";
import { ServiceCatalogSelect, type PulseService } from "./ServiceCatalogSelect";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getTodayInTaipei } from "@/lib/pulse/date";

export function EntryForm({ kind }: { kind: "income" | "appointment" }) {
  const appointment = kind === "appointment";
  const [client, setClient] = useState<PulseClient | null>(null);
  const [service, setService] = useState<PulseService | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function selectService(next: PulseService | null) {
    setService(next);
    setAmount(next ? String(next.standard_price) : "");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    const db = createSupabaseBrowserClient();
    if (!db) { setMessage("Supabase 尚未設定，無法儲存正式資料。"); setSaving(false); return; }
    const form = new FormData(event.currentTarget);
    const actualAmount = Number(amount || 0);
    const common = {
      client_id: client?.id ?? null,
      client_name_snapshot: client?.display_name ?? null,
      service_code: service?.service_code ?? null,
      service_line: service?.service_line ?? null,
      service_name: service?.service_name ?? null,
      service_variant: service?.service_variant ?? null,
      standard_price: service?.standard_price ?? null,
      service_type: service ? `${service.service_name}｜${service.service_variant ?? "標準"}` : null,
      note: String(form.get("note") ?? "") || null,
    };
    const result = appointment
      ? await db.from("pulse_appointments").insert({
          ...common,
          appointment_date: String(form.get("date")),
          start_time: String(form.get("time") || ""),
          estimated_amount: actualAmount,
          amount_actual: actualAmount,
          status: String(form.get("status")),
        })
      : await db.from("pulse_income_entries").insert({
          ...common,
          entry_date: String(form.get("date")),
          amount_actual: actualAmount,
          amount: actualAmount,
          source: String(form.get("source")),
        });
    setMessage(result.error ? result.error.message : "已儲存正式資料");
    setSaving(false);
  }

  return <form className="entry-form" onSubmit={submit}>
    <Field label="日期"><input name="date" type="date" defaultValue={getTodayInTaipei()} required /></Field>
    {appointment ? <Field label="時間"><input name="time" type="time" defaultValue="14:00" /></Field> : null}
    <Field label="客戶"><ClientSelect value={client?.id} onChange={setClient} /></Field>
    <Field label="服務"><ServiceCatalogSelect value={service?.service_code} onChange={selectService} /></Field>
    <Field label={appointment ? "預估金額" : "實收金額"}><input type="number" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" required /></Field>
    {appointment ? <Field label="狀態"><select name="status">{["已排", "待確認", "已完成", "取消"].map((x) => <option key={x}>{x}</option>)}</select></Field> : <Field label="來源"><select name="source">{["LINE", "IG", "軟體", "熟客", "FansOne", "其他"].map((x) => <option key={x}>{x}</option>)}</select></Field>}
    <Field label="備註"><textarea name="note" placeholder="有什麼值得記住？" /></Field>
    {message ? <p className={message.includes("已儲存") ? "pulse-success" : "pulse-error"}>{message}</p> : null}
    <button className="save" disabled={saving}>{saving ? "儲存中…" : "儲存紀錄"}</button>
  </form>;
}
