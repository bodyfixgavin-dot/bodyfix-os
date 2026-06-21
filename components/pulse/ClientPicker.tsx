"use client";
import { useMemo, useState } from "react";
import type { PulseClient } from "@/lib/pulse/data";

type Props = { clients: PulseClient[]; required?: boolean };

export function ClientPicker({ clients, required }: Props) {
  const [mode, setMode] = useState<"existing" | "new">(clients.length ? "existing" : "new");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => clients.filter((client) => client.display_name.toLowerCase().includes(query.toLowerCase())).slice(0, 30), [clients, query]);
  return <div className="client-picker">
    <input type="hidden" name="client_mode" value={mode} />
    <div className="client-picker-actions"><button type="button" className={mode === "existing" ? "active" : ""} onClick={() => setMode("existing")} disabled={!clients.length}>選既有客戶</button><button type="button" className={mode === "new" ? "active" : ""} onClick={() => setMode("new")}>+ 新增客戶</button></div>
    {mode === "existing" ? <>
      <input aria-label="搜尋客戶" placeholder="搜尋客戶名稱" value={query} onChange={(event) => setQuery(event.target.value)} />
      <select name="client_id" required={required}><option value="">選擇客戶</option>{filtered.map((client) => <option key={client.id} value={client.id}>{client.display_name}{client.main_issue ? `｜${client.main_issue}` : ""}</option>)}</select>
    </> : <div className="new-client-grid">
      <input name="new_display_name" placeholder="新客姓名 / 顯示名稱" required={required && mode === "new"} />
      <select name="new_contact_method" defaultValue="LINE"><option>LINE</option><option>IG</option><option>電話</option><option>其他</option></select>
      <input name="new_line_id" placeholder="LINE ID（若有）" />
      <input name="new_ig_id" placeholder="IG ID（若有）" />
      <input name="new_main_issue" placeholder="主要問題 / 需求" />
    </div>}
  </div>;
}
