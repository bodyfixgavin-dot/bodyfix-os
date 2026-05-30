"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClinicShell, Field, SelectOptions, stageLabels } from "@/components/clinic/ClinicShell";

export default function NewClinicClientPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  async function submit(formData: FormData) {
    setError("");
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/clinic/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return setError(json.error ?? "新增客戶失敗");
    router.push(`/clinic/clients/${json.client.id}`);
  }
  return <ClinicShell title="新增客戶" subtitle="建立客戶主檔，先記錄身體狀態線索，不做醫療病歷語氣。">
    <form action={submit} className="bf-card bf-section-gap bf-form clinic-form-grid">
      <Field label="顯示名稱"><input name="display_name" required /></Field><Field label="暱稱"><input name="nickname" /></Field><Field label="LINE ID"><input name="line_id" /></Field><Field label="電話"><input name="phone" /></Field><Field label="Instagram"><input name="instagram" /></Field><Field label="城市"><input name="city" placeholder="台北" /></Field><Field label="職業"><input name="occupation" /></Field><Field label="主要問題簡述"><input name="main_issue" placeholder="肩頸肩帶整合 / 骨盆與髖接回" /></Field><Field label="目前階段"><select name="current_stage" defaultValue="lead_dm"><SelectOptions options={stageLabels} /></select></Field><Field label="優先級"><select name="priority" defaultValue="P3"><option>P1</option><option>P2</option><option>P3</option></select></Field><Field label="來源"><input name="source" defaultValue="other" /></Field><Field label="個案授權"><select name="case_permission" defaultValue="unknown"><option value="unknown">unknown</option><option value="approved_anonymous">approved_anonymous</option><option value="approved_partial">approved_partial</option><option value="rejected">rejected</option></select></Field><label className="clinic-wide">內部備註<textarea name="internal_notes" /></label>{error && <div className="bf-notice clinic-wide">{error}</div>}<button className="bf-primary clinic-wide" type="submit">建立客戶主檔</button>
    </form>
  </ClinicShell>;
}
