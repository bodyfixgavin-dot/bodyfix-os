import Link from "next/link";
import { LearnerHero, LearnerShell } from "@/components/learner/LearnerShell";

const worlds = [
  ["讀體場", "面對身體文本，留下觀察、假設、缺口與安全界線。", "/learner/field"],
  ["方法圖譜", "查閱五大閱讀鏡頭、BodyFix 4R 與十二讀位。", "/learner/atlas"],
  ["讀體星圖", "查看已留下的實作證據、能力結構與當前守界範圍。", "/learner/passport"],
];

export default function LearnerPage() {
  return <LearnerShell><LearnerHero eyebrow="BODYFIX BODY READING FIELD" title="BodyFix 讀體場"><p className="learner-lead">不是完成課程的地方，而是練習如何重新看見身體的現場。</p><p>透過初讀、對讀、重讀與實讀，留下可被查證的研判軌跡，逐步建立能安全負責的實作範圍。</p></LearnerHero><section className="learner-grid">{worlds.map(([title, summary, href]) => <Link className="learner-card" href={href} key={href}><span>初讀 → 對讀 → 重讀 → 實讀</span><h2>{title}</h2><p>{summary}</p><b>進入</b></Link>)}</section><section className="learner-statement"><h2>張力偵查與研判系統</h2><p>BodyFix 讀體場不是傳統課程平台，也不是 Moodle 的縮小版。它協助讀體者練習觀察、提出假設、對讀、修正判斷，並留下可被查證的實作證據。</p></section></LearnerShell>;
}
