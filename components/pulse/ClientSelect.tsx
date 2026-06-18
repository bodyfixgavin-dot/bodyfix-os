"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type PulseClient = {
  id: string;
  client_code: string | null;
  display_name: string;
  contact_method: string | null;
  main_issue: string | null;
};

type NewClient = {
  display_name: string;
  contact_method: string;
  line_id: string;
  ig_id: string;
  phone: string;
  main_issue: string;
  source: string;
};

const blankClient: NewClient = { display_name: "", contact_method: "LINE", line_id: "", ig_id: "", phone: "", main_issue: "", source: "" };
const phoneLike = /^\+?[\d\s().-]{7,}$/;

export function ClientSelect({ value, onChange }: { value?: string; onChange: (client: PulseClient | null) => void }) {
  const [clients, setClients] = useState<PulseClient[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [newClient, setNewClient] = useState<NewClient>(blankClient);

  async function loadClients() {
    setError("");
    const db = createSupabaseBrowserClient();
    if (!db) return;
    const { data, error } = await db
      .from("clients")
      .select("id, client_code, display_name, contact_method, main_issue")
      .in("client_status", ["active", "member", "vip"])
      .eq("is_selectable", true)
      .not("display_name", "is", null)
      .order("client_code", { ascending: true });
    if (error) setError(error.message);
    else setClients((data ?? []).filter((client) => client.display_name && !phoneLike.test(client.display_name)) as PulseClient[]);
  }

  useEffect(() => { loadClients(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((client) => !q || [client.client_code, client.display_name, client.contact_method, client.main_issue].some((v) => String(v ?? "").toLowerCase().includes(q)));
  }, [clients, query]);
  const selected = clients.find((client) => client.id === value) ?? null;

  async function addClient() {
    setError("");
    const db = createSupabaseBrowserClient();
    if (!db) return setError("Supabase 尚未設定，無法新增客戶。");
    if (!newClient.display_name.trim()) return setError("請先填寫客戶名稱。");
    const nextCode = `BF-C-${String(clients.length + 1).padStart(4, "0")}`;
    const payload = {
      client_code: nextCode,
      display_name: newClient.display_name.trim(),
      contact_method: newClient.contact_method || null,
      line_id: newClient.line_id || null,
      ig_id: newClient.ig_id || null,
      phone: newClient.phone || null,
      main_issue: newClient.main_issue || null,
      source: newClient.source || null,
      client_status: "active",
      client_type: "individual",
      is_selectable: true,
    };
    const { data, error } = await db.from("clients").insert(payload).select("id, client_code, display_name, contact_method, main_issue").single();
    if (error) return setError(error.message);
    const client = data as PulseClient;
    setClients((items) => [...items, client]);
    onChange(client);
    setAdding(false);
    setNewClient(blankClient);
  }

  return <div className="pulse-select-block">
    <input placeholder="搜尋客戶" value={query} onChange={(event) => setQuery(event.target.value)} />
    <select value={value ?? ""} onChange={(event) => onChange(clients.find((client) => client.id === event.target.value) ?? null)} required>
      <option value="">選擇既有客戶</option>
      {filtered.map((client) => <option key={client.id} value={client.id}>{client.client_code ?? "未編號"}｜{client.display_name}｜{client.contact_method ?? "未填"}</option>)}
    </select>
    {selected?.main_issue ? <small>主要問題：{selected.main_issue}</small> : null}
    {error ? <small className="pulse-error">{error}</small> : null}
    <button type="button" className="link-button" onClick={() => setAdding((open) => !open)}>{adding ? "取消新增" : "新增客戶"}</button>
    {adding ? <div className="inline-form">
      {(["display_name", "contact_method", "line_id", "ig_id", "phone", "main_issue", "source"] as const).map((key) => <input key={key} placeholder={key === "display_name" ? "display_name" : key} value={newClient[key]} onChange={(event) => setNewClient((current) => ({ ...current, [key]: event.target.value }))} />)}
      <button type="button" className="save" onClick={addClient}>新增並選取</button>
    </div> : null}
  </div>;
}
