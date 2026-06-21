"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

const routeOptions = ["1 對 1 個別導入", "入門工作坊", "兩者都想了解", "筋膜鏈整理基礎班", "尚未確定，希望 Gavin 協助建議"];
const contactPlaceholders = {
  LINE: "請填寫 LINE 顯示名稱、LINE ID，或其他能辨識你的方式",
  Instagram: "請填寫 Instagram 帳號",
  Email: "請填寫 Email",
};
const framework = [
  ["01", "Read", "判讀", "從主訴、呼吸、站姿、活動度與動作回測，觀察身體目前由誰代償、張力如何分工，以及哪些方向需要保守處理。", "Observe · Compare · Record"],
  ["02", "Reset", "整理", "在低痛感、可呼吸、身體能接受的深度裡，降低不必要的張力與保護性收縮，而不是用疼痛或深度證明效果。", "Low Pain · Breathable · Adaptive"],
  ["03", "Reconnect", "整合", "把呼吸、足底、髖、核心與筋膜線重新接回簡單動作，觀察整理後的變化能否在站立與移動中被使用。", "Breath · Ground · Movement"],
  ["04", "Return", "接回使用", "把整理後的變化帶回生活、工作與訓練，並透過紀錄、回測與後續追蹤，確認新的身體策略能否被保留下來。", "Apply · Track · Progress"],
];
const outcomes = [
  ["01", "一套 4R 服務思考流程", "把 Read、Reset、Reconnect、Return 應用在原本的教練、按摩、美業或身體服務工作中。"],
  ["02", "基礎進場評估方法", "從主訴、呼吸、站姿、活動度與簡單動作開始觀察，而不是一進場就追著痛點做。"],
  ["03", "安全邊界與停止條件", "知道哪些狀況可以繼續、哪些需要降低強度，以及哪些訊號出現時應該停止並建議進一步評估。"],
  ["04", "回測與服務紀錄框架", "使用相同動作比較前後差異，並把主訴、判讀、整理方向與課後安排記錄下來。"],
  ["05", "後續學習路線建議", "依照你的背景與實務需求，確認適合繼續深入筋膜鏈、服務流程、案例紀錄或 BodyFix 完整系統。"],
];

export default function MethodPage() {
  const [route, setRoute] = useState(routeOptions[4]);
  const [contactMethod, setContactMethod] = useState<keyof typeof contactPlaceholders>("LINE");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const scrollTo = (id: string, nextRoute?: string) => {
    if (nextRoute) setRoute(nextRoute);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const contactPlaceholder = useMemo(() => contactPlaceholders[contactMethod], [contactMethod]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("interested_route", route);
    formData.set("contact_method", contactMethod);
    try {
      const response = await fetch("/api/method-interest", { method: "POST", body: formData });
      if (!response.ok) throw new Error("submit failed");
      form.reset();
      setRoute(routeOptions[4]);
      setContactMethod("LINE");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="portal-page portal-detail-page method-page">
      <div className="portal-detail-shell method-shell">
        <Link className="portal-back-link" href="/">← 返回 BodyFix OS</Link>
        <header className="portal-detail-hero method-hero">
          <p className="portal-kicker">Professional Learning Entrance</p>
          <h1>BodyFix Method</h1>
          <p className="portal-detail-lead">很多人以為，身體服務拼的是手感。</p>
          <p className="method-hero-intro">真正難的，是把手感說清楚、做得穩定，還能交給下一個人。BodyFix Method 就是把它整理成一套可判讀、可回測、可記錄的方法。</p>
          <p className="method-emphasis">不是教你做得更痛、更深，而是教你怎麼看、怎麼做、怎麼停，以及怎麼把身體接回動作與生活。</p>
          <div className="method-actions"><button className="method-btn method-btn-primary" onClick={() => scrollTo("learning-routes")}>查看學習入口</button><button className="method-btn method-btn-secondary" onClick={() => scrollTo("method-interest")}>登記課程興趣</button></div>
        </header>

        <Section kicker="The BodyFix Framework" title="你實際會學會什麼" copy="BodyFix Method 不以零散手法為主，而是透過 Read、Reset、Reconnect、Return，建立從觀察到回接使用的完整服務思考流程。">
          <div className="method-framework-grid">{framework.map(([n, en, zh, copy, tag]) => <article className="method-card" key={n}><span className="method-number">{n}</span><h3>{en}</h3><strong>{zh}</strong><p>{copy}</p><small>{tag}</small></article>)}</div>
        </Section>

        <Section id="learning-routes" kicker="Choose Your Entrance" title="選擇適合你的學習入口" copy="個別導入與入門工作坊是兩種平行入口，不是必須依序完成的課程等級。你可以依照自己的工作背景、學習方式與目前卡點選擇。">
          <div className="method-route-grid"><RouteCard label="Individual Route" title="BodyFix 身體狀態整理個別導入" target="1 對 1 個別導入" button="登記個別導入" onChoose={scrollTo} desc="適合已經有教練、按摩、美業或其他身體服務背景，希望依照自己的工作經驗、客戶類型與實務問題，快速理解 BodyFix 判讀邏輯與服務流程的人。" points={["梳理你目前的服務流程與常見卡點","建立個人的張力與代償觀察框架","理解 BodyFix 4R 服務流程","練習回測、紀錄與安全邊界","依個人案例討論後續學習路線"]} format="1 對 1 個別進行" note="實際內容、形式與費用會依背景及學習需求個別確認。" />
          <RouteCard label="Workshop Route" title="BodyFix 身體狀態整理入門工作坊" target="入門工作坊" button="接收工作坊通知" onChoose={scrollTo} desc="適合第一次接觸 BodyFix Method，希望建立代償、張力、回接、安全邊界與低痛感整理共同語言的人。" points={["理解 BodyFix 核心語言與 4R 流程","練習基礎身體狀態觀察","建立低痛感、可呼吸的整理原則","理解同意、停止權與服務邊界","練習簡單回測與紀錄方法"]} format="小團體工作坊" note="首批梯次、時數、名額與費用將依登記狀況另行通知。" /></div>
        </Section>

        <section className="method-advanced method-card"><div><p className="portal-kicker">Advanced Route</p><h2>進階實作路線</h2><span className="method-status">Coming Soon</span></div><h3>BF Fascia Line Reset</h3><strong>筋膜鏈整理基礎班</strong><p>適合已有身體服務或訓練背景，希望進一步學習筋膜鏈整理、張力路徑判讀，以及完整 60 分鐘服務流程的人。</p><p className="method-note">建議先完成 1 對 1 個別導入或入門工作坊，再進入完整筋膜鏈與服務流程實作。</p><button className="method-btn method-btn-secondary" onClick={() => scrollTo("method-interest", "筋膜鏈整理基礎班")}>關注進階班動態</button></section>

        <Section kicker="Learning Outcomes" title="不只聽懂概念，而是帶走可使用的框架">
          <div className="method-outcome-list">{outcomes.map(([n,t,c]) => <article key={n} className="method-outcome"><span>{n}</span><div><h3>{t}</h3><p>{c}</p></div></article>)}</div><p className="method-fineprint">實際教材與表單依課程內容提供。完整內部知識庫與培訓文件保留給正式培訓與認證流程使用。</p>
        </Section>

        <aside className="portal-boundary method-boundary"><p className="portal-kicker">Safety Boundary</p><h2>先知道不做什麼，方法才有成立的邊界。</h2><div className="method-boundary-grid"><div><h3>BodyFix 會教</h3><p>・身體狀態與代償觀察<br/>・低痛感外部整理原則<br/>・筋膜線與動作回測方法<br/>・操作說明、明確同意與停止權<br/>・課後追蹤與服務紀錄框架</p></div><div><h3>BodyFix 不取代</h3><p>・醫療診斷與疾病治療<br/>・關節矯正或整骨宣稱<br/>・內部處理或侵入性操作<br/>・泌尿、排便或性功能療效承諾<br/>・任何保證改善或永久改變的宣稱</p></div></div><p className="method-emphasis">我們教判讀，但不把判讀說成診斷；我們教整理，但不把整理包裝成治療。</p><p>BodyFix Method 會教身體狀態判讀，但不取代醫療診斷；不教醫療處置、不宣稱矯正治療，也不承諾療效。</p></aside>

        <section id="method-interest" className="portal-detail-section method-form-section"><div className="portal-detail-heading"><span>Interest Registration</span><h2>先留下你的背景與學習方向</h2></div><p>你不需要先加入 LINE，也不需要重複私訊。完成表單後，Gavin 會依照你選擇的聯絡方式回覆。</p><form className="method-form" onSubmit={onSubmit}><label>姓名<input required name="name" placeholder="姓名或希望被稱呼的名字" /></label><label>職業背景<select required name="professional_background" defaultValue=""><option value="" disabled>請選擇</option>{["教練","按摩或徒手服務","美業工作者","醫護或健康相關工作","運動訓練者","目前沒有相關背景","其他"].map(v=><option key={v}>{v}</option>)}</select></label><label>想了解的入口<select required name="interested_route" value={route} onChange={(e)=>setRoute(e.target.value)}>{routeOptions.map(v=><option key={v}>{v}</option>)}</select></label><label>希望的聯絡方式<select required name="contact_method" value={contactMethod} onChange={(e)=>setContactMethod(e.target.value as keyof typeof contactPlaceholders)}>{Object.keys(contactPlaceholders).map(v=><option key={v}>{v}</option>)}</select></label><label className="method-wide">聯絡資料<input required name="contact_value" placeholder={contactPlaceholder} type={contactMethod === "Email" ? "email" : "text"} /></label><label className="method-wide">最想解決的學習問題<textarea name="learning_question" placeholder="例如：不知道如何做進場判讀、手法容易做太深、不知道如何回測、想整理自己的服務流程。" /></label><div className="method-consent method-wide"><p>送出資料僅用於 BodyFix Method 課程聯絡、學習需求判斷與後續通知，不會公開顯示。</p><label><input required name="consent" type="checkbox" value="true" />我已閱讀並同意以上資料使用說明。</label></div><button disabled={status === "sending"} className="method-btn method-btn-primary method-wide">{status === "sending" ? "正在送出…" : "送出興趣登記"}</button>{status === "success" ? <p className="method-success method-wide">已收到你的登記。<br/>Gavin 會依你留下的聯絡方式回覆，不需要另外再到 LINE 或 Instagram 重複留言。</p> : null}{status === "error" ? <p className="method-error method-wide">目前無法送出，請稍後再試。你也可以使用下方的次要聯絡方式。</p> : null}</form></section>

        <section className="portal-detail-closing method-closing"><p className="portal-kicker">Start From Where You Are</p><h2>你不需要一開始就學完整套系統。</h2><p>先從適合你的入口開始，逐步建立能判讀、能整理、能回測，也能安全記錄的身體服務框架。</p><div className="method-actions"><button className="method-btn method-btn-primary" onClick={() => scrollTo("method-interest", "1 對 1 個別導入")}>登記個別導入</button><button className="method-btn method-btn-secondary" onClick={() => scrollTo("method-interest", "入門工作坊")}>接收工作坊通知</button><button className="method-btn method-btn-ghost" onClick={() => scrollTo("learning-routes")}>回到 4R 方法介紹</button><a className="method-btn method-btn-line" href="https://line.me/ti/p/~bodyfix" target="_blank" rel="noreferrer">加入 BodyFix 官方 LINE</a></div></section>
      </div>
    </main>
  );
}

function Section({ id, kicker, title, copy, children }: { id?: string; kicker: string; title: string; copy?: string; children: React.ReactNode }) { return <section id={id} className="portal-detail-section method-section"><div className="portal-detail-heading"><span>{kicker}</span><h2>{title}</h2></div>{copy ? <p className="method-section-copy">{copy}</p> : null}{children}</section>; }
function RouteCard({ label, title, desc, points, format, note, button, target, onChoose }: { label:string; title:string; desc:string; points:string[]; format:string; note:string; button:string; target:string; onChoose:(id:string, route?:string)=>void }) { return <article className="method-route-card"><span className="method-label">{label}</span><h3>{title}</h3><p>{desc}</p><ul>{points.map(p=><li key={p}>{p}</li>)}</ul><p><strong>形式：</strong>{format}</p><p className="method-note">{note}</p><button className="method-btn method-btn-secondary" onClick={() => onChoose("method-interest", target)}>{button}</button></article>; }
