"use client";

import { useEffect, useMemo, useState } from "react";
import { Field } from "./PulseShell";
import { getTodayInTaipei } from "@/lib/pulse/date";

type ClientOption = { id: string; client_code?: string | null; display_name?: string | null; nickname?: string | null; client_name?: string | null; phone?: string | null; line_id?: string | null; ig_id?: string | null; instagram?: string | null; matched_alias?: string | null };
type ServiceOption = { service_code: string; service_line: string | null; service_name: string; service_variant: string | null; standard_price: number | null; price: number | null };

type SelectedClient = { id: string; name: string };

function contactMethod(client: ClientOption) {
  return client.line_id || client.ig_id || client.instagram || client.phone || "";
}

function clientLabel(client: ClientOption) {
  const name = client.display_name || client.nickname || client.client_name || client.matched_alias || "未命名客戶";
  return [client.client_code, name, contactMethod(client)].filter(Boolean).join("｜");
}

function servicePrice(service: ServiceOption) {
  return Number(service.standard_price ?? service.price ?? 0);
}

function serviceLabel(service: ServiceOption) {
  return [service.service_code, service.service_line, service.service_name, service.service_variant, `NT$${servicePrice(service).toLocaleString("zh-TW")}`].filter(Boolean).join("・");
}

function ClientSelect({ onChange, required }: { onChange: (client: SelectedClient | null) => void; required?: boolean }) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<ClientOption[]>([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/pulse/clients?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setOptions(Array.isArray(data) ? data : []))
      .catch(() => undefined);
    return () => controller.abort();
  }, [query]);

  return <>
    <input placeholder="搜尋客戶代碼、姓名、暱稱、電話、LINE、IG 或別名" value={query} onChange={(event) => { setQuery(event.target.value); setValue(""); onChange(null); }} />
    <select required={required} value={value} onChange={(event) => { const selected = options.find((client) => client.id === event.target.value) ?? null; setValue(event.target.value); onChange(selected ? { id: selected.id, name: selected.display_name || selected.nickname || selected.client_name || selected.matched_alias || "未命名客戶" } : null); }}>
      <option value="">請選擇正式客戶</option>
      {options.map((client) => <option key={client.id} value={client.id}>{clientLabel(client)}</option>)}
    </select>
  </>;
}

function ServiceCatalogSelect({ value, onChange }: { value: string; onChange: (service: ServiceOption | null) => void }) {
  const [options, setOptions] = useState<ServiceOption[]>([]);

  useEffect(() => {
    fetch("/api/pulse/service-catalog")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setOptions(Array.isArray(data) ? data : []))
      .catch(() => undefined);
  }, []);

  return <select required value={value} onChange={(event) => onChange(options.find((service) => service.service_code === event.target.value) ?? null)}>
    <option value="">請選擇 service_catalog 服務</option>
    {options.map((service) => <option key={service.service_code} value={service.service_code}>{serviceLabel(service)}</option>)}
  </select>;
}

export function EntryForm({ kind }: { kind: "income" | "appointment" }) {
  const appointment = kind === "appointment";
  const [client, setClient] = useState<SelectedClient | null>(null);
  const [service, setService] = useState<ServiceOption | null>(null);
  const [amount, setAmount] = useState("");
  const [saved, setSaved] = useState("");
  const today = useMemo(() => getTodayInTaipei(), []);

  useEffect(() => {
    if (service) setAmount(String(servicePrice(service)));
  }, [service]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client || !service) return;
    const form = new FormData(event.currentTarget);
    const payload = {
      kind,
      entry_date: form.get("entry_date"),
      appointment_date: form.get("entry_date"),
      start_time: form.get("start_time"),
      client_id: client.id,
      client_name_snapshot: client.name,
      service_code: service.service_code,
      service_line: service.service_line,
      service_name: service.service_name,
      service_variant: service.service_variant,
      standard_price: servicePrice(service),
      amount_actual: Number(amount || 0),
      estimated_amount: Number(amount || 0),
      source: form.get("source"),
      status: form.get("status"),
      note: form.get("note")
    };
    const response = await fetch("/api/pulse/entries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaved(response.ok ? "已儲存至 Supabase" : "儲存失敗，請檢查 Supabase 設定");
  }

  return <form className="entry-form" onSubmit={submit}>
    <Field label="日期"><input name="entry_date" type="date" defaultValue={today} required /></Field>
    {appointment && <Field label="時間"><input name="start_time" type="time" defaultValue="14:00" /></Field>}
    <Field label="客戶"><ClientSelect required onChange={setClient} /></Field>
    <Field label="服務"><ServiceCatalogSelect value={service?.service_code ?? ""} onChange={setService} /></Field>
    <Field label={appointment ? "預估金額" : "實收金額"}><input name="amount_actual" type="number" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" required={!appointment} /></Field>
    {appointment ? <Field label="狀態"><select name="status" defaultValue="已排">{["已排", "待確認", "已完成", "取消"].map((x) => <option key={x}>{x}</option>)}</select></Field> : <Field label="來源"><select name="source">{["LINE", "IG", "軟體", "熟客", "FansOne", "其他"].map((x) => <option key={x}>{x}</option>)}</select></Field>}
    <Field label="備註"><textarea name="note" placeholder="有什麼值得記住？" /></Field>
    <button className="save">{saved || "儲存紀錄"}</button>
  </form>;
}
