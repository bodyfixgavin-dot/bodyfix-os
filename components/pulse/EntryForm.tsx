"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getTodayInTaipei } from "@/lib/pulse/data";

type ClientOption = { id: string; display_name?: string | null; nickname?: string | null; client_name?: string | null; aliases?: string[] };
type ServiceOption = { service_code: string; service_line: string; service_name: string; service_variant: string; price: number };

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label><span>{label}</span>{children}</label>;
}

function formatService(s: ServiceOption) {
  return `${s.service_code}・${s.service_line}・${s.service_name}・${s.service_variant}・NT$${Number(s.price).toLocaleString("zh-TW")}`;
}

function clientName(c: ClientOption) {
  return c.display_name || c.nickname || c.client_name || c.id;
}

function ClientSelect({ value, onChange }: { value: string; onChange: (client: ClientOption | null) => void }) {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/pulse/clients").then(async (res) => {
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "clients API 讀取失敗");
      setClients(json.clients ?? []);
    }).catch((err) => setError(err.message));
  }, []);
  if (error) return <p className="form-error">{error}</p>;
  return <select value={value} required onChange={(e) => onChange(clients.find((c) => c.id === e.target.value) ?? null)}><option value="">選擇正式客戶</option>{clients.map((c) => <option key={c.id} value={c.id}>{clientName(c)}{c.aliases?.length ? `（${c.aliases.join("、")}）` : ""}</option>)}</select>;
}

function ServiceCatalogSelect({ value, onChange }: { value: string; onChange: (service: ServiceOption | null) => void }) {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/pulse/service-catalog").then(async (res) => {
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "service-catalog API 讀取失敗");
      setServices(json.services ?? []);
    }).catch((err) => setError(err.message));
  }, []);
  if (error) return <p className="form-error">{error}</p>;
  return <select value={value} required onChange={(e) => onChange(services.find((s) => s.service_code === e.target.value) ?? null)}><option value="">選擇正式服務</option>{services.map((s) => <option key={s.service_code} value={s.service_code}>{formatService(s)}</option>)}</select>;
}

export function EntryForm({ kind }: { kind: "income" | "appointment" }) {
  const appointment = kind === "appointment";
  const [date, setDate] = useState(getTodayInTaipei());
  const [client, setClient] = useState<ClientOption | null>(null);
  const [service, setService] = useState<ServiceOption | null>(null);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("LINE");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const serviceValue = useMemo(() => service?.service_code ?? "", [service]);
  const clientValue = useMemo(() => client?.id ?? "", [client]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("儲存中…");
    if (appointment) {
      setMessage("Appointment v1 僅整合新版客戶與服務選單；尚未啟用寫入。");
      return;
    }
    const res = await fetch("/api/pulse/income", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, client, service, amount_actual: Number(amount), source, note }) });
    const json = await res.json();
    setMessage(res.ok ? "已儲存到 Supabase" : (json.error || "儲存失敗"));
  }

  return <form className="entry-form" onSubmit={submit}>
    <Field label="日期"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></Field>
    {appointment && <Field label="時間"><input type="time" defaultValue="14:00" /></Field>}
    <Field label="客戶"><ClientSelect value={clientValue} onChange={setClient} /></Field>
    <Field label="服務"><ServiceCatalogSelect value={serviceValue} onChange={(s) => { setService(s); if (s && !amount) setAmount(String(s.price)); }} /></Field>
    <Field label={appointment ? "預估金額" : "實收金額"}><input type="number" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" required={!appointment} /></Field>
    <Field label="來源"><select value={source} onChange={(e) => setSource(e.target.value)}>{["LINE", "IG", "軟體", "熟客", "FansOne"].map((x) => <option key={x}>{x}</option>)}</select></Field>
    <Field label="備註"><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="有什麼值得記住？" /></Field>
    <button className="save">儲存紀錄</button>{message && <p className="form-status">{message}</p>}
  </form>;
}
