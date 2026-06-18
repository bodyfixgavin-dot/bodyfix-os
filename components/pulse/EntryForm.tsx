"use client";

import { useEffect, useMemo, useState } from "react";
import { Field } from "./PulseShell";

type ClientOption = { id: string; display_name: string; client_code?: string | null };
type ServiceOption = {
  id?: string;
  service_code: string;
  service_line: string;
  service_name: string;
  service_variant: string;
  duration_minutes: number;
  standard_price: number;
};

type OptionsResponse = { clients: ClientOption[]; services: ServiceOption[]; error?: string };

const today = () => new Date().toISOString().slice(0, 10);
const money = (n: number) => new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }).format(n);
const serviceLabel = (service: ServiceOption) => `${service.service_code}・${service.service_line}・${service.service_name}・${service.duration_minutes} 分鐘・${money(service.standard_price)}`;

export function EntryForm({ kind }: { kind: "income" | "appointment" }) {
  const appointment = kind === "appointment";
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [clientId, setClientId] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/pulse/form-options")
      .then(async (response) => {
        const data = (await response.json()) as OptionsResponse;
        if (!response.ok) throw new Error(data.error || "無法載入表單資料");
        return data;
      })
      .then((data) => {
        if (!alive) return;
        setClients(data.clients ?? []);
        setServices(data.services ?? []);
        const firstService = data.services?.[0];
        if (firstService) {
          setServiceCode(firstService.service_code);
          setAmount(String(firstService.standard_price));
        }
      })
      .catch((err: Error) => alive && setError(err.message));
    return () => { alive = false; };
  }, []);

  const selectedService = useMemo(() => services.find((service) => service.service_code === serviceCode), [serviceCode, services]);
  const selectedClient = useMemo(() => clients.find((client) => client.id === clientId), [clientId, clients]);

  const handleServiceChange = (nextCode: string) => {
    setServiceCode(nextCode);
    const nextService = services.find((service) => service.service_code === nextCode);
    setAmount(nextService ? String(nextService.standard_price) : "");
    setMessage("");
    setError("");
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    if (appointment) {
      setMessage("已暫存預約（收入儲存請使用收入頁）");
      setSaving(false);
      return;
    }
    const form = new FormData(event.currentTarget);
    const payload = {
      entry_date: String(form.get("entry_date") || today()),
      client_id: clientId || null,
      client_name: selectedClient?.display_name || newClientName.trim(),
      new_client_name: clientId ? "" : newClientName.trim(),
      service_code: selectedService?.service_code,
      service_line: selectedService?.service_line,
      service_name: selectedService?.service_name,
      service_variant: selectedService?.service_variant,
      standard_price: selectedService?.standard_price,
      amount_actual: Number(amount),
      source: String(form.get("source") || "LINE"),
      note: String(form.get("note") || "")
    };

    try {
      const response = await fetch("/api/pulse/income", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "儲存失敗");
      setMessage("已儲存收入紀錄");
      if (data.client && !clients.some((client) => client.id === data.client.id)) setClients((current) => [data.client, ...current]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  return <form className="entry-form" onSubmit={submit}>
    <Field label="日期"><input name="entry_date" type="date" defaultValue={today()} required /></Field>
    {appointment && <Field label="時間"><input type="time" defaultValue="14:00" /></Field>}
    <Field label="客戶"><select value={clientId} onChange={(e) => { setClientId(e.target.value); setNewClientName(""); }}><option value="">新增客戶 / 未選擇既有客戶</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.client_code ? `${client.client_code}｜` : ""}{client.display_name}</option>)}</select></Field>
    {!clientId && <Field label="新增客戶名稱"><input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="例如：Jao" required /></Field>}
    <Field label="服務選單"><select value={serviceCode} onChange={(e) => handleServiceChange(e.target.value)} required><option value="">選擇 service_catalog 服務</option>{services.map((service) => <option key={service.service_code} value={service.service_code}>{serviceLabel(service)}</option>)}</select></Field>
    {selectedService && <p className="pulse-form-note">已帶入：{selectedService.service_code} / {selectedService.service_line} / {selectedService.service_name} / {selectedService.service_variant}</p>}
    <Field label={appointment ? "預估金額" : "實收金額"}><input type="number" inputMode="numeric" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required={!appointment} /></Field>
    {appointment ? <Field label="狀態"><select>{["已排", "待確認", "已完成", "取消"].map((x) => <option key={x}>{x}</option>)}</select></Field> : <Field label="來源"><select name="source">{["LINE", "IG", "軟體", "熟客", "FansOne", "其他"].map((x) => <option key={x}>{x}</option>)}</select></Field>}
    <Field label="備註"><textarea name="note" placeholder="有什麼值得記住？" /></Field>
    {error && <p className="pulse-form-error">{error}</p>}
    {message && <p className="pulse-form-success">{message}</p>}
    <button className="save" disabled={saving || !selectedService}>{saving ? "儲存中…" : "儲存紀錄"}</button>
  </form>;
}
