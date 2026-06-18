"use client";

import { useEffect, useMemo, useState } from "react";
import { PulseClient, pulseClientLabel } from "@/lib/pulse/clients";
import { Field } from "./PulseShell";

type EntryKind = "income" | "appointment";

const emptyClient = {
  display_name: "",
  nickname: "",
  contact_method: "LINE",
  line_id: "",
  ig_id: "",
  main_issue: ""
};


export function EntryForm({ kind }: { kind: EntryKind }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<PulseClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [newClient, setNewClient] = useState(emptyClient);
  const appointment = kind === "appointment";
  const selectedClient = useMemo(() => clients.find((client) => client.id === selectedClientId), [clients, selectedClientId]);

  useEffect(() => {
    let active = true;
    fetch("/api/pulse/clients")
      .then((response) => response.json())
      .then((payload) => {
        if (active) setClients(payload.clients ?? []);
      })
      .catch(() => {
        if (active) setError("客戶清單暫時無法讀取，仍可建立新客戶後儲存。");
      });
    return () => {
      active = false;
    };
  }, []);

  async function submit(formData: FormData) {
    setSaving(true);
    setSaved(false);
    setError("");
    const payload = {
      kind,
      entry_date: String(formData.get("entry_date") ?? ""),
      start_time: String(formData.get("start_time") ?? ""),
      service_type: String(formData.get("service_type") ?? ""),
      amount: Number(formData.get("amount") || 0),
      status: String(formData.get("status") ?? "已排"),
      source: String(formData.get("source") ?? "LINE"),
      note: String(formData.get("note") ?? ""),
      client_id: selectedClient?.id ?? "",
      client: selectedClient ? { id: selectedClient.id, display_name: selectedClient.display_name } : newClient
    };
    const response = await fetch("/api/pulse/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(result.error ?? "儲存失敗，請稍後再試。");
      return;
    }
    if (result.client && !selectedClient) {
      setClients((current) => [result.client, ...current]);
      setSelectedClientId(result.client.id);
    }
    setSaved(true);
  }

  return (
    <form className="entry-form" onSubmit={(event) => { event.preventDefault(); void submit(new FormData(event.currentTarget)); }}>
      <Field label="日期"><input name="entry_date" type="date" defaultValue="2026-06-14" required /></Field>
      {appointment && <Field label="時間"><input name="start_time" type="time" defaultValue="14:00" /></Field>}
      <Field label="既有客戶">
        <select value={selectedClientId} onChange={(event) => setSelectedClientId(event.target.value)}>
          <option value="">新增客戶 / 尚未建檔</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{pulseClientLabel(client)}</option>)}
        </select>
      </Field>
      {!selectedClient && <>
        <Field label="客戶顯示名稱"><input value={newClient.display_name} onChange={(event) => setNewClient((current) => ({ ...current, display_name: event.target.value }))} placeholder="display_name（必填）" required /></Field>
        <Field label="暱稱"><input value={newClient.nickname} onChange={(event) => setNewClient((current) => ({ ...current, nickname: event.target.value }))} placeholder="nickname（選填）" /></Field>
        <Field label="聯絡方式"><select value={newClient.contact_method} onChange={(event) => setNewClient((current) => ({ ...current, contact_method: event.target.value }))}>{["LINE", "IG", "電話", "其他"].map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="LINE ID"><input value={newClient.line_id} onChange={(event) => setNewClient((current) => ({ ...current, line_id: event.target.value }))} /></Field>
        <Field label="IG ID"><input value={newClient.ig_id} onChange={(event) => setNewClient((current) => ({ ...current, ig_id: event.target.value }))} /></Field>
        <Field label="主要問題"><input value={newClient.main_issue} onChange={(event) => setNewClient((current) => ({ ...current, main_issue: event.target.value }))} /></Field>
      </>}
      <Field label="服務類型"><select name="service_type"><option>60 分</option><option>90 分</option><option>120 分</option><option>骨盆核心延長</option><option>教練課</option><option>其他</option></select></Field>
      <Field label={appointment ? "預估金額" : "金額"}><input name="amount" type="number" inputMode="numeric" placeholder="0" required={!appointment} /></Field>
      {appointment ? <Field label="狀態"><select name="status">{["已排", "待確認", "已完成", "取消"].map((x) => <option key={x}>{x}</option>)}</select></Field> : <Field label="來源"><select name="source">{["LINE", "IG", "軟體", "熟客", "FansOne", "其他"].map((x) => <option key={x}>{x}</option>)}</select></Field>}
      <Field label="備註"><textarea name="note" placeholder="有什麼值得記住？" /></Field>
      {error && <p className="form-error">{error}</p>}
      <button className="save" disabled={saving}>{saving ? "儲存中…" : saved ? "已同步 Supabase" : "儲存紀錄"}</button>
    </form>
  );
}
