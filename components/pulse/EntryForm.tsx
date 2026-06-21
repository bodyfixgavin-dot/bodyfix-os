"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Field } from "./PulseShell";

type Option = { id: string; label: string; price?: number | null };

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(new Date());

export function EntryForm({ kind }: { kind: "income" | "appointment" }) {
  const [clients, setClients] = useState<Option[]>([]);
  const [services, setServices] = useState<Option[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const appointment = kind === "appointment";

  useEffect(() => {
    async function loadOptions() {
      try {
        const [clientRes, serviceRes] = await Promise.all([
          fetch("/api/pulse/clients", { cache: "no-store" }),
          fetch("/api/pulse/service-catalog", { cache: "no-store" }),
        ]);
        const clientData = await clientRes.json().catch(() => ({ clients: [] }));
        const serviceData = await serviceRes.json().catch(() => ({ services: [] }));
        setClients(clientData.clients ?? []);
        setServices(serviceData.services ?? []);
      } catch {
        setMessage("選單載入失敗，請稍後再試；頁面仍可繼續瀏覽。");
      }
    }
    loadOptions();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSaving(true);
    setMessage("");
    try {
      const payload = Object.fromEntries(formData.entries());
      const response = await fetch("/api/pulse/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, ...payload }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "儲存失敗");
      setMessage("已寫入 Pulse 收入紀錄。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "API 錯誤，資料未寫入；頁面不會中斷。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="entry-form" onSubmit={submit}>
      <Field label="日期"><input name="entry_date" type="date" defaultValue={today()} required /></Field>
      {appointment && <Field label="時間"><input name="start_time" type="time" defaultValue="14:00" /></Field>}
      <Field label="客戶">
        <select name="client_id" required>
          <option value="">選擇 clients 客戶</option>
          {clients.map((client) => <option value={client.id} key={client.id}>{client.label}</option>)}
        </select>
      </Field>
      <Field label="服務類型">
        <select name="service_id" required>
          <option value="">選擇 service_catalog 服務</option>
          {services.map((service) => <option value={service.id} key={service.id}>{service.label}</option>)}
        </select>
      </Field>
      <Field label={appointment ? "預估金額" : "金額"}><input name="amount" type="number" inputMode="numeric" placeholder="0" required={!appointment} /></Field>
      {appointment ? (
        <Field label="狀態"><select name="status">{["已排", "待確認", "已完成", "取消"].map((x) => <option key={x}>{x}</option>)}</select></Field>
      ) : (
        <Field label="來源"><select name="source">{["LINE", "IG", "軟體", "熟客", "FansOne", "其他"].map((x) => <option key={x}>{x}</option>)}</select></Field>
      )}
      <Field label="備註"><textarea name="note" placeholder="有什麼值得記住？" /></Field>
      <button className="save" disabled={saving}>{saving ? "寫入中..." : "儲存紀錄"}</button>
      {message && <p className="page-intro" role="status">{message}</p>}
    </form>
  );
}
