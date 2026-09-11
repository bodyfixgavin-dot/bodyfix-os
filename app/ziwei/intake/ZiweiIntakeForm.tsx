"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

const STORAGE_KEY = "bodyfix:ziwei-intake:draft:v1";
type Relative = { id: string; relation: string; name: string; birthday: string; note: string };
type Draft = { fields: Record<string, string>; siblings: Relative[]; children: Relative[]; partners: Relative[]; updatedAt: string };
const sectionLinks = [["basic", "01", "基本資料"], ["birth", "02", "出生資料"], ["family", "03", "家庭關係"], ["body", "04", "身體狀態"], ["events", "05", "重大事件"]];
const createRelative = (relation: string): Relative => ({ id: crypto.randomUUID(), relation, name: "", birthday: "", note: "" });

function parseDraft(raw: string | null): Draft | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<Draft>;
    if (!value.fields || typeof value.fields !== "object") return null;
    return { fields: value.fields as Record<string, string>, siblings: Array.isArray(value.siblings) ? value.siblings : [], children: Array.isArray(value.children) ? value.children : [], partners: Array.isArray(value.partners) ? value.partners : [], updatedAt: value.updatedAt || "" };
  } catch { return null; }
}

const shown = (value?: string) => value?.trim() || "未填寫";
function summary(draft: Draft) {
  const f = draft.fields;
  const relatives = (title: string, rows: Relative[]) => [title + "：", ...(rows.length ? rows.map((row, i) => `  ${i + 1}. ${shown(row.relation)}｜${shown(row.name)}｜${shown(row.birthday)}｜${shown(row.note)}`) : ["  未填寫"])];
  return ["BodyFix｜紫微分析 × 身體判讀｜定盤資料表", "", "【基本資料】", `稱呼：${shown(f.name)}`, `聯絡方式：${shown(f.contact)}`, `性別認同：${shown(f.gender)}`, `居住地：${shown(f.location)}`, "", "【出生與定盤資料】", `出生日期：${shown(f.birthDate)}`, `出生時間：${shown(f.birthTime)}`, `時間精確度：${shown(f.timeAccuracy)}`, `出生地：${shown(f.birthPlace)}`, `時間來源：${shown(f.timeSource)}`, `可能時段／備註：${shown(f.birthNote)}`, "", "【家庭與關係】", `父親：${shown(f.father)}`, `母親：${shown(f.mother)}`, ...relatives("兄弟姊妹", draft.siblings), ...relatives("子女", draft.children), ...relatives("伴侶", draft.partners), "", "【身體狀態】", `目前最想理解：${shown(f.bodyFocus)}`, `長期／反覆狀態：${shown(f.bodyHistory)}`, `壓力、睡眠與生活節奏：${shown(f.rhythm)}`, `曾經歷的處理或調整：${shown(f.bodyCare)}`, "", "【重大事件與補充】", `重大事件時間軸：${shown(f.events)}`, `希望協助理解：${shown(f.question)}`, `其他補充：${shown(f.notes)}`, "", "本資料由填寫者從本機瀏覽器整理；請以雙方確認的安全方式交付。"].join("\n");
}

function Field({ label, name, type = "text", placeholder, hint }: { label: string; name: string; type?: string; placeholder?: string; hint?: string }) {
  return <label className={styles.field}><span>{label}</span>{hint && <small>{hint}</small>}<input name={name} type={type} placeholder={placeholder} autoComplete="off" /></label>;
}

function RelativeList({ title, subtitle, rows, setRows }: { title: string; subtitle: string; rows: Relative[]; setRows: (rows: Relative[]) => void }) {
  const update = (id: string, key: keyof Relative, value: string) => setRows(rows.map(row => row.id === id ? { ...row, [key]: value } : row));
  return <div className={styles.relativeBlock}>
    <div className={styles.relativeHeading}><div><h3>{title}</h3><p>{subtitle}</p></div><button type="button" onClick={() => setRows([...rows, createRelative(title)])}>＋ 新增</button></div>
    {rows.map((row, index) => <div className={styles.relativeRow} key={row.id}>
      <i>{String(index + 1).padStart(2, "0")}</i>
      <label><span>關係</span><input aria-label={`${title} ${index + 1} 關係`} value={row.relation} onChange={e => update(row.id, "relation", e.target.value)} /></label>
      <label><span>稱呼</span><input aria-label={`${title} ${index + 1} 稱呼`} value={row.name} onChange={e => update(row.id, "name", e.target.value)} /></label>
      <label><span>出生日期</span><input aria-label={`${title} ${index + 1} 出生日期`} type="date" value={row.birthday} onChange={e => update(row.id, "birthday", e.target.value)} /></label>
      <label className={styles.relativeNote}><span>關係狀態／備註</span><input aria-label={`${title} ${index + 1} 備註`} value={row.note} onChange={e => update(row.id, "note", e.target.value)} /></label>
      <button className={styles.removeButton} type="button" aria-label={`移除${title} ${index + 1}`} onClick={() => setRows(rows.filter(item => item.id !== row.id))}>移除</button>
    </div>)}
  </div>;
}

export default function ZiweiIntakeForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<number>(0);
  const [siblings, setSiblings] = useState<Relative[]>([]), [children, setChildren] = useState<Relative[]>([]), [partners, setPartners] = useState<Relative[]>([]);
  const [ready, setReady] = useState(false), [savedAt, setSavedAt] = useState(""), [notice, setNotice] = useState("");
  function collect(): Draft { const fields: Record<string, string> = {}; new FormData(formRef.current || undefined).forEach((value, key) => { if (typeof value === "string") fields[key] = value; }); return { fields, siblings, children, partners, updatedAt: new Date().toISOString() }; }
  function save(show = false) { const draft = collect(); localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); setSavedAt(draft.updatedAt); if (show) setNotice("草稿已儲存在這台裝置的瀏覽器中。"); }
  useEffect(() => { const draft = parseDraft(localStorage.getItem(STORAGE_KEY)); if (draft && formRef.current) { Object.entries(draft.fields).forEach(([name, value]) => { const field = formRef.current?.elements.namedItem(name); if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) field.value = value; }); setSiblings(draft.siblings); setChildren(draft.children); setPartners(draft.partners); setSavedAt(draft.updatedAt); setNotice("已恢復這台裝置上次儲存的草稿。"); } setReady(true); }, []);
  useEffect(() => {
    if (ready) {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        const fields: Record<string, string> = {};
        new FormData(formRef.current || undefined).forEach((value, key) => { if (typeof value === "string") fields[key] = value; });
        const updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ fields, siblings, children, partners, updatedAt }));
        setSavedAt(updatedAt);
      }, 500);
    }
    return () => window.clearTimeout(timerRef.current);
  }, [siblings, children, partners, ready]);
  function queueSave() { if (!ready) return; window.clearTimeout(timerRef.current); timerRef.current = window.setTimeout(() => save(), 500); }
  async function copy() { try { await navigator.clipboard.writeText(summary(collect())); setNotice("已複製整理文字，可以貼到雙方確認的安全聯絡管道。"); } catch { setNotice("瀏覽器無法自動複製，請改用下載 JSON 或列印功能。"); } }
  function download() { const blob = new Blob([JSON.stringify(collect(), null, 2)], { type: "application/json;charset=utf-8" }); const url = URL.createObjectURL(blob), link = document.createElement("a"); link.href = url; link.download = `bodyfix-ziwei-intake-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url); setNotice("JSON 已下載；檔案含敏感資料，請妥善保存與傳送。"); }
  function clear() { if (!confirm("確定清除這台裝置上的所有表單內容？此動作無法復原。")) return; localStorage.removeItem(STORAGE_KEY); formRef.current?.reset(); setSiblings([]); setChildren([]); setPartners([]); setSavedAt(""); setNotice("本機草稿與表單內容已清除。"); }
  function noSubmit(event: FormEvent) { event.preventDefault(); setNotice("第一階段不會上傳資料，請使用下方工具自行交付。"); }
  return <main className={styles.page}>
    <nav className={styles.nav}><Link href="/" className={styles.brand}><span>BF</span><strong>BODYFIX</strong></Link><span className={styles.localBadge}>僅存於本機</span></nav>
    <header className={styles.hero}><p className={styles.eyebrow}>BODY READING · CHART INTAKE</p><h1><em>紫微分析</em><span>× 身體判讀</span></h1><h2 className={styles.heroTitle}>定盤資料表</h2><p className={styles.lead}>透過生命事件、家庭脈絡與身體狀態交叉整理，協助分析前建立較完整的理解。請依你知道的程度填寫，不確定的欄位可以留白。</p><div className={styles.privacyCallout}><strong>第一階段資料說明</strong><span>內容不會送到伺服器，只會暫存在目前使用的瀏覽器。共用裝置請勿儲存，完成交付後建議清除草稿。</span></div></header>
    <div className={styles.layout}><aside className={styles.progress}>{sectionLinks.map(([id, number, label]) => <a href={`#${id}`} key={id}><span>{number}</span>{label}</a>)}</aside>
      <form ref={formRef} className={styles.form} onChange={queueSave} onSubmit={noSubmit}>
        <Section id="basic" number="01" overline="ABOUT YOU" title="基本資料"><div className={styles.grid2}><Field label="稱呼" name="name" placeholder="希望我們如何稱呼你" /><Field label="聯絡方式" name="contact" hint="LINE、電話或其他方便聯繫的方式" /><Field label="性別認同" name="gender" placeholder="可自由填寫或留白" /><Field label="目前居住地" name="location" placeholder="城市／地區即可" /></div></Section>
        <Section id="birth" number="02" overline="BIRTH DETAILS" title="出生與定盤資料" intro="出生時間越準確，越有助於定盤；若不確定，請誠實標示來源與可能範圍。"><div className={styles.grid2}><Field label="出生日期" name="birthDate" type="date" /><Field label="出生時間" name="birthTime" type="time" hint="不知道可留白" /><label className={styles.field}><span>時間精確度</span><select name="timeAccuracy" defaultValue=""><option value="">請選擇</option><option>確定到分鐘</option><option>大約一小時內</option><option>只知道時辰</option><option>完全不確定</option></select></label><Field label="出生地" name="birthPlace" placeholder="城市／國家" /><Field label="出生時間來源" name="timeSource" placeholder="出生證明、家人記憶等" /><Field label="可能時段／備註" name="birthNote" placeholder="例如：接近午餐時間" /></div></Section>
        <Section id="family" number="03" overline="FAMILY & RELATIONSHIPS" title="家庭與關係" intro="可記錄重要關係、出生資料或關係轉折。不知道日期時，只填稱呼與備註即可。"><div className={styles.grid2}><Field label="父親資訊" name="father" placeholder="出生日期、關係狀態或重要事件" /><Field label="母親資訊" name="mother" placeholder="出生日期、關係狀態或重要事件" /></div><RelativeList title="兄弟姊妹" subtitle="依出生順序新增" rows={siblings} setRows={setSiblings} /><RelativeList title="子女" subtitle="包含重要的生育時間點" rows={children} setRows={setChildren} /><RelativeList title="伴侶" subtitle="現任或有重要影響的關係" rows={partners} setRows={setPartners} /></Section>
        <Section id="body" number="04" overline="BODY READING" title="身體狀態"><TextArea name="bodyFocus" label="目前最想理解的身體狀態" placeholder="例如：容易緊繃的位置、左右差異、近期感受" /><TextArea name="bodyHistory" label="長期或反覆出現的狀態" placeholder="何時開始、什麼情境容易出現、頻率如何" /><div className={styles.grid2}><TextArea name="rhythm" label="壓力、睡眠與生活節奏" /><TextArea name="bodyCare" label="曾經歷的處理或調整" placeholder="運動、按摩或其他經驗" /></div><p className={styles.scopeNote}>此頁用於資料整理與身體狀態理解，不取代醫療診斷或緊急協助。若有急性或嚴重不適，請優先尋求合適的專業協助。</p></Section>
        <Section id="events" number="05" overline="LIFE TIMELINE" title="重大事件與補充"><TextArea name="events" label="重大事件時間軸" rows={8} hint="可依「年份／年齡 — 事件」逐行記錄，例如搬遷、轉職、關係、生育、意外或身體明顯改變。" placeholder={"2018／30 歲 — 搬到台北\n2021／33 歲 — 身體狀態明顯改變"} /><TextArea name="question" label="希望這次分析協助你理解什麼？" /><TextArea name="notes" label="其他補充" /></Section>
        <section className={`${styles.section} ${styles.finish}`}><p className={styles.eyebrow}>SAVE & SHARE</p><h2>儲存與交付</h2><p>目前不會連線或上傳。請複製整理文字、下載 JSON，或以列印功能存成 PDF，再透過雙方確認的方式交付。</p>{notice && <p className={styles.notice} role="status">{notice}</p>}<div className={styles.actions}><button className={styles.primary} type="button" onClick={copy}>複製整理文字</button><button type="button" onClick={download}>下載 JSON</button><button type="button" onClick={() => print()}>列印／存成 PDF</button><button type="button" onClick={() => save(true)}>儲存草稿</button></div><div className={styles.saveStatus}><span>{savedAt ? `最近儲存：${new Date(savedAt).toLocaleString("zh-TW")}` : "尚未建立本機草稿"}</span><button type="button" onClick={clear}>清除本機資料</button></div></section>
      </form></div><footer className={styles.footer}><strong>BODYFIX</strong><p>身體判讀 × 生命脈絡整理</p></footer>
  </main>;
}

function Section({ id, number, overline, title, intro, children }: { id: string; number: string; overline: string; title: string; intro?: string; children: React.ReactNode }) { return <section id={id} className={styles.section}><header><span>{number}</span><div><p>{overline}</p><h2>{title}</h2></div></header>{intro && <p className={styles.intro}>{intro}</p>}{children}</section>; }
function TextArea({ label, name, placeholder, hint, rows = 4 }: { label: string; name: string; placeholder?: string; hint?: string; rows?: number }) { return <label className={styles.field}><span>{label}</span>{hint && <small>{hint}</small>}<textarea name={name} rows={rows} placeholder={placeholder} /></label>; }
