"use client";
import Link from "next/link";
import { useState } from "react";

type Kind = "A" | "B" | "C" | "D";
const questions: { title: string; options: Record<Kind, string> }[] = [
  { title: "你每天大部分時間，身體比較像哪種狀態？", options: { A:"長時間坐著工作或滑手機，幾乎不動", B:"雖然有活動，但肩頸、胸口或小腿常緊繃", C:"有固定訓練或運動，但訓練後恢復比較慢", D:"感覺身體某側或某部位特別用力，動作時容易不對稱" } },
  { title: "最近你最常注意到的身體感覺是？", options: { A:"肩頸僵硬、腰部或下背痠", B:"呼吸比較淺，胸口或肚子容易緊", C:"訓練或活動後，某個部位特別容易痠痛或僵硬", D:"骨盆、髖關節或下背感覺不穩，站久或走路時容易代償" } },
  { title: "你對「放鬆」或「休息」的感覺是？", options: { A:"坐下來休息後，身體某些地方還是放不開", B:"想放鬆，但容易一直想事情，身體像保持警戒", C:"休息後有恢復，但下次訓練還是容易回到緊繃", D:"想放鬆時，骨盆或核心區域反而更容易用力" } },
  { title: "你平常最常出現的「卡住」感覺在哪裡？", options: { A:"脖子、肩膀、上背", B:"胸口、呼吸、腹部", C:"訓練後的肌肉或筋膜，例如大腿、小腿、肩胛", D:"骨盆、髖關節、下背或核心區域" } },
  { title: "你對自己身體的整體感覺最接近哪一句？", options: { A:"久坐後容易僵硬，需要常常活動才舒服", B:"壓力或情緒一來，身體就容易進入緊繃模式", C:"訓練熱情高，但恢復速度跟不上，容易累積疲勞", D:"感覺身體某些動作順序錯了，核心或骨盆不太穩" } },
];
const results: Record<Kind, { title:string; copy:string; tip:string }> = {
 A:{title:"久坐型｜身體被同一個姿勢綁太久",copy:"你的張力模式偏向久坐型。長時間維持同一姿勢，會讓部分筋膜鏈與肌肉長時間硬撐，活動度與循環感也容易下降。",tip:"每 45 到 60 分鐘起身，做 2 分鐘髖關節開合與深呼吸，讓張力有機會重新分配。"},
 B:{title:"壓力型｜身體一直處在警戒模式",copy:"你的張力模式偏向壓力型。壓力、情緒或睡眠不足時，呼吸、胸口、腹部與核心區域容易進入保護性緊繃，讓整體彈性下降。",tip:"先從呼吸開始。每天 3 分鐘橫膈膜呼吸，幫助神經系統與張力先降一點。"},
 C:{title:"訓練恢復型｜練得夠，但恢復跟不上",copy:"你的張力模式偏向訓練恢復型。訓練熱情高，但恢復品質跟不上時，某些區域容易累積代償張力，讓痠痛、僵硬與疲勞感反覆出現。",tip:"把恢復也當成訓練的一部分。訓練後加入 5 到 8 分鐘針對性張力釋放與呼吸整合。"},
 D:{title:"骨盆核心代償型｜核心沒有穩，其他地方先硬撐",copy:"你的張力模式偏向骨盆核心代償型。當骨盆或核心區域的穩定度不足，其他部位容易代償出力，長期可能影響動作順序與身體效率。",tip:"先從骨盆中立位置與呼吸同步開始，讓核心真正參與，而不是一直靠其他地方硬撐。"},
};
export default function BodyTensionPage(){ const [answers,setAnswers]=useState<Partial<Record<number,Kind>>>({}); const [done,setDone]=useState(false); const winners=(()=>{const scores={A:0,B:0,C:0,D:0};Object.values(answers).forEach(x=>{if(x)scores[x]++});const max=Math.max(...Object.values(scores));return (Object.keys(scores) as Kind[]).filter(k=>scores[k]===max)})();
return <main className="tension-page"><div className="tension-shell"><nav className="tests-nav"><Link className="portal-wordmark" href="/"><span>BF</span><strong>BodyFix OS</strong></Link><div><Link href="/tests">所有測驗</Link></div></nav>
<header className="tension-hero"><p className="portal-kicker">BODY STATE CHECK · 5 QUESTIONS</p><h1>你是哪一種硬撐型身體？</h1><p>久坐、壓力、訓練恢復、骨盆核心代償。5 題看你現在的身體，是哪裡正在默默硬撐。</p></header>
{!done ? <section className="tension-quiz">{questions.map((q,i)=><fieldset className="tension-question" key={q.title}><legend><span>0{i+1}</span>{q.title}</legend><div>{(Object.entries(q.options) as [Kind,string][]).map(([key,text])=><label className={answers[i]===key?"selected":""} key={key}><input type="radio" name={`q${i}`} checked={answers[i]===key} onChange={()=>setAnswers({...answers,[i]:key})}/><b>{key}</b><span>{text}</span></label>)}</div></fieldset>)}<button className="tension-submit" disabled={Object.keys(answers).length!==questions.length} onClick={()=>{setDone(true);scrollTo({top:0,behavior:"smooth"})}}>看我的張力傾向 <span>→</span></button></section> : <section className="tension-result"><p className="portal-kicker">YOUR BODY TENSION TENDENCY</p><h2>{winners.length>1?"混合型｜身體正在用不只一種方式硬撐":results[winners[0]].title}</h2>{winners.map(k=><article key={k}>{winners.length>1&&<h3>{results[k].title}</h3>}<p>{results[k].copy}</p><div><strong>給你的小建議</strong><p>{results[k].tip}</p></div></article>)}<aside><p>測驗結果僅供參考，幫助你先看清楚自己目前的張力傾向。<br/>如果想針對你的類型做更完整的 4R 流程：判讀、整理、整合、接回使用，BodyFix 可以提供個人化的身體狀態整理。</p><Link className="tests-button" href="/booking">了解 BodyFix 身體張力整理服務 <span>→</span></Link></aside><button className="tension-restart" onClick={()=>{setAnswers({});setDone(false)}}>重新測一次</button></section>}</div></main>}
