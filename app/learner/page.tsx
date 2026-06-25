import Link from "next/link";
import { LearnerHero, LearnerShell } from "@/components/learner/LearnerShell";

const worlds = [
  {
    eyebrow: "CURRENT BODY TEXT",
    title: "讀體場",
    summary: "面對目前的身體文本，分開記錄觀察、假設、資訊缺口與安全界線。",
    process: "初讀 → 對讀 → 重讀 → 實讀",
    cta: "開啟讀體場 →",
    href: "/learner/field",
    featured: true,
  },
  {
    eyebrow: "LENSES · 4R · 12 POSITIONS",
    title: "方法圖譜",
    summary: "查閱五大閱讀鏡頭、BodyFix 4R 與十二讀位，為當前案例選擇合適的觀察角度。",
    cta: "展開方法圖譜 →",
    href: "/learner/atlas",
  },
  {
    eyebrow: "EVIDENCE · CAPABILITY · BOUNDARY",
    title: "讀體星圖",
    summary: "查看已累積的研判與實作證據，理解目前穩定能力、引導範圍與守界區域。",
    cta: "查看讀體星圖 →",
    href: "/learner/passport",
  },
];

export default function LearnerPage() {
  return <LearnerShell><LearnerHero eyebrow="BODYFIX BODY READING FIELD" title="BodyFix 讀體場"><p className="learner-lead">不是完成課程的地方，而是練習如何重新看見身體的現場。</p><p>透過初讀、對讀、重讀與實讀，留下可被查證的研判軌跡，逐步建立能安全負責的實作範圍。</p></LearnerHero><section className="learner-grid learner-entry-grid">{worlds.map((item) => <Link className={`learner-card learner-entry-card${item.featured ? " learner-entry-card-primary" : ""}`} href={item.href} key={item.href}><span>{item.eyebrow}</span><h2>{item.title}</h2><p>{item.summary}</p>{item.process ? <small>{item.process}</small> : null}<b>{item.cta}</b></Link>)}</section><section className="learner-statement learner-method-statement"><span>METHOD FOUNDATION</span><h2>張力偵查與研判系統</h2><p>觀察不是結論，假設必須留下證據；<br />每一次介入，都要知道自己的安全邊界。</p></section></LearnerShell>;
}
