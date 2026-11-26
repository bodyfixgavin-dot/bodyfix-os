"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { INTAKE_SERVICES, intakeService, serviceQuote, formatPrice, LINE_URL } from "@/lib/bodyfix-services";
import { WORK, FREQUENCY, SPORTS, NEEDS, REGIONS, FEELINGS, DURATIONS, GOALS, EXPERIENCE, SAFETY_FLAGS, SAFETY, TIMES, emptyIntake, normalizeIntake, validateIntake, taipeiToday, birthProfile, showsDuration, bookingSummary, lineBookingUrl, type IntakeAnswers } from "@/lib/intake-v2";
import type { IntakePlace } from "@/lib/intake-options";
import styles from "./intake.module.css";

type ErrorMap = Record<string, string>;
function Question({ name, title, hint, error, children, required }: { name: string; title: string; hint?: string; error?: string; children: ReactNode; required?: boolean }) {
  return <fieldset id={`field-${name}`} className={styles.question} aria-describedby={error ? `error-${name}` : undefined}>
    <legend>{title}{required && <small>必填</small>}</legend>
    {hint && <p className={styles.hint}>{hint}</p>}{children}
    {error && <p id={`error-${name}`} className={styles.error} role="alert">{error}</p>}
  </fieldset>;
}
function Choices({ name, options, value, onChange, multiple = false, compact = false }: { name: string; options: string[]; value: string | string[]; onChange: (value: string | string[]) => void; multiple?: boolean; compact?: boolean }) {
  const values = Array.isArray(value) ? value : [value];
  function change(option: string) {
    if (!multiple) return onChange(option);
    if (values.includes(option)) return onChange(values.filter(v => v !== option));
    const none = "沒有明顯不舒服";
    return onChange(option === none ? [option] : [...values.filter(v => v !== none), option]);
  }
  return <div className={compact ? styles.chips : styles.options}>{options.map(option => <label key={option} className={`${styles.choice} ${values.includes(option) ? styles.selected : ""}`}>
    <input aria-label={option} name={name} type={multiple ? "checkbox" : "radio"} checked={values.includes(option)} onChange={() => change(option)} />
    <span>{option}</span>
  </label>)}</div>;
}
function TextField({ name, label, value, set, placeholder, type = "text", error, unit, multiline = false }: { name: string; label: string; value: string; set: (value: string) => void; placeholder?: string; type?: string; error?: string; unit?: string; multiline?: boolean }) {
  return <div id={`field-${name}`} className={styles.textField}>
    <label htmlFor={name}>{label}{unit && <span className={styles.muted}> {unit}</span>}</label>
    {multiline ? <textarea id={name} name={name} rows={3} value={value} maxLength={2000} onChange={e => set(e.target.value)} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? `error-${name}` : undefined} /> :
      <input id={name} name={name} value={value} onChange={e => set(e.target.value)} type={type} step={type === "number" ? name === "age" ? "1" : "0.1" : undefined} inputMode={type === "number" ? "decimal" : undefined} maxLength={name === "name" ? 80 : name === "contact" || name === "occupation" ? 120 : 2000} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? `error-${name}` : undefined} />}
    {error && <p className={styles.error} id={`error-${name}`}>{error}</p>}
  </div>;
}
function BookingCard({ answers, placeName }: { answers: IntakeAnswers; placeName: string }) {
  const q = serviceQuote(answers.service, answers.extended);
  return <dl className={styles.summary}>
    <div><dt>稱呼／身分</dt><dd>{answers.name || "尚未填寫"} · {answers.visit || "尚未選擇"}</dd></div>
    <div><dt>本次服務</dt><dd>{q.name}</dd></div>
    <div><dt>時長／預估價格</dt><dd>{q.duration} · {formatPrice(q.amount)}</dd></div>
    <div><dt>希望日期／時間</dt><dd>{answers.date || "尚未選擇"} · {answers.time || "尚未選擇"}</dd></div>
    <div><dt>希望地點</dt><dd>{placeName || "尚未選擇"}</dd></div>
  </dl>;
}
export default function IntakePage() {
  const [a, setA] = useState<IntakeAnswers>(emptyIntake);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [places, setPlaces] = useState<IntakePlace[]>([]);
  const [today, setToday] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [receipt, setReceipt] = useState<{ reference: string; summary: string; answers: IntakeAnswers; placeName: string } | null>(null);
  const [copied, setCopied] = useState("");
  const [copyFallback, setCopyFallback] = useState(false);
  const lock = useRef(false);
  const key = useRef("");
  useEffect(() => {
    setToday(taipeiToday());
    key.current = crypto.randomUUID();
    const abort = new AbortController();
    fetch("/api/intake/options", { signal: abort.signal }).then(r => r.json()).then(d => setPlaces(d.places ?? [])).catch(() => {});
    return () => abort.abort();
  }, []);
  function set<K extends keyof IntakeAnswers>(name: K, value: IntakeAnswers[K]) {
    setA(current => ({ ...current, [name]: value }));
    setErrors(current => { const next = { ...current }; delete next[name]; return next; });
    setFailure("");
  }
  const returning = a.visit === "我之前來過";
  const profile = !returning || a.updateProfile;
  const pelvic = a.service === "pelvic-core";
  const training = a.service === "movement";
  const service = intakeService(a.service);
  const quote = serviceQuote(a.service, a.extended);
  const placeName = places.find(p => p.id === a.place)?.name || "";
  const birth = birthProfile(a.birthday);
  const normalized = normalizeIntake(a);
  const progressKeys = ["visit", "name", "contact", "service", "date", "time", "place", "safety", "privacyConsent", "serviceConsent"] as const;
  const progress = progressKeys.filter(k => !!a[k]).length;
  const choose = (name: keyof IntakeAnswers, title: string, options: string[], multiple = false, compact = true, hint?: string, required = false) => <Question name={name} title={title} hint={hint} error={errors[name]} required={required}><Choices name={name} options={options} value={a[name] as string | string[]} onChange={v => set(name, v as never)} multiple={multiple} compact={compact} /></Question>;
  const field = (name: keyof IntakeAnswers, label: string, placeholder?: string, type = "text", unit?: string, multiline = false) => <TextField name={name} label={label} value={a[name] as string} set={v => set(name, v as never)} placeholder={placeholder} type={type} unit={unit} multiline={multiline} error={errors[name]} />;
  const check = (name: "privacyConsent" | "serviceConsent" | "pelvicConsent" | "adultMale", label: string) => <div id={`field-${name}`}><label className={styles.consent}><input name={name} type="checkbox" checked={a[name]} onChange={e => set(name, e.target.checked)} /><span>{label}</span></label>{errors[name] && <p className={styles.error} role="alert">{errors[name]}</p>}</div>;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    const validation = validateIntake(normalized);
    setErrors(validation); setFailure("");
    if (Object.keys(validation).length) {
      const target = document.getElementById(`field-${Object.keys(validation)[0]}`);
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      target?.querySelector<HTMLElement>("input,button,select,textarea")?.focus({ preventScroll: true });
      return;
    }
    lock.current = true; setBusy(true);
    try {
      const response = await fetch("/api/intake", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ version: "2.0", submissionKey: key.current, answers: normalized }) });
      const result = await response.json();
      if (!response.ok || result.stored !== true) {
        if (result.fields) setErrors(Object.fromEntries(Object.entries(result.fields).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)])));
        throw new Error(result.error || "資料尚未儲存，請重試。你的填寫內容仍保留在本頁。");
      }
      const summary = bookingSummary(normalized, placeName, result.reference);
      setReceipt({ reference: result.reference, summary, answers: normalized, placeName });
      // Navigate only after persistence; a same-tab deep link avoids asynchronous popup blocking.
      window.location.assign(lineBookingUrl(summary));
    } catch (err) { setFailure(err instanceof Error ? err.message : "連線中斷，請重試。填寫內容仍保留在本頁。"); }
    finally { lock.current = false; setBusy(false); }
  }
  async function copy() {
    if (!receipt) return;
    try { await navigator.clipboard.writeText(receipt.summary); setCopied("已複製預約摘要，可貼到 Gavin 的 LINE 對話。"); }
    catch { setCopyFallback(true); setCopied("無法自動複製，請選取下方預約摘要複製。"); }
  }
  if (receipt) return <main className={styles.page}><div className={styles.shell}><header className={styles.hero}>
    <Link href="/website" className={styles.brand}><span>BF</span> BODYFIX</Link><p className={styles.eyebrow}>CLIENT INTAKE & QUICK BOOKING</p>
    <h1>預約資料已儲存</h1><p>已完成預約資料填寫，請透過 LINE 與 Gavin 確認實際服務時間。</p>
    <p className={styles.hint}>這還不是預約成功。服務開始前，Gavin 仍會確認安全狀況與服務範圍。</p>
    <BookingCard answers={receipt.answers} placeName={receipt.placeName} />
    <a className={styles.primary} href={lineBookingUrl(receipt.summary)}>前往 LINE 確認預約</a>
    <details className={styles.details}><summary>LINE 沒有帶入訊息？</summary><p>可一鍵複製預約摘要，再開啟 LINE。摘要不包含生日或身體與健康資料。</p><button className={styles.secondary} onClick={copy}>一鍵複製預約摘要</button><a className={styles.secondary} href={LINE_URL}>開啟 Gavin 的 LINE</a>{copied && <p role="status">{copied}</p>}{copyFallback && <textarea aria-label="預約摘要備援複製" readOnly value={receipt.summary} onFocus={e => e.currentTarget.select()} />}</details>
    <p className={styles.hint}>資料編號：{receipt.reference}</p>
  </header></div></main>;

  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.hero}>
      <Link href="/website" className={styles.brand}><span>BF</span> BODYFIX</Link>
      <p className={styles.eyebrow}>CLIENT INTAKE & QUICK BOOKING</p>
      <h1>認識你的身體</h1>
      <p>讓我在見面之前，多了解你的身體、生活習慣與這次的需求，為你安排更適合的服務。</p>
      <div className={styles.heroFoot}><span>初次認識與快速預約</span><span>LINE 人工確認時間</span></div>
    </header>
    <div className={styles.progress}><span>{returning ? "回訪快速預約" : "初次預約"}</span><span>必要資料 {progress} / {progressKeys.length}</span><progress value={progress} max={progressKeys.length} aria-label="必要資料填寫進度" /></div>
    <form onSubmit={submit} noValidate aria-busy={busy}>
      <fieldset disabled={busy} className={styles.formBody}>
      <section className={styles.section}>
        <h2>預約身分</h2>
        {choose("visit", "這次是初次見面，還是再來整理？", ["第一次預約", "我之前來過"], false, false, undefined, true)}
        {returning && <p className={styles.hint}>歡迎回來。只要留下可辨識的稱呼與聯絡資訊，再告訴我這次的安排即可；不會以暱稱查詢或顯示歷史私人資料。</p>}
      </section>
      <section className={styles.section}>
        <h2>{returning ? "怎麼找到你" : "基本個人資料"}<span>{returning ? "由 LINE 確認身分" : "除了稱呼與一種聯絡資訊，其餘選填"}</span></h2>
        {field("name", "怎麼稱呼你？ · 必填", "輸入平常使用的名字或暱稱即可")}
        <Question name="contactMethod" title="方便聯絡你的方式" required error={errors.contactMethod} hint="留下一種即可。LINE 可填顯示名稱，之後請以同一帳號傳送預約摘要。">
          <Choices name="contactMethod" options={["LINE", "電話", "Instagram"]} value={a.contactMethod} onChange={v => set("contactMethod", v as string)} compact />
          {field("contact", a.contactMethod === "電話" ? "聯絡電話" : a.contactMethod === "Instagram" ? "Instagram 帳號" : "LINE 顯示名稱／可辨識的聯絡資訊", "讓 Gavin 知道是哪一位即可", a.contactMethod === "電話" ? "tel" : "text")}
        </Question>
        {returning && <label className={styles.consent}><input type="checkbox" checked={a.updateProfile} onChange={e => set("updateProfile", e.target.checked)} /><span>更新我的基本資料（選填）</span></label>}
        {profile && <>
          {choose("birthMode", "你的生日是？", ["不提供", "生日", "年齡"], false, true, "選填；也可以只提供年齡。生日與星座僅供認識與聊天參考。")}
          {a.birthMode === "生日" && <Question name="birthday" title="出生年月日" error={errors.birthday}>
            <div className={styles.birthDate}>{["年", "月", "日"].map((label, index) => {
              const parts = a.birthday.split("-");
              const currentYear = Number((today || taipeiToday()).slice(0, 4));
              const values = index === 0 ? Array.from({ length: 121 }, (_, i) => currentYear - i) : Array.from({ length: index === 1 ? 12 : 31 }, (_, i) => i + 1);
              return <label key={label}>{label}<select aria-label={`出生${label}`} value={parts[index] || ""} onChange={e => { const next = [parts[0] || "", parts[1] || "", parts[2] || ""]; next[index] = e.target.value; set("birthday", next.join("-")); }}><option value="">{label}</option>{values.map(v => <option key={v} value={index ? String(v).padStart(2, "0") : String(v)}>{v}</option>)}</select></label>;
            })}</div>
            {birth && <p className={styles.hint}>{birth.age} 歲 · {birth.sunSign}（交界日期僅供參考）</p>}
          </Question>}
          {a.birthMode === "年齡" && field("age", "年齡（歲）", "例如 35", "number")}
          <div className={styles.twoColumns}>{field("height", "身高", "例如 175", "number", "cm")}{field("weight", "體重", "例如 75", "number", "kg")}</div>
          {field("occupation", "目前從事什麼工作？", "例如工程師、設計師、餐飲業、學生、自由工作者")}
        </>}
      </section>
      {profile && <section className={styles.section}>
        <h2>生活與運動習慣<span>選填 · 用點選，讓我多認識你的日常</span></h2>
        {choose("work", "平常的工作或生活型態比較接近哪一種？", WORK, true)}
        {choose("exerciseFrequency", "平常有運動習慣嗎？", FREQUENCY)}
        {a.exerciseFrequency && a.exerciseFrequency !== FREQUENCY[0] && choose("sports", "平常做哪些運動？", SPORTS, true)}
      </section>}
      <section className={styles.section}>
        <h2>服務選擇<span>還沒決定也沒關係，可以先聽建議</span></h2>
        <Question name="service" title="這次想預約哪一種服務？" required error={errors.service}>
          <div className={styles.services}>{INTAKE_SERVICES.map(s => <label key={s.id} className={`${styles.service} ${a.service === s.id ? styles.selected : ""} ${s.id === "body-reset" ? styles.core : ""}`}>
            <input type="radio" name="service" value={s.id} checked={a.service === s.id} onChange={() => set("service", s.id)} />
            <div>{s.badge && <span className={styles.badge}>{s.badge}</span>}<strong>{s.name}</strong><span className={styles.english}>{s.english}</span><div className={styles.serviceMeta}><span>{s.duration}</span><b>{formatPrice(s.amount)}</b></div><p>{s.description}</p></div>
          </label>)}</div>
        </Question>
        {service?.extension && <label className={styles.extension}><input name="extended" type="checkbox" checked={a.extended} onChange={e => set("extended", e.target.checked)} /><span>延長 30 分鐘 ＋{formatPrice(service.extension)}<small>本次共 {quote.duration} · {formatPrice(quote.amount)}</small></span></label>}
      </section>
      {a.service && <section className={styles.section}>
        <h2>本次身體需求<span>依這次選擇的服務填寫 · 可選填</span></h2>
        {training ? <>{choose("trainingGoals", "主要訓練目標", GOALS, true)}{choose("experience", "目前的訓練經驗", EXPERIENCE)}</> : <>
          {choose("needs", "這次最想改善或整理的是什麼？", NEEDS, true)}
          {choose("regions", "這次有哪些部位想特別整理？", REGIONS, true)}
          <details className={styles.details}><summary>補充身體感受（選填）{a.feelings.length ? ` · 已選 ${a.feelings.length} 項` : ""}</summary>
            {choose("feelings", "目前有哪些感受？", FEELINGS, true)}
            {showsDuration(a) && choose("duration", "這個狀況持續多久了？", DURATIONS)}
          </details>
        </>}
        {pelvic && <div className={styles.pelvic}>
          <h3>骨盆核心服務前說明</h3>
          {choose("pelvicRegions", "希望整理的區域", ["腹部", "骨盆／髖部", "臀部", "大腿內側", "現場討論"], true)}
          {choose("pelvicProcess", "是否希望事前了解服務流程？", ["希望事前了解", "現場說明即可"])}
          <p>特別在意的碰觸界線可填在下方「不希望被碰觸的身體區域」。</p>
          {check("adultMale", "我確認已滿 18 歲，並符合目前限男性預約的服務條件。")}
          {check("pelvicConsent", "我了解本服務採外部徒手方式；實際服務前仍須逐項說明並取得同意。填寫問卷不代表對所有碰觸範圍的概括授權，我可隨時要求跳過、調整或停止。")}
        </div>}
        {field("notes", "特別想說明的事情", "有沒有其他想讓 Gavin 在見面前知道的事情？", "text", undefined, true)}
      </section>}
      <section className={styles.section}>
        <h2>預約日期、時間與地點</h2>
        <div id="field-date" className={styles.textField}><label htmlFor="date">希望日期 · 必填</label><input id="date" name="date" type="date" min={today || undefined} value={a.date} onChange={e => set("date", e.target.value)} aria-invalid={!!errors.date} />{errors.date && <p className={styles.error}>{errors.date}</p>}</div>
        {choose("time", "希望時間", TIMES, false, false, "以上為優先安排時段，實際預約時間由 Gavin 透過 LINE 確認。", true)}
        <Question name="place" title="希望服務地點" hint="六張犁為主要地點；共享場地與指定地點由 Gavin 確認安排，完整地址在確認後提供。" required error={errors.place}>
          <div className={styles.options}>{places.map(p => <label key={p.id} className={`${styles.choice} ${a.place === p.id ? styles.selected : ""}`}><input type="radio" name="place" checked={a.place === p.id} onChange={() => set("place", p.id)} /><span>{p.name}</span></label>)}</div>
          {!places.length && <p className={styles.hint}>地點讀取中。<button type="button" className={styles.secondary} onClick={() => fetch("/api/intake/options").then(r => r.json()).then(d => setPlaces(d.places)).catch(() => setFailure("地點讀取失敗，請重試"))}>重新讀取地點</button></p>}
        </Question>
      </section>
      <section className={styles.section}>
        <h2>服務前安全確認<span>{returning ? "這次近期有新的健康或身體狀況嗎？" : "讓我們安心地安排這次服務"}</span></h2>
        <p className={styles.hint}>請確認近期受傷、手術或骨折，急性疼痛或嚴重不適、發燒／感染／發炎、疾病或用藥、醫囑限制，以及其他需要事前告知的狀況。</p>
        {choose("safety", returning ? "最近是否有新的狀況需要告知？" : "有需要事前告知的健康狀況嗎？", SAFETY, false, false, undefined, true)}
        {a.safety && a.safety !== SAFETY[0] && <>
          {choose("safetyFlags", "需要先討論的項目", SAFETY_FLAGS, true)}
          {field("safetyNote", "想告訴 Gavin 的安全注意事項", "可說明近期變化、用藥、醫囑限制或不確定的地方；也可在服務前私下討論。", "text", undefined, true)}
          <p className={styles.notice}>若有急性或嚴重症狀，請先與適當醫療專業人員確認是否適合接受服務。完成問卷不代表通過安全評估。</p>
        </>}
        {field("noTouch", "不希望被碰觸的身體區域（選填）", "有任何界線或想避開的區域，都可以告訴我")}
        {check("serviceConsent", "我依目前所知填寫資料，了解 BodyFix 為非醫療的按摩、筋膜整理與運動訓練；服務前仍須確認安全與範圍，過程中可隨時要求調整或停止。")}
      </section>
      <section className={styles.section}>
        <h2>確認這次的安排</h2>
        <BookingCard answers={normalized} placeName={placeName} />
        <p>填寫的資料將用於預約聯繫、服務前了解及必要的安全確認，非必要資料可選擇不提供。</p>
        <details className={styles.details}><summary>資料使用與隱私說明</summary><p>資料由 BodyFix（Gavin）於受保護的系統保存，供 Gavin 及經授權的服務人員於預約聯繫、服務前了解與安全確認時使用；僅於上述目的所需期間保存，必要性消失後刪除或去識別化，依法須保存的部分除外。可透過 LINE 聯絡 Gavin 查詢、更正、停止使用或申請刪除。</p><p>生日、健康與身體資料不會帶入 LINE 預約摘要，也不會用於行銷或生日推播。必要聯絡與安全確認未提供時，可能無法安排服務。尚未送出的資料只留在本頁記憶體，重新整理或離開可能清除。</p></details>
        {check("privacyConsent", "我已閱讀並同意上述資料使用說明，包含為服務前安全確認而提供的健康資訊。")}
        {Object.keys(errors).length > 0 && <p className={styles.error} role="alert">請補齊或修正上方標示欄位，再繼續預約。</p>}
        {failure && <p className={styles.error} role="alert">{failure}</p>}
        <button className={styles.primary} type="submit" disabled={busy}>{busy ? "正在安全儲存資料…" : failure ? "重試儲存並前往 LINE" : "前往 LINE 確認預約"}</button>
        <p className={styles.hint}>按下後會先儲存資料，再開啟 Gavin 的 LINE 並帶入預約摘要。實際時間仍需由 Gavin 人工確認。</p>
      </section>
      </fieldset>
    </form>
    <footer className={styles.footer}>BODYFIX · READ / RESET / RECONNECT / RETURN<br /><Link href="/website">回到 BodyFix</Link></footer>
  </div></main>;
}
