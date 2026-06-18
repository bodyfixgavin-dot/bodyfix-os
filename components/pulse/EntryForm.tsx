"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getTodayInTaipei } from "@/lib/pulse/date";
import { Field } from "./PulseShell";

type ClientOption = { id: string; display_label: string; display_name?: string | null; client_name?: string | null; nickname?: string | null };
type ServiceOption = { service_code: string; service_line: string | null; service_name: string; service_variant: string | null; standard_price: number | null };

type EntryData = { clients: ClientOption[]; services: ServiceOption[]; error?: string; services_error?: string | null };

export function EntryForm({ kind }: { kind: "income" | "appointment" }) {
  const appointment = kind === "appointment";
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(!appointment);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [clientId, setClientId] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [newClient, setNewClient] = useState({ display_name: "", contact_method: "LINE", line_id: "", ig_id: "", main_issue: "" });

  useEffect(() => {
    if (appointment) return;
    fetch("/api/pulse/entry")
      .then(async (response) => {
        const data = (await response.json()) as EntryData;
        if (!response.ok) throw new Error(data.error ?? "讀取 clients 失敗");
        setClients(data.clients ?? []);
        setServices(data.services ?? []);
        setServiceCode(data.services?.[0]?.service_code ?? "");
        setMessage(data.services_error ? `服務讀取提醒：${data.services_error}` : null);
      })
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [appointment]);

  const selectedClient = useMemo(() => clients.find((client) => client.id === clientId), [clientId, clients]);
  const selectedService = useMemo(() => services.find((service) => service.service_code === serviceCode), [serviceCode, services]);

  async function submitIncome(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      entry_date: String(form.get("entry_date") ?? getTodayInTaipei()),
      client_mode: clientMode,
      client_id: clientMode === "existing" ? clientId : undefined,
      client_name_snapshot: clientMode === "existing" ? selectedClient?.display_label : undefined,
      new_client: clientMode === "new" ? newClient : undefined,
      service_code: selectedService?.service_code,
      service_line: selectedService?.service_line,
      service_name: selectedService?.service_name,
      service_variant: selectedService?.service_variant,
      standard_price: selectedService?.standard_price,
      amount_actual: Number(form.get("amount_actual") ?? 0),
      source: String(form.get("source") ?? ""),
      note: String(form.get("note") ?? ""),
    };

    const response = await fetch("/api/pulse/entry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "收入寫入失敗");
    setSaved(true);
    setMessage("收入已寫入 Supabase");
  }

  if (appointment) {
    return <form className="entry-form" onSubmit={(e) => { e.preventDefault(); setSaved(true); }}><Field label="日期"><input name="appointment_date" type="date" defaultValue={getTodayInTaipei()} required /></Field><Field label="時間"><input type="time" defaultValue="14:00" /></Field><Field label="客戶名稱"><input placeholder="輸入客戶名稱" required /></Field><Field label="服務類型"><select><option>骨盆核心延長</option><option>教練課</option><option>其他</option></select></Field><Field label="預估金額"><input type="number" inputMode="numeric" placeholder="0" /></Field><Field label="狀態"><select>{["已排", "待確認", "已完成", "取消"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="備註"><textarea placeholder="有什麼值得記住？" /></Field><button className="save">{saved ? "已暫存（連接 Supabase 後同步）" : "儲存紀錄"}</button></form>;
  }

  return <form className="entry-form" onSubmit={submitIncome}><Field label="日期"><input name="entry_date" type="date" defaultValue={getTodayInTaipei()} required /></Field><Field label="客戶"><select value={clientMode} onChange={(e) => setClientMode(e.target.value as "existing" | "new")}><option value="existing">選擇既有客戶</option><option value="new">新增客戶</option></select></Field>{clientMode === "existing" ? <Field label="既有客戶"><select value={clientId} onChange={(e) => setClientId(e.target.value)} required disabled={loading}><option value="">{loading ? "讀取 clients 中…" : "請選擇客戶"}</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.display_label}</option>)}</select></Field> : <><Field label="新客戶名稱"><input value={newClient.display_name} onChange={(e) => setNewClient({ ...newClient, display_name: e.target.value })} required /></Field><Field label="聯絡方式"><input value={newClient.contact_method} onChange={(e) => setNewClient({ ...newClient, contact_method: e.target.value })} /></Field><Field label="LINE ID"><input value={newClient.line_id} onChange={(e) => setNewClient({ ...newClient, line_id: e.target.value })} /></Field><Field label="IG ID"><input value={newClient.ig_id} onChange={(e) => setNewClient({ ...newClient, ig_id: e.target.value })} /></Field><Field label="主要問題"><input value={newClient.main_issue} onChange={(e) => setNewClient({ ...newClient, main_issue: e.target.value })} /></Field></>}<Field label="服務類型"><select value={serviceCode} onChange={(e) => setServiceCode(e.target.value)} required>{services.map((service) => <option key={service.service_code} value={service.service_code}>{service.service_code}｜{service.service_name}{service.service_variant ? `｜${service.service_variant}` : ""}</option>)}</select></Field><Field label="金額"><input name="amount_actual" type="number" inputMode="numeric" defaultValue={selectedService?.standard_price ?? ""} placeholder="0" required /></Field><Field label="來源"><select name="source">{["LINE", "IG", "軟體", "熟客", "FansOne", "其他"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="備註"><textarea name="note" placeholder="有什麼值得記住？" /></Field>{message && <p className="api-note">{message}</p>}<button className="save" disabled={loading}>{saved ? "已寫入收入紀錄" : "儲存紀錄"}</button></form>;
}
