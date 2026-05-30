"use client";
import { useState } from "react";
import { ClinicNotice, ClinicShell, Field, useClinicFetch } from "@/components/clinic/ClinicShell";

type ClientsData = { clients: any[] };
export default function NewServiceRecordPage() {
  const { data, loading, error } = useClinicFetch<ClientsData>("/api/clinic/clients");
  const [mode, setMode] = useState("quick");
  const [message, setMessage] = useState("");
  async function submit(formData: FormData) {
    setMessage("");
    const raw = Object.fromEntries(formData.entries());
    const payload = { ...raw, record_mode: mode, followup_needed: raw.followup_needed === "on", plan_candidate: raw.plan_candidate === "on", case_candidate: raw.case_candidate === "on" };
    const res = await fetch("/api/clinic/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json().catch(() => ({}));
    setMessage(res.ok ? "服務紀錄已建立，可回到客戶頁查看 timeline。" : json.error ?? "新增失敗");
  }
  return <ClinicShell title="新增服務紀錄" subtitle="Quick 適合服務後快速補記；Full 適合重要個案、3 次方案、12 次方案與案例素材。">
    <ClinicNotice loading={loading} error={error} />
    {data && <form action={submit} className="bf-card bf-section-gap bf-form clinic-form-grid"><Field label="紀錄模式"><select value={mode} onChange={(e) => setMode(e.target.value)}><option value="quick">quick｜快速紀錄</option><option value="full">full｜完整紀錄</option></select></Field><Field label="客戶"><select name="client_id" required>{data.clients.map((c) => <option key={c.client_id ?? c.id} value={c.client_id ?? c.id}>{c.client_code}｜{c.display_name}</option>)}</select></Field><Field label="服務日期"><input name="service_date" type="date" /></Field><Field label="服務代碼"><input name="service_code" placeholder="對應 services.code，可留空" /></Field><Field label="主要困擾"><textarea name="main_complaint" /></Field><Field label="主要張力區"><textarea name="main_tension_area" /></Field><Field label="整理區域"><textarea name="processed_area" /></Field><Field label="客戶反應"><textarea name="client_reaction" /></Field><Field label="整理後變化"><textarea name="after_change" /></Field><Field label="下次重點"><textarea name="next_focus" /></Field>{mode === "full" && <><Field label="疲勞累積狀態"><textarea name="fatigue_state_assessment" /></Field><Field label="策略"><textarea name="strategy" /></Field><Field label="回家作業"><textarea name="internal_notes" placeholder="需要細分時可另用 homework API；這裡先補記重點。" /></Field><Field label="筋膜線"><input name="dominant_fascia_line" /></Field><Field label="身體區域"><input name="body_region" /></Field><Field label="滿意度"><input name="satisfaction_score" type="number" min="1" max="5" /></Field><Field label="下次追蹤日期"><input name="next_followup_date" type="date" /></Field><label><input name="followup_needed" type="checkbox" defaultChecked /> 需要追蹤</label></>}<label><input name="plan_candidate" type="checkbox" /> 標記為方案候選</label><label><input name="case_candidate" type="checkbox" /> 標記為案例素材候選</label>{message && <div className="bf-notice clinic-wide">{message}</div>}<button className="bf-primary clinic-wide" type="submit">新增服務紀錄</button></form>}
  </ClinicShell>;
}
