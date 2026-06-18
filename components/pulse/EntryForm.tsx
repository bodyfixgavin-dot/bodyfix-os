"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field } from "./PulseShell";

function taipeiToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("zh-TW").format(amount);
}

export function EntryForm({ kind }: { kind: "income" | "appointment" }) {
  const router = useRouter();
  const appointment = kind === "appointment";
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string }>();
  const [saving, setSaving] = useState(false);

  async function save(formData: FormData) {
    setSaving(true);
    setStatus(undefined);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus({ type: "error", message: "Supabase 環境變數缺失：請設定 NEXT_PUBLIC_SUPABASE_URL 與 NEXT_PUBLIC_SUPABASE_ANON_KEY。" });
      setSaving(false);
      return;
    }

    const amount = Number(formData.get("amount") || 0);
    const { error } = appointment
      ? await supabase.from("pulse_appointments").insert({
          appointment_date: String(formData.get("date") || ""),
          start_time: String(formData.get("time") || ""),
          client_name: String(formData.get("client_name") || ""),
          service_type: String(formData.get("service_type") || ""),
          estimated_amount: amount,
          status: String(formData.get("appointment_status") || "已排"),
          note: String(formData.get("note") || "")
        })
      : await supabase.from("pulse_income_entries").insert({
          entry_date: String(formData.get("date") || ""),
          client_name: String(formData.get("client_name") || ""),
          service_type: String(formData.get("service_type") || ""),
          amount,
          source: String(formData.get("source") || ""),
          note: String(formData.get("note") || "")
        });
    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setStatus({ type: "success", message: appointment ? "已記錄預約" : `已記錄收入 NT$${formatMoney(amount)}` });
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form className="entry-form" action={save}>
      <Field label="日期"><input name="date" type="date" defaultValue={taipeiToday()} required /></Field>
      {appointment && <Field label="時間"><input name="time" type="time" defaultValue="14:00" /></Field>}
      <Field label="客戶名稱"><input name="client_name" placeholder="輸入客戶名稱" required={appointment} /></Field>
      <Field label="服務類型"><select name="service_type"><option>60 分</option><option>90 分</option><option>120 分</option><option>骨盆核心延長</option><option>教練課</option><option>其他</option></select></Field>
      <Field label={appointment ? "預估金額" : "金額"}><input name="amount" type="number" inputMode="numeric" placeholder="0" required={!appointment} /></Field>
      {appointment ? <Field label="狀態"><select name="appointment_status">{["已排", "待確認", "已完成", "取消"].map((x) => <option key={x}>{x}</option>)}</select></Field> : <Field label="來源"><select name="source">{["LINE", "IG", "軟體", "熟客", "FansOne", "其他"].map((x) => <option key={x}>{x}</option>)}</select></Field>}
      <Field label="備註"><textarea name="note" placeholder="有什麼值得記住？" /></Field>
      {status && <p className={`form-message ${status.type}`}>{status.message}</p>}
      <button className="save" disabled={saving}>{saving ? "儲存中…" : "儲存紀錄"}</button>
    </form>
  );
}
