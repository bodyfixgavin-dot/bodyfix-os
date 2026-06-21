"use client";

import { useEffect, useMemo, useState } from "react";
import { getTodayInTaipei } from "@/lib/pulse/date";
import { Field } from "./PulseShell";

type ServiceCatalogItem = { service_code: string | null; service_line: string | null; service_name: string | null; service_variant: string | null; price: number | null; standard_price: number | null; status: string | null; };
type ClientItem = { id: string; display_name: string; contact_method: string | null; line_id: string | null; ig_id: string | null; main_issue: string | null; };

function serviceLabel(service: ServiceCatalogItem) {
  return [service.service_code, service.service_line, service.service_name, service.service_variant, service.price == null ? "NT$0" : `NT$${Number(service.price).toLocaleString("zh-TW")}`].map((part) => String(part ?? "-")).join("・");
}

export function EntryForm({ kind }: { kind: "income" | "appointment" }) {
  const today = getTodayInTaipei();
  const appointment = kind === "appointment";
  const [saved, setSaved] = useState(false);
  const [entryDate, setEntryDate] = useState(today);
  const [appointmentTime, setAppointmentTime] = useState("14:00");
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [serviceCode, setServiceCode] = useState("");
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [clientId, setClientId] = useState("");
  const [newClient, setNewClient] = useState({ display_name: "", contact_method: "LINE", line_id: "", ig_id: "", main_issue: "" });
  const [amountActual, setAmountActual] = useState("");
  const [status, setStatus] = useState("已排");
  const [source, setSource] = useState("LINE");
  const [note, setNote] = useState("");
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function loadOptions() {
      setErrorMessage("");
      const [serviceResponse, clientResponse] = await Promise.all([fetch("/api/pulse/service-catalog", { cache: "no-store" }), fetch("/api/pulse/clients", { cache: "no-store" })]);
      const servicePayload = await serviceResponse.json();
      const clientPayload = await clientResponse.json();
      if (!serviceResponse.ok) throw new Error(servicePayload?.error || "服務資料讀取失敗");
      if (!clientResponse.ok) throw new Error(clientPayload?.error || "客戶資料讀取失敗");
      if (!active) return;
      const nextServices = Array.isArray(servicePayload.services) ? servicePayload.services : [];
      const nextClients = Array.isArray(clientPayload.clients) ? clientPayload.clients : [];
      setServices(nextServices); setClients(nextClients);
      if (nextServices.length > 0) { setServiceCode(nextServices[0].service_code ?? ""); setAmountActual(nextServices[0].price == null ? "" : String(nextServices[0].price)); }
      if (nextClients.length > 0) setClientId(nextClients[0].id);
    }
    loadOptions().catch((error) => { if (active) setErrorMessage(error instanceof Error ? error.message : "資料讀取失敗"); }).finally(() => { if (active) { setLoadingServices(false); setLoadingClients(false); } });
    return () => { active = false; };
  }, []);

  const selectedService = useMemo(() => services.find((service) => service.service_code === serviceCode), [serviceCode, services]);
  const selectedClient = useMemo(() => clients.find((client) => client.id === clientId), [clientId, clients]);

  function updateService(nextServiceCode: string) { setServiceCode(nextServiceCode); const nextService = services.find((service) => service.service_code === nextServiceCode); setAmountActual(nextService?.price == null ? "" : String(nextService.price)); }

  async function ensureClient() {
    if (clientMode === "existing") {
      if (!selectedClient) throw new Error("請先選擇客戶");
      return selectedClient;
    }
    const response = await fetch("/api/pulse/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newClient) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error || "新增客戶失敗");
    setClients((current) => [...current, payload.client]); setClientId(payload.client.id); setClientMode("existing");
    return payload.client as ClientItem;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaved(false); setMessage(""); setErrorMessage("");
    try {
      if (!selectedService) throw new Error("請先選擇服務");
      const client = await ensureClient();
      const payload = { client_id: client.id, client_name_snapshot: client.display_name, service_code: selectedService.service_code, service_line: selectedService.service_line, service_name: selectedService.service_name, service_variant: selectedService.service_variant, standard_price: selectedService.price, amount_actual: Number(amountActual || 0), note };
      const response = await fetch(appointment ? "/api/pulse/appointments" : "/api/pulse/income", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(appointment ? { ...payload, appointment_date: entryDate, appointment_time: appointmentTime, status } : { ...payload, entry_date: entryDate, source }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "寫入失敗");
      setSaved(true); setMessage(appointment ? "預約已寫入 pulse_appointments" : "收入已寫入 pulse_income_entries");
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "寫入失敗"); }
  }

  return <form className="entry-form" onSubmit={submit}>
    <Field label="日期"><input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} required /></Field>
    {appointment && <Field label="時間"><input type="time" value={appointmentTime} onChange={(event) => setAppointmentTime(event.target.value)} /></Field>}
    <Field label="客戶"><select value={clientMode === "new" ? "__new" : clientId} onChange={(event) => { if (event.target.value === "__new") setClientMode("new"); else { setClientMode("existing"); setClientId(event.target.value); } }} disabled={loadingClients}><option value="">搜尋 / 選擇既有客戶</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.display_name}・{client.contact_method ?? "未填聯絡方式"}</option>)}<option value="__new">+ 新增客戶</option></select></Field>
    {clientMode === "new" ? <><Field label="新客戶名稱"><input value={newClient.display_name} onChange={(event) => setNewClient({ ...newClient, display_name: event.target.value })} required /></Field><Field label="聯絡方式"><input value={newClient.contact_method} onChange={(event) => setNewClient({ ...newClient, contact_method: event.target.value })} required /></Field><div className="form-two"><Field label="LINE ID"><input value={newClient.line_id} onChange={(event) => setNewClient({ ...newClient, line_id: event.target.value })} /></Field><Field label="IG ID"><input value={newClient.ig_id} onChange={(event) => setNewClient({ ...newClient, ig_id: event.target.value })} /></Field></div><Field label="主要問題"><input value={newClient.main_issue} onChange={(event) => setNewClient({ ...newClient, main_issue: event.target.value })} /></Field></> : null}
    <Field label="服務類型"><select value={serviceCode} onChange={(event) => updateService(event.target.value)} disabled={loadingServices || services.length === 0} required>{loadingServices ? <option value="">讀取 service_catalog 中…</option> : null}{!loadingServices && !errorMessage && services.length === 0 ? <option value="">service_catalog 目前沒有 active / trial 服務</option> : null}{services.map((service) => <option key={service.service_code ?? serviceLabel(service)} value={service.service_code ?? ""}>{serviceLabel(service)}</option>)}</select></Field>
    {selectedService ? <p className="pulse-form-note">已選服務狀態：{selectedService.status}</p> : null}
    <Field label={appointment ? "預估金額" : "實收金額"}><input name="amount_actual" type="number" inputMode="numeric" placeholder="0" value={amountActual} onChange={(event) => setAmountActual(event.target.value)} required={!appointment} /></Field>
    {appointment ? <Field label="狀態"><select value={status} onChange={(event) => setStatus(event.target.value)}>{["已排", "待確認", "已完成", "取消"].map((x) => <option key={x}>{x}</option>)}</select></Field> : <Field label="來源"><select value={source} onChange={(event) => setSource(event.target.value)}>{["LINE", "IG", "軟體", "熟客", "FansOne", "其他"].map((x) => <option key={x}>{x}</option>)}</select></Field>}
    <Field label="備註"><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="有什麼值得記住？" /></Field>
    {errorMessage ? <p className="pulse-form-note">{errorMessage}</p> : null}{message ? <p className="pulse-form-note">{message}</p> : null}
    <button className="save">{saved ? "已寫入 Supabase" : "儲存紀錄"}</button>
  </form>;
}
