"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { BODYFIX_SERVICES, LINE_URL, MOVEMENT_TRAINING, serviceById } from "@/lib/bodyfix-services";

type Answers = Record<string, string | string[]>;
type Option = { value: string; label?: string; detail?: string };

const purposes = [
  "身體痠、緊、卡",
  "活動度或動作不順",
  "訓練後恢復",
  "肩頸／背腰容易累",
  "髖與骨盆活動不順",
  "想做較完整的全身整理",
  "想增肌、增加力量或重新訓練",
  "不確定／其他",
];
const regions = [
  "頭／頸部",
  "肩膀／手臂",
  "胸口／肋骨周邊",
  "上背／中背",
  "下背／腰",
  "下腹／髖前側",
  "骨盆／臀部",
  "鼠蹊／大腿內側",
  "大腿／膝蓋周邊",
  "小腿／腳踝／足部",
  "全身都有",
  "不確定位置",
];
const pelvicRegions = ["下腹／髖前側", "骨盆／臀部", "鼠蹊／大腿內側"];
const reviewFlags = [
  "最近有骨折／尚未完全癒合",
  "最近接受手術或仍在術後恢復",
  "目前有傷口、燒燙傷或明顯皮膚感染",
  "目前有發燒或急性感染狀況",
  "曾有或目前有血栓／深層靜脈栓塞相關狀況",
  "正在使用抗凝血／血液稀釋相關藥物",
  "有嚴重骨質疏鬆或醫師提醒骨折風險",
  "醫療人員曾交代目前應避免按摩／徒手處理",
  "其他需要先知道的健康狀況",
];
const safetyOptions = [
  "最近有明顯急性受傷",
  ...reviewFlags.slice(0, 8),
  "身上有植入式醫療裝置",
  "有正在接受醫療追蹤、需要特別注意的疾病或狀況",
  "容易瘀青或出血",
  "其他需要先知道的健康狀況",
  "以上皆無",
];
const pelvicConsent = [
  "我了解「龍筋區」不是獨立的情色或性服務，而是 Pelvic Core Reset 中可能涉及的專業整理區域。",
  "我了解整理可能依狀況涉及下腹、髖、臀、大腿內側、鼠蹊及骨盆周邊外層組織。",
  "如果需要接近較私密的周邊區域，施作者會先說明，並再次確認我的接受程度。",
  "我可以在任何時間要求跳過某個區域、降低深度、改變姿勢或停止服務，不需要特別解釋原因。",
  "我了解身體在整理過程中可能出現自然生理反應，但這不代表服務內容或專業界線改變。",
  "我了解 BodyFix 全程維持專業、非性化界線。",
];
const finalConsent = [
  "我確認以上資料依目前知道的狀況填寫。",
  "我了解 BodyFix 提供的是運動按摩、筋膜整理與動作訓練服務，不取代醫療診斷或治療。",
  "如果整理過程中出現不舒服，我會立即告知，並可隨時要求調整或停止。",
];

function Choice({ name, options, answers, setAnswers, multiple = false, required = false }: { name: string; options: (string | Option)[]; answers: Answers; setAnswers: (value: Answers) => void; multiple?: boolean; required?: boolean }) {
  const selected = multiple ? (answers[name] as string[] || []) : [answers[name] as string].filter(Boolean);
  const update = (value: string) => {
    let next: string | string[] = value;
    if (multiple) {
      if (value === "以上皆無") next = selected.includes(value) ? [] : [value];
      else next = selected.includes(value) ? selected.filter(v => v !== value) : [...selected.filter(v => v !== "以上皆無"), value];
    }
    setAnswers({ ...answers, [name]: next });
  };
  return <div className="intake-v2-options">{options.map(raw => {
    const option = typeof raw === "string" ? { value: raw } : raw;
    const active = selected.includes(option.value);
    return <label className={active ? "intake-v2-option selected" : "intake-v2-option"} key={option.value}>
      <input type={multiple ? "checkbox" : "radio"} name={name} value={option.value} checked={active} required={required && !multiple} onChange={() => update(option.value)} />
      <span><strong>{option.label || option.value}</strong>{option.detail && <small>{option.detail}</small>}</span>
    </label>;
  })}</div>;
}

function Field({ label, name, answers, setAnswers, required, textarea, placeholder, type = "text" }: { label: string; name: string; answers: Answers; setAnswers: (value: Answers) => void; required?: boolean; textarea?: boolean; placeholder?: string; type?: string }) {
  const props = { id: name, name, value: answers[name] as string || "", required, placeholder, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAnswers({ ...answers, [name]: e.target.value }) };
  return <label className="intake-v2-field" htmlFor={name}><span>{label}{required && <b aria-label="必填"> *</b>}</span>{textarea ? <textarea {...props} rows={4} /> : <input {...props} type={type} />}</label>;
}

function Question({ number, title, required, children, hint }: { number: string; title: string; required?: boolean; children: ReactNode; hint?: string }) {
  return <fieldset className="intake-v2-question"><legend><span>{number}</span>{title}{required && <b> 必填</b>}</legend>{hint && <p className="intake-v2-hint">{hint}</p>}{children}</fieldset>;
}

const text = (answers: Answers, key: string) => Array.isArray(answers[key]) ? (answers[key] as string[]).join("、") : String(answers[key] || "");
const hasAnswer = (value: string | string[] | undefined) => Array.isArray(value) ? value.length > 0 : Boolean(value);

export default function IntakePage() {
  const [answers, setAnswers] = useState<Answers>({});
  const [complete, setComplete] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "fallback">("idle");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const service = new URLSearchParams(window.location.search).get("service");
    if (serviceById(service || "") || ["movement", "movement-combo", "unsure"].includes(service || "")) {
      setAnswers(a => ({ ...a, service: service! }));
    }
  }, []);

  const pelvic = ["pelvic-core", "multi-line", "pelvic-vip"].includes(text(answers, "service")) || pelvicRegions.some(v => (answers.regions as string[] || []).includes(v));
  const movement = ["movement", "movement-combo"].includes(text(answers, "service"));
  const requiresReview = (answers.safety as string[] || []).some(v => reviewFlags.includes(v));

  useEffect(() => {
    const pelvicKeys = ["pelvicGoal", "pelvicRange", "pelvicConsent", "adult"];
    const movementKeys = ["trainingGoal", "experience", "uncomfortable", "uncomfortableDetail", "arrangement"];
    const stale = [...(!pelvic ? pelvicKeys : []), ...(!movement ? movementKeys : [])].filter(key => key in answers);
    if (stale.length) setAnswers(current => { const next = { ...current }; stale.forEach(key => delete next[key]); return next; });
  }, [pelvic, movement, answers]);

  const summary = useMemo(() => {
    const serviceName = serviceById(text(answers, "service"))?.name || ({
      movement: MOVEMENT_TRAINING.name,
      "movement-combo": "Movement Training ＋ 筋膜整理",
      unsure: "不確定，希望 Gavin 建議",
    }[text(answers, "service")] || "");

    const bookingLines: [string, string][] = [
      ["稱呼", text(answers, "name")],
      ["聯絡", `${text(answers, "contactMethod")} ${text(answers, "contact")}`.trim()],
      ["首次／回訪", text(answers, "visit")],
      ["服務", serviceName],
      ["地點", text(answers, "location")],
      ["可行時段", text(answers, "availability")],
      ["時長", text(answers, "sessionDuration")],
    ];
    const bodyLines: [string, string][] = [
      ["主要目的", text(answers, "purposes")],
      ["主要區域", text(answers, "regions")],
      ["目前狀況", text(answers, "condition")],
      ["職業", text(answers, "occupation")],
      ["工作型態", text(answers, "work")],
      ["運動頻率", text(answers, "exerciseFrequency")],
      ["主要運動", text(answers, "sports")],
      ["舊傷／手術", text(answers, "injuryHistory")],
      ["安全", text(answers, "safety")],
      ["安全補充", text(answers, "safetyNote")],
      ["需人工確認", requiresReview ? "是" : ""],
      ["整理深度", text(answers, "depth")],
      ["不希望整理", text(answers, "noTouchDetail")],
    ];

    let output = "【BodyFix Intake】\n【預約】\n" + bookingLines.filter(([, v]) => v).map(([k, v]) => `${k}：${v}`).join("\n");
    output += "\n【身體與生活】\n" + bodyLines.filter(([, v]) => v).map(([k, v]) => `${k}：${v}`).join("\n");
    if (pelvic) {
      output += "\n【Pelvic Core】\n" + [
        ["方向", text(answers, "pelvicGoal")],
        ["可接受範圍", text(answers, "pelvicRange")],
        ["界線確認", "完成"],
        ["18+", answers.adult === "yes" ? "是" : "否"],
      ].filter(([, v]) => v).map(([k, v]) => `${k}：${v}`).join("\n");
    }
    if (movement) {
      output += "\n【Movement】\n" + [
        ["目標", text(answers, "trainingGoal")],
        ["經驗", text(answers, "experience")],
        ["偏好安排", text(answers, "arrangement")],
      ].filter(([, v]) => v).map(([k, v]) => `${k}：${v}`).join("\n");
    }
    output += "\n【RETURN】\n" + [
      ["本次期待", text(answers, "expectation")],
      ["補充", text(answers, "notes")],
    ].filter(([, v]) => v).map(([k, v]) => `${k}：${v}`).join("\n");
    const profileLines: [string, string][] = [
      ["年齡", text(answers, "age")],
      ["生日", text(answers, "birthday")],
      ["身高", text(answers, "height") ? `${text(answers, "height")} cm` : ""],
      ["體重", text(answers, "weight") ? `${text(answers, "weight")} kg` : ""],
    ];
    if (profileLines.some(([, v]) => v)) output += "\n【首次建檔】\n" + profileLines.filter(([, v]) => v).map(([k, v]) => `${k}：${v}`).join("\n");
    output += "\n填寫日期：" + new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium" }).format(new Date());
    return output;
  }, [answers, movement, pelvic, requiresReview]);

  function focusField(name: string) {
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${name}"]`);
    el?.focus();
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const requiredKeys = ["name", "contactMethod", "contact", "visit", "service", "location", "availability", "sessionDuration", "purposes", "regions", "condition", "occupation", "work", "exerciseFrequency", "injuryHistory", "safety", "depth", "expectation"];
    const missing = requiredKeys.find(key => !hasAnswer(answers[key]));
    const invalid = formRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>(":invalid");
    if (missing || invalid) {
      setError("還有必填資料沒完成，我已幫你定位到第一個需要補的地方。");
      if (missing) focusField(missing); else { invalid?.focus(); invalid?.scrollIntoView({ behavior: "smooth", block: "center" }); }
      return;
    }
    if (pelvic && ((answers.pelvicConsent as string[] || []).length !== pelvicConsent.length || answers.adult !== "yes")) {
      setError("Pelvic Core 需要完成專業界線與 18+ 確認。");
      focusField((answers.pelvicConsent as string[] || []).length !== pelvicConsent.length ? "pelvicConsent" : "adult");
      return;
    }
    if ((answers.finalConsent as string[] || []).length !== finalConsent.length) {
      setError("請完成最後的服務與資料確認。");
      focusField("finalConsent");
      return;
    }
    setComplete(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copyAndOpenLine() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopyState("copied");
      window.open(LINE_URL, "_blank", "noopener,noreferrer");
    } catch {
      setCopyState("fallback");
    }
  }

  if (complete) return <main className="intake-v2-page"><section className="intake-v2-complete">
    <span className="intake-v2-kicker">BODYFIX INTAKE</span>
    <h1>{requiresReview ? "資料已整理完成" : "填好了 👍"}</h1>
    <p>{requiresReview ? "你的資料裡有一些狀況需要 Gavin 先確認。目前不代表不能進行 BodyFix，會先確認適合的整理範圍與深度。" : "我會先看過你的狀況。到現場後還是會再做一次簡單的 READ。"}</p>
    <button className="intake-v2-primary" onClick={copyAndOpenLine}>複製摘要並開啟 LINE</button>
    {copyState === "copied" && <p role="status">已複製。LINE 開啟後，請貼上剛才複製的內容。</p>}
    {copyState === "fallback" && <div className="intake-v2-fallback"><p role="alert">瀏覽器未允許自動複製，請長按或全選下方內容手動複製，再開啟 LINE。</p><textarea readOnly value={summary} onFocus={e => e.currentTarget.select()} /><a href={LINE_URL} target="_blank" rel="noreferrer">開啟 LINE →</a></div>}
    <button className="intake-v2-secondary" onClick={() => setComplete(false)}>重新檢查答案</button>
  </section></main>;

  return <main className="intake-v2-page"><div className="intake-v2-shell">
    <header className="intake-v2-hero">
      <Link href="/website" className="intake-v2-brand"><span>BF</span> BODYFIX</Link>
      <span className="intake-v2-kicker">PRE-SERVICE INTAKE · 單頁快速填寫</span>
      <h1>預約前，先讓我認識你的身體</h1>
      <p>用來協助預約安排、身體追蹤與個人紀錄建立；告訴我這次想整理什麼、最近的身體狀況，以及需要先注意的地方。</p>
      <strong>READ → RESET → RECONNECT → RETURN</strong>
      <small>一般約 2 分鐘；Pelvic Core 會多幾項必要的專業界線確認。沒有標準答案，照現在的感受填即可。</small>
    </header>

    <form ref={formRef} onSubmit={submit} noValidate>
      <section className="intake-v2-card">
        <h2>A｜基本資料</h2>
        <Field label="Q1｜怎麼稱呼你？" name="name" answers={answers} setAnswers={setAnswers} required placeholder="暱稱就可以" />
        <Question number="Q2" title="方便聯絡你的方式？" required><Choice name="contactMethod" options={["LINE", "Instagram", "Facebook / Messenger", "電話", "其他"]} answers={answers} setAnswers={setAnswers} required /></Question>
        <Field label="Q2-1｜LINE 名稱／IG 帳號／聯絡方式" name="contact" answers={answers} setAnswers={setAnswers} required placeholder="讓我知道預約的是哪一位就好" />
        <Question number="Q3" title="這次是？" required><Choice name="visit" options={["第一次預約 BodyFix", "之前來過", "曾上過 Gavin 的教練課", "筋膜整理與教練課都來過"]} answers={answers} setAnswers={setAnswers} required /></Question>
        <details className="intake-v2-summary"><summary>推薦來源（選填）</summary>
          <Question number="Q4" title="你怎麼知道 BodyFix 的？"><Choice name="source" options={["Instagram", "Twitter / X", "Threads", "Facebook", "LINE 官方帳號", "Google 搜尋", "PRO360", "朋友介紹", "之前就是 Gavin 的客戶／學生", "其他"]} answers={answers} setAnswers={setAnswers} /></Question>
          {answers.source === "朋友介紹" && <Field label="如果方便，是哪位朋友介紹的？" name="referrer" answers={answers} setAnswers={setAnswers} />}
        </details>
      </section>

      <section className="intake-v2-card">
        <h2>B｜服務與 READ</h2>
        <Question number="Q5" title="這次主要想做哪一種服務？" required><Choice name="service" answers={answers} setAnswers={setAnswers} required options={[
          ...BODYFIX_SERVICES.map(s => ({ value: s.id, label: `${s.name}｜${s.duration}${s.badge ? `｜${s.badge}` : ""}`, detail: s.description })),
          { value: "movement", label: "Movement Training｜一對一教練課" },
          { value: "movement-combo", label: "Movement Training ＋ 筋膜整理", detail: "想把訓練與身體整理一起安排" },
          { value: "unsure", label: "不確定，希望 Gavin 看完狀況後建議" },
        ]} /></Question>
        <Question number="Q5-1" title="希望服務地點？" required><Choice name="location" options={["六張犁工作室", "西門共享工作室", "國父紀念館共享工作室", "到府／其他安排（先確認）", "不確定，想先問 Gavin"]} answers={answers} setAnswers={setAnswers} required /></Question>
        <Field label="Q5-2｜可行日期與時段" name="availability" answers={answers} setAnswers={setAnswers} required textarea placeholder="例：10/10 18:00、10/11 20:00；可填 1–3 個方便的時間。" />
        <Question number="Q5-3" title="希望本次時長？" required><Choice name="sessionDuration" options={["60 分鐘", "90 分鐘", "120 分鐘", "不確定，希望 Gavin 依狀況建議"]} answers={answers} setAnswers={setAnswers} required /></Question>
        <Question number="Q6" title="這次最主要想處理什麼？" required><Choice name="purposes" options={purposes} answers={answers} setAnswers={setAnswers} multiple /></Question>
        <Question number="Q7" title="最有感的區域？" required><Choice name="regions" options={regions} answers={answers} setAnswers={setAnswers} multiple /></Question>
        <Field label="Q8｜用自己的話說，現在身體怎麼了？" name="condition" answers={answers} setAnswers={setAnswers} required textarea placeholder="例：久坐右腰會緊、深蹲到底髖會卡。" />
        <details className="intake-v2-summary"><summary>補充更多身體狀況（選填）</summary>
          <Question number="Q9" title="目前比較常出現哪些感覺？"><Choice name="feelings" options={["痠／緊", "卡／僵硬", "拉扯感", "疼痛", "麻／刺", "容易疲勞", "覺得使不上力", "沒有明顯不舒服／其他"]} answers={answers} setAnswers={setAnswers} multiple /></Question>
          <Question number="Q10" title="目前最影響你什麼？"><Choice name="impact" options={["日常／工作", "久坐／久站", "睡眠", "重量訓練", "跑步／球類", "深蹲／硬舉", "肩膀舉高／推拉", "沒有明顯影響／其他"]} answers={answers} setAnswers={setAnswers} multiple /></Question>
          <Question number="Q11" title="大概持續多久？"><Choice name="duration" options={["最近幾天", "1–4 週", "1–3 個月", "3–6 個月", "半年以上", "一年以上／時好時壞很久", "不確定"]} answers={answers} setAnswers={setAnswers} /></Question>
        </details>
      </section>

      <section className="intake-v2-card">
        <h2>C｜生活、工作與身體背景</h2>
        <Field label="Q12｜你的職業／主要工作是？" name="occupation" answers={answers} setAnswers={setAnswers} required placeholder="例：工程師、護理師、教師、餐飲、自由工作者" />
        <Question number="Q13" title="工作時身體大部分怎麼使用？" required><Choice name="work" options={["久坐為主", "久站為主", "走動很多", "搬重物／體力工作", "開車／騎車很多", "混合型／其他"]} answers={answers} setAnswers={setAnswers} required /></Question>
        <Question number="Q14" title="平常有運動或重量訓練嗎？" required><Choice name="exerciseFrequency" options={["目前沒有", "偶爾運動", "每週 1–2 次", "每週 3–4 次", "每週 5 次以上／運動是工作之一"]} answers={answers} setAnswers={setAnswers} required /></Question>
        {answers.exerciseFrequency && answers.exerciseFrequency !== "目前沒有" && <Question number="Q14-1" title="主要做哪些運動？"><Choice name="sports" options={["重量訓練", "跑步／球類", "游泳", "瑜珈／皮拉提斯", "格鬥／拳擊", "登山／自行車", "其他"]} answers={answers} setAnswers={setAnswers} multiple /></Question>}
        <Field label="Q15｜過去舊傷或手術紀錄" name="injuryHistory" answers={answers} setAnswers={setAnswers} required textarea placeholder="有的話簡單寫部位與時間；沒有可填「無」。" />
        <details className="intake-v2-summary"><summary>過去處理方式（選填）</summary>
          <Question number="Q15-1" title="之前有為這個狀況做過處理嗎？"><Choice name="past" options={["沒有", "按摩／筋膜整理", "物理治療／復健／醫療", "徒手／整脊類", "自己伸展／滾筒", "教練／訓練調整／其他"]} answers={answers} setAnswers={setAnswers} /></Question>
          {answers.past && answers.past !== "沒有" && <Field label="之前處理後，有沒有什麼希望這次特別注意？" name="pastAvoid" answers={answers} setAnswers={setAnswers} textarea />}
        </details>
      </section>

      <section className="intake-v2-card">
        <h2>D｜安全與 RESET</h2>
        <Question number="Q16" title="目前有沒有以下狀況？" required><Choice name="safety" options={safetyOptions} answers={answers} setAnswers={setAnswers} multiple /></Question>
        {(answers.safety as string[] || []).some(v => v !== "以上皆無") && <Field label="如果有勾選，可以簡單補充嗎？" name="safetyNote" answers={answers} setAnswers={setAnswers} textarea placeholder="例如什麼時候受傷／手術、目前是否仍有限制。" />}
        <aside className="intake-v2-warning">如目前有突然出現的明顯無力或麻木、胸痛、呼吸困難、重大急性外傷，或其他你認為需要立即醫療處理的狀況，應先尋求醫療評估。</aside>
        <Question number="Q17" title="整理過程中，你偏好的深度？" required hint="BodyFix 不以「越痛越有效」為原則；過程中可以隨時要求調整或停止。"><Choice name="depth" options={["從輕柔開始", "有明顯痠感，但不要痛", "可以較深，但仍要能正常呼吸、放鬆", "不確定，依當下身體反應判斷"]} answers={answers} setAnswers={setAnswers} required /></Question>
        <Question number="Q18" title="有沒有不希望被碰觸或整理的區域？"><Choice name="noTouch" options={["沒有", "有"]} answers={answers} setAnswers={setAnswers} /></Question>
        {answers.noTouch === "有" && <Field label="請告訴我哪些區域" name="noTouchDetail" answers={answers} setAnswers={setAnswers} textarea />}
      </section>

      {(pelvic || movement) && <section className="intake-v2-card">
        <h2>E｜依服務加問</h2>
        {pelvic && <div className="intake-v2-conditional"><h3>Pelvic Core</h3>
          <Question number="P1" title="這次最想整理哪個方向？"><Choice name="pelvicGoal" options={["髖前側／髂腰肌周邊容易緊", "臀部／骨盆後側緊", "大腿內側／內收肌緊", "下腹與骨盆周邊張力", "深蹲／硬舉時髖骨盆卡住", "想做完整骨盆核心整理", "沒有特定位置，依筋膜線判讀", "其他"]} answers={answers} setAnswers={setAnswers} multiple /></Question>
          <Question number="P2" title="目前可以接受的整理範圍？" hint="勾選可以不代表現場一定會處理，仍會依當下判讀與身體反應決定。"><Choice name="pelvicRange" options={["下腹", "髖前側", "臀部", "大腿內側／內收肌", "鼠蹊周邊", "會陰周邊外層區域", "先不要處理較私密的周邊區域", "還不確定，到現場再決定"]} answers={answers} setAnswers={setAnswers} multiple /></Question>
          <Question number="P3" title="骨盆核心／龍筋區專業界線確認" required><Choice name="pelvicConsent" options={pelvicConsent} answers={answers} setAnswers={setAnswers} multiple /></Question>
          <Question number="P4" title="年齡確認" required><Choice name="adult" options={[{ value: "yes", label: "我已滿 18 歲" }, { value: "no", label: "我未滿 18 歲" }]} answers={answers} setAnswers={setAnswers} required /></Question>
          {answers.adult === "no" && <aside className="intake-v2-warning">目前無法直接進行 Pelvic Core 私密周邊區域相關服務，請改選其他 BodyFix 服務或先與 Gavin 聯絡確認。</aside>}
        </div>}
        {movement && <div className="intake-v2-conditional"><h3>Movement Training</h3>
          <Question number="M1" title="目前最主要的訓練目標？"><Choice name="trainingGoal" options={["增加肌肉量／力量", "背部／肩膀寬度", "下肢／臀腿", "改善動作控制", "深蹲／硬舉", "推／拉類動作", "重新開始規律運動", "體態／體能／減脂", "運動表現", "不確定／其他"]} answers={answers} setAnswers={setAnswers} multiple /></Question>
          <Question number="M2" title="重量訓練經驗？"><Choice name="experience" options={["完全沒有", "未滿半年", "半年～2 年", "2～5 年", "5 年以上"]} answers={answers} setAnswers={setAnswers} /></Question>
          <Question number="M3" title="你比較有興趣的安排方式？"><Choice name="arrangement" options={["單純一對一教練課", "教練課後接筋膜整理", "訓練與筋膜整理不同天", "長期教練＋筋膜整理方案", "還不確定，先體驗再決定"]} answers={answers} setAnswers={setAnswers} /></Question>
        </div>}
      </section>}

      <section className="intake-v2-card">
        <h2>F｜RETURN｜最後確認</h2>
        <Question number="Q19" title="這次結束後，你最希望帶走什麼？" required><Choice name="expectation" options={["身體不要那麼緊", "某個動作更順", "訓練比較能正常發力", "髖／骨盆活動更自然", "肩頸／腰背負擔降低", "全身重新整理過", "知道回去可以怎麼訓練／使用身體", "單純想舒服地整理與恢復", "其他"]} answers={answers} setAnswers={setAnswers} required /></Question>
        <Field label="Q20｜還有什麼想先讓 Gavin 知道的？（選填）" name="notes" answers={answers} setAnswers={setAnswers} textarea placeholder="怕痛、過去經驗、希望多花時間的區域或服務疑問，都可以寫。" />
        <details className="intake-v2-summary"><summary>首次建檔資料（選填）</summary>
          <Field label="Q21｜年齡（生日已填可略過）" name="age" answers={answers} setAnswers={setAnswers} type="number" placeholder="例：31" />
          <Field label="Q22｜生日" name="birthday" answers={answers} setAnswers={setAnswers} type="date" />
          <Field label="Q23｜身高（cm）" name="height" answers={answers} setAnswers={setAnswers} type="number" placeholder="例：175" />
          <Field label="Q24｜體重（kg）" name="weight" answers={answers} setAnswers={setAnswers} type="number" placeholder="例：70" />
        </details>
        {requiresReview && <aside className="intake-v2-warning">你的資料中有需要 Gavin 先人工確認的安全項目；送出不代表已核准服務。</aside>}
        <Question number="Q25" title="服務與資料確認" required><Choice name="finalConsent" options={finalConsent} answers={answers} setAnswers={setAnswers} multiple /></Question>
        <details className="intake-v2-summary"><summary>預覽 LINE 摘要</summary><pre>{summary}</pre></details>
      </section>

      {error && <p className="intake-v2-error" role="alert">{error}</p>}
      <nav className="intake-v2-actions"><button type="submit" className="intake-v2-primary">整理問卷並準備 LINE 摘要</button></nav>
    </form>
  </div></main>;
}
