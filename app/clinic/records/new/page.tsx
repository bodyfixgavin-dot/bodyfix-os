"use client";

import { useState } from "react";
import { useClinicFetch } from "@/components/clinic/ClinicShell";
import styles from "./page.module.css";

const OPTIONS = {
  complaints: ["肩頸", "下背", "骨盆", "腿後", "胸口", "手臂", "足底", "睡眠", "壓力", "運動恢復"],
  tensions: ["頸", "肩", "胸", "背", "腰", "骨盆", "臀", "腿後", "小腿", "足底"],
  lines: ["SBL", "SFL", "LL", "SL", "Arm Lines", "Functional Lines", "DFL"],
  rootTags: ["高壓慣性", "情緒焦慮", "大腦超載", "經期卡住", "邊界模糊"],
  directions: ["低痛感整理", "呼吸回接", "張力分工", "骨盆穩定", "肩頸釋放", "足底回接", "動作整合"],
  responses: ["可呼吸", "變輕", "活動度增加", "仍有緊繃", "需要追蹤", "建議下次續看"],
  ans: ["當晚秒睡", "深層好睡", "身體變輕", "微微痠脹", "精神變好"],
  focus: ["骨盆", "肩頸", "胸椎", "足底", "髂腰肌", "腿後線", "核心穩定", "呼吸"],
} as const;

type MultiKey = "complaints" | "tensions" | "lines" | "rootTags" | "directions" | "responses" | "focus";
type ClientsData = { clients: Array<{ id?: string; client_id?: string; client_code?: string; display_name?: string }> };

export default function NewRecordPage() {
  const { data, loading, error } = useClinicFetch<ClientsData>("/api/clinic/clients");
  const [selected, setSelected] = useState<Record<MultiKey, string[]>>({ complaints: [], tensions: [], lines: [], rootTags: [], directions: [], responses: [], focus: [] });
  const [ans, setAns] = useState("");
  const [privateNote, setPrivateNote] = useState("");
  const [clientId, setClientId] = useState("");
  const [copied, setCopied] = useState<"draft" | "summary" | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const toggle = (key: MultiKey, item: string) => setSelected((current) => ({ ...current, [key]: current[key].includes(item) ? current[key].filter((value) => value !== item) : [...current[key], item] }));
  const joined = (key: MultiKey, fallback: string) => selected[key].join("、") || fallback;

  const clientSummary = `本次主要觀察到【${joined("tensions", "___")}】區域張力較明顯，與【${joined("lines", "___")}】或日常 ${joined("rootTags", "使用")} 習慣可能有關。本次以【${joined("directions", "___")}】為主要方向，在低痛感、可呼吸、身體能接受的深度內進行整理。整理後身體反應為【${joined("responses", "___")}】，下次可優先追蹤【${joined("focus", "___")}】。`;
  const followupDraft = `今天整理完，先觀察【${joined("focus", "身體")}】和【${joined("tensions", "張力區")}】的變化。這兩天不用刻意拉太強，重點是讓身體維持可呼吸、不要進入對抗。如果有痠感可以觀察，但不需要忍痛。${["當晚秒睡", "深層好睡"].includes(ans) ? "根據之前個案經驗，有 6–7 成的人回去會覺得深層好睡，甚至有 1–2 成直接秒睡 🤣，這代表副交感神經重新接管，放心地睡就好。" : ""}\n\n若【${joined("tensions", "調整區域")}】這兩天又開始明顯緊起來，可以直接跟我說，我下次會一起看張力是從哪裡拉回來的。`;

  async function copy(text: string, target: "draft" | "summary") { await navigator.clipboard.writeText(text); setCopied(target); window.setTimeout(() => setCopied(null), 1800); }
  async function save() {
    if (!clientId) return setSaveState("error");
    setSaveState("saving");
    const response = await fetch("/api/clinic/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_id: clientId, record_mode: "quick", service_date: new Date().toISOString().slice(0, 10), main_complaint: joined("complaints", ""), main_tension_area: joined("tensions", ""), dominant_fascia_line: joined("lines", ""), strategy: joined("directions", ""), client_reaction: [joined("responses", ""), ans].filter(Boolean).join("、"), after_change: clientSummary, next_focus: joined("focus", ""), internal_notes: [privateNote, selected.rootTags.length ? `Root Tags：${joined("rootTags", "")}` : ""].filter(Boolean).join("\n"), followup_needed: true } ) });
    setSaveState(response.ok ? "saved" : "error");
  }

  const sections: Array<{ key: MultiKey; number: string; title: string; hint: string; tone?: string }> = [
    { key: "complaints", number: "01", title: "今天主訴", hint: "Complaints" }, { key: "tensions", number: "02", title: "主要張力區", hint: "Tension zones" },
    { key: "lines", number: "03", title: "筋膜線觀察", hint: "Fascia lines", tone: styles.gold }, { key: "rootTags", number: "04", title: "森林共用狀態標籤", hint: "Root tags · 地下根網預留", tone: styles.root },
    { key: "directions", number: "05", title: "本次操作方向", hint: "Direction" }, { key: "responses", number: "06", title: "現場身體反應", hint: "Response" }, { key: "focus", number: "07", title: "下次追蹤重點", hint: "Next focus" },
  ];

  return <div className={styles.page}>
    <header className={styles.header}><div><span>BF OPERATING SYSTEM</span><h1>Quick Record <small>v2A MVP</small></h1></div><button onClick={save} disabled={saveState === "saving"}>{saveState === "saving" ? "儲存中…" : saveState === "saved" ? "已儲存 ✓" : "儲存紀錄"}</button></header>
    <main className={styles.main}>
      <section className={`${styles.card} ${styles.clientCard}`}><label><span>本次個案</span><select value={clientId} onChange={(e) => { setClientId(e.target.value); setSaveState("idle"); }} disabled={loading}><option value="">{loading ? "載入個案中…" : "選擇個案後即可儲存"}</option>{data?.clients.map((client) => <option key={client.id ?? client.client_id} value={client.id ?? client.client_id}>{client.client_code}｜{client.display_name}</option>)}</select></label>{(error || saveState === "error") && <p>{error || "請選擇個案，或確認登入與連線狀態。"}</p>}</section>
      {sections.map((section) => <section className={`${styles.card} ${section.tone ?? ""}`} key={section.key}><div className={styles.title}><b>{section.number}</b><div><h2>{section.title}</h2><span>{section.hint}</span></div></div><div className={styles.tags}>{OPTIONS[section.key].map((item) => <button key={item} className={selected[section.key].includes(item) ? styles.active : ""} onClick={() => toggle(section.key, item)}>{item}</button>)}</div>{section.key === "responses" && <div className={styles.ans}><span>神經系統回饋 · ANS DATA</span><div className={styles.tags}>{OPTIONS.ans.map((item) => <button key={item} className={ans === item ? styles.active : ""} onClick={() => setAns(ans === item ? "" : item)}>{item}</button>)}</div></div>}</section>)}
      <section className={styles.card}><div className={styles.title}><b>08</b><div><h2>今天補充觀察</h2><span>Private note</span></div></div><textarea value={privateNote} onChange={(e) => setPrivateNote(e.target.value)} placeholder="點選以外的現場特殊代償或狀況補充…" /></section>
    </main>
    <aside className={styles.output}><Output title="💬 FOLLOW-UP DRAFT · 貼 LINE" text={followupDraft} button={copied === "draft" ? "已複製 ✓" : "一鍵複製"} onCopy={() => copy(followupDraft, "draft")} /><Output title="📝 CLIENT SUMMARY · 系統留存" text={clientSummary} button={copied === "summary" ? "已複製 ✓" : "複製"} onCopy={() => copy(clientSummary, "summary")} /></aside>
  </div>;
}

function Output({ title, text, button, onCopy }: { title: string; text: string; button: string; onCopy: () => void }) { return <div className={styles.outputBlock}><div><span>{title}</span><button onClick={onCopy}>{button}</button></div><p>{text}</p></div>; }
