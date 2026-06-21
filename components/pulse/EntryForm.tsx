"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field } from "./PulseShell";

type Client = {
  id: string;
  client_code?: string | null;
  display_name?: string | null;
  nickname?: string | null;
  client_name?: string | null;
  phone?: string | null;
  line_id?: string | null;
  ig_id?: string | null;
  instagram?: string | null;
  source?: string | null;
};

type ScoredClient = Client & { aliasMatched?: boolean; score: number };

type ClientSelectValue = { client: Client | null; rawName: string };

const clientSelectFields = "id, client_code, display_name, nickname, client_name, phone, line_id, ig_id, instagram, source";
const stableFields: Array<keyof Client> = ["client_code", "phone", "line_id", "ig_id", "instagram"];
const nameFields: Array<keyof Client> = ["display_name", "nickname", "client_name"];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function includes(value: string | null | undefined, query: string) {
  return normalize(value ?? "").includes(normalize(query));
}

function exact(value: string | null | undefined, query: string) {
  return normalize(value ?? "") === normalize(query);
}

function contactMethod(client: Client) {
  if (client.line_id) return "LINE";
  if (client.ig_id || client.instagram) return "IG";
  if (client.phone) return "電話";
  return "";
}

function clientDisplayName(client: Client) {
  return client.display_name || client.nickname || client.client_name || client.client_code || "未命名客戶";
}

function formatClient(client: Client) {
  return [client.client_code, clientDisplayName(client), contactMethod(client)].filter(Boolean).join("｜");
}

function scoreClient(client: Client, query: string, aliasMatched = false): ScoredClient {
  const stableExact = stableFields.some((field) => exact(client[field], query));
  const alias = aliasMatched;
  const nameMatch = nameFields.some((field) => includes(client[field], query));
  const stableFuzzy = stableFields.some((field) => includes(client[field], query));
  return { ...client, aliasMatched: alias, score: stableExact ? 0 : alias ? 1 : nameMatch ? 2 : stableFuzzy ? 3 : 4 };
}

async function searchClients(query: string): Promise<ScoredClient[]> {
  const supabase = createSupabaseBrowserClient();
  const keyword = query.trim();
  if (!supabase || !keyword) return [];
  const pattern = `%${keyword.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
  const clientSearch = supabase
    .from("clients")
    .select(clientSelectFields)
    .or([
      `client_code.ilike.${pattern}`,
      `display_name.ilike.${pattern}`,
      `nickname.ilike.${pattern}`,
      `client_name.ilike.${pattern}`,
      `phone.ilike.${pattern}`,
      `line_id.ilike.${pattern}`,
      `ig_id.ilike.${pattern}`,
      `instagram.ilike.${pattern}`
    ].join(","))
    .limit(20);
  const aliasSearch = supabase
    .from("client_aliases")
    .select(`client_id, alias_name, clients(${clientSelectFields})`)
    .ilike("alias_name", pattern)
    .limit(20);

  const [clientResult, aliasResult] = await Promise.all([clientSearch, aliasSearch]);
  const byId = new Map<string, ScoredClient>();

  for (const client of ((clientResult.data ?? []) as Client[])) {
    byId.set(client.id, scoreClient(client, keyword));
  }

  for (const row of ((aliasResult.data ?? []) as Array<{ clients?: Client | Client[] | null }>)) {
    const rawClient = Array.isArray(row.clients) ? row.clients[0] : row.clients;
    if (!rawClient?.id) continue;
    const scored = scoreClient(rawClient, keyword, true);
    const current = byId.get(rawClient.id);
    if (!current || scored.score < current.score) byId.set(rawClient.id, scored);
  }

  return [...byId.values()].sort((a, b) => a.score - b.score || formatClient(a).localeCompare(formatClient(b), "zh-Hant"));
}

async function addAlias(clientId: string, aliasName: string, aliasType: string, source: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase || !aliasName.trim()) return;
  await supabase.from("client_aliases").insert({ client_id: clientId, alias_name: aliasName.trim(), alias_type: aliasType, source });
}

function ClientSelect({ value, onChange, onCreateNew }: { value: ClientSelectValue; onChange: (value: ClientSelectValue) => void; onCreateNew: () => void }) {
  const [results, setResults] = useState<ScoredClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const rawName = value.rawName;

  useEffect(() => {
    let active = true;
    setNotice("");
    if (!rawName.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchClients(rawName)
      .then((clients) => {
        if (!active) return;
        setResults(clients);
      })
      .catch(() => {
        if (active) setNotice("客戶搜尋暫時無法使用，請確認 Supabase schema 已套用。");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [rawName]);

  const possibleDuplicate = results.length > 0 && rawName.trim() && !value.client;

  return <div className="client-select">
    <Field label="客戶名稱">
      <input
        placeholder="輸入客戶名稱、代號、電話、LINE 或 IG"
        required
        value={rawName}
        onChange={(event) => onChange({ client: null, rawName: event.target.value })}
      />
    </Field>
    {value.client ? <p className="client-selected">已選擇：{formatClient(value.client)}</p> : null}
    {loading ? <p className="client-hint">搜尋既有客戶中…</p> : null}
    {notice ? <p className="client-hint">{notice}</p> : null}
    {possibleDuplicate ? <section className="duplicate-card">
      <strong>可能是同一位客戶</strong>
      {results.slice(0, 5).map((client) => <article key={client.id}>
        <span>{formatClient(client)}</span>
        <div>
          <button type="button" onClick={() => onChange({ client, rawName })}>使用這位客戶</button>
          <button type="button" onClick={async () => { await addAlias(client.id, rawName, "manual", "income_form"); onChange({ client, rawName }); }}>新增為這位客戶的別名</button>
        </div>
      </article>)}
      <button className="create-new-client" type="button" onClick={onCreateNew}>建立新客戶</button>
      <small>請先確認：使用既有客戶、新增為別名，或建立新客戶。</small>
    </section> : results.length > 0 ? <div className="client-result-list">
      {results.slice(0, 5).map((client) => <button key={client.id} type="button" onClick={() => onChange({ client, rawName })}>{formatClient(client)}</button>)}
    </div> : rawName.trim() ? <p className="client-hint">找不到既有客戶，儲存時會建立新客戶。</p> : null}
  </div>;
}

export function EntryForm({ kind }: { kind: "income" | "appointment" }) {
  const [saved, setSaved] = useState("");
  const [clientValue, setClientValue] = useState<ClientSelectValue>({ client: null, rawName: "" });
  const [saving, setSaving] = useState(false);
  const [allowCreateDuplicate, setAllowCreateDuplicate] = useState(false);
  const appointment = kind === "appointment";
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function resolveClient() {
    const supabase = createSupabaseBrowserClient();
    const rawName = clientValue.rawName.trim();
    if (!supabase || !rawName) return clientValue.client;
    if (clientValue.client) return clientValue.client;
    const matches = await searchClients(rawName);
    if (matches.length > 0 && !allowCreateDuplicate) {
      setSaved("可能是同一位客戶，請先選擇使用既有客戶、新增為別名，或再次確認後建立新客戶。");
      return null;
    }
    const { data, error } = await supabase
      .from("clients")
      .insert({ display_name: rawName, client_name: rawName, source: appointment ? "pulse_appointment" : "pulse_income" })
      .select(clientSelectFields)
      .single();
    if (error) throw error;
    await addAlias(data.id, rawName, "primary_name", "client_create");
    await addAlias(data.id, rawName, "manual", "income_form");
    setClientValue({ client: data as Client, rawName });
    return data as Client;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved("");
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setSaved("已暫存（連接 Supabase 後同步）");
        return;
      }
      const form = new FormData(event.currentTarget);
      const client = await resolveClient();
      if (!client) return;
      const payload = appointment ? {
        appointment_date: String(form.get("date")),
        start_time: String(form.get("time") || "") || null,
        client_id: client.id,
        client_name: clientDisplayName(client),
        client_name_snapshot: clientDisplayName(client),
        service_type: String(form.get("service_type") || ""),
        estimated_amount: Number(form.get("amount") || 0) || null,
        status: String(form.get("status") || "已排"),
        note: String(form.get("note") || "")
      } : {
        entry_date: String(form.get("date")),
        client_id: client.id,
        client_name: clientDisplayName(client),
        client_name_snapshot: clientDisplayName(client),
        service_type: String(form.get("service_type") || ""),
        amount: Number(form.get("amount") || 0),
        source: String(form.get("source") || ""),
        note: String(form.get("note") || "")
      };
      const { error } = await supabase.from(appointment ? "pulse_appointments" : "pulse_income_entries").insert(payload as Record<string, unknown>);
      if (error) throw error;
      setSaved(appointment ? "已新增預約" : "已新增收入");
    } catch (error) {
      setSaved(error instanceof Error ? error.message : "儲存失敗，請稍後再試。");
    } finally {
      setSaving(false);
    }
  }

  return <form className="entry-form" onSubmit={save}>
    <Field label="日期"><input name="date" type="date" defaultValue={today} required /></Field>
    {appointment && <Field label="時間"><input name="time" type="time" defaultValue="14:00" /></Field>}
    <ClientSelect value={clientValue} onChange={(next) => { setAllowCreateDuplicate(false); setClientValue(next); }} onCreateNew={() => { setAllowCreateDuplicate(true); setSaved("已確認建立新客戶，請再次按儲存紀錄。"); }} />
    <Field label="服務類型"><select name="service_type"><option>60 分</option><option>90 分</option><option>120 分</option><option>骨盆核心延長</option><option>教練課</option><option>其他</option></select></Field>
    <Field label={appointment ? "預估金額" : "金額"}><input name="amount" type="number" inputMode="numeric" placeholder="0" required={!appointment} /></Field>
    {appointment ? <Field label="狀態"><select name="status">{["已排", "待確認", "已完成", "取消"].map((x) => <option key={x}>{x}</option>)}</select></Field> : <Field label="來源"><select name="source">{["LINE", "IG", "軟體", "熟客", "FansOne", "其他"].map((x) => <option key={x}>{x}</option>)}</select></Field>}
    <Field label="備註"><textarea name="note" placeholder="有什麼值得記住？" /></Field>
    <button className="save" disabled={saving}>{saving ? "儲存中…" : "儲存紀錄"}</button>
    {saved ? <p className="client-hint">{saved}</p> : null}
  </form>;
}
