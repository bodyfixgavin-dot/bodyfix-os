"use client";
import { useEffect, useState } from "react";
import { crossReadPrompts, initialCaseObservations } from "@/lib/learner/data";

const storageKey = "bodyfix-reader-text-001";
type Initial = { observed: string; interpretation: string; missing: string; boundaries: string };
type Reread = { kept: string; revised: string; unknown: string; nextCheck: string };
const emptyInitial: Initial = { observed: "", interpretation: "", missing: "", boundaries: "" };
const emptyReread: Reread = { kept: "", revised: "", unknown: "", nextCheck: "" };

export function CaseDesk() {
  const [initial, setInitial] = useState(emptyInitial);
  const [saved, setSaved] = useState(false);
  const [rereadOpen, setRereadOpen] = useState(false);
  const [reread, setReread] = useState(emptyReread);
  useEffect(() => { const raw = localStorage.getItem(storageKey); if (raw) { const data = JSON.parse(raw); setInitial(data.initial ?? emptyInitial); setReread(data.reread ?? emptyReread); setSaved(Boolean(data.saved)); setRereadOpen(Boolean(data.rereadOpen)); } }, []);
  function persist(next = { initial, reread, saved: true, rereadOpen }) { localStorage.setItem(storageKey, JSON.stringify(next)); }
  function saveInitial() { const next = { initial, reread, saved: true, rereadOpen }; setSaved(true); persist(next); }
  function saveReread(nextReread: Reread) { setReread(nextReread); persist({ initial, reread: nextReread, saved, rereadOpen }); }
  return <div className="case-desk"><section className="learner-card"><h2>案例初始資料</h2><ul>{initialCaseObservations.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="learner-card"><h2>初讀</h2><div className="learner-form">{[
    ["observed", "我實際觀察到什麼？", "只記錄目前可以直接觀察、重複確認或由個案明確描述的資訊。"],
    ["interpretation", "我目前怎麼解釋？", "請清楚標示這是目前假設，不是已確定的原因。"],
    ["missing", "我還缺少什麼資訊？", "哪些資料、任務條件或重複觀察，會影響你的判斷？"],
    ["boundaries", "目前有哪些安全界線？", "哪些資訊不足，使你目前不應直接進入高強度或不可逆的介入？"],
  ].map(([key, label, hint]) => <label key={key}><strong>{label}</strong><small>{hint}</small><textarea value={initial[key as keyof Initial]} onChange={(event) => setInitial({ ...initial, [key]: event.target.value })} /></label>)}<button className="bf-primary" type="button" onClick={saveInitial}>保存初讀</button></div></section>{saved ? <section className="learner-card"><h2>對讀提示</h2>{crossReadPrompts.map((prompt) => <p className="learner-prompt" key={prompt.text}>{prompt.text}</p>)}<button className="bf-primary" type="button" onClick={() => { setRereadOpen(true); persist({ initial, reread, saved, rereadOpen: true }); }}>進入重讀</button></section> : null}{rereadOpen ? <section className="learner-card"><h2>重讀修訂</h2><div className="learner-form">{[
    ["kept", "保留的判斷"], ["revised", "需要修訂的判斷"], ["unknown", "仍無法判定的部分"], ["nextCheck", "下一個低風險查證方式"],
  ].map(([key, label]) => <label key={key}><strong>{label}</strong><textarea value={reread[key as keyof Reread]} onChange={(event) => saveReread({ ...reread, [key]: event.target.value })} /></label>)}</div></section> : null}</div>;
}
