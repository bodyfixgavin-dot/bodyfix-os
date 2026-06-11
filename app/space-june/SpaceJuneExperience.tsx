"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./SpaceJune.module.css";
import {
  CRYSTAL_TYPES,
  DIRECTIONS,
  GRID_LABELS,
  getAvoidZone,
  getBirthElement,
  getElementColor,
  getPlantRec,
  getRecommendedCrystals,
  getSunSign,
} from "@/lib/space-june/space-data";
import { BRANCH_TO_PALACE, BRANCH_TO_STARS, getCurrentPhase, getDajunBranch, getPhaseStrategy, getSanFang } from "@/lib/space-june/dajun-engine";
import { COMBO_PRODUCTS, CONSULT_PACKAGES, READY_PRODUCTS } from "@/lib/space-june/product-catalog";

type View = "home" | "lite" | "pro";
type QuizStep = 1 | 2 | 3;
type OrientationPermissionEvent = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };
type CompassEvent = DeviceOrientationEvent & { webkitCompassHeading?: number };

const SCENARIOS = [
  { id: "rent", label: "租屋看房", note: "先判斷入口、採光與主要動線" },
  { id: "move", label: "搬家", note: "決定先安頓哪一個方向" },
  { id: "furniture", label: "移家具", note: "在動手前先看方位節奏" },
  { id: "bed", label: "床位", note: "整理休息與安定感" },
  { id: "work", label: "工作桌", note: "整理聚焦、界線與完成感" },
  { id: "studio", label: "店面 / 工作室", note: "整理迎接、工作與流動" },
] as const;

const getQuery = (birth: string, direction: string, space: string) => new URLSearchParams({ birth, direction, space }).toString();
const directionReading = (direction: string) => `${direction}｜文昌 / 收斂 / 可整理`;
const directionFromHeading = (heading: number) => ["北", "東北", "東", "東南", "南", "西南", "西", "西北"][Math.round(heading / 45) % 8];

function Header() {
  return <header className={styles.nav}><div className={`${styles.shell} ${styles.navInner}`}><Link href="/space-june" className={styles.brand}>空間6月<small>Space June · space guide</small></Link><nav className={styles.navLinks}><Link href="/space-june#quiz">開始測驗</Link><Link href="/">BodyFix OS</Link></nav></div></header>;
}

function BottomNav({ result = false }: { result?: boolean }) {
  return <nav className={styles.bottomNav} aria-label="空間6月導覽">{result ? <><a href="#result">結果</a><Link href="/space-june/category/ready">現成款</Link><Link href="/space-june/category/combo">植物＋水晶</Link><Link href="/space-june/category/consult">一對一配置</Link><Link href="/space-june#quiz">重新測驗</Link></> : <><Link href="/space-june">首頁</Link><a href="#quiz">開始測驗</a></>}</nav>;
}

function ProductCard({ product }: { product: (typeof READY_PRODUCTS)[number] }) {
  return <article className={styles.card}><span className={styles.pill}>{product.shortTag}</span><h3>{product.name}</h3><p>{product.headline}</p><p><strong>{product.price}</strong></p><Link href={`/space-june/category/${product.categoryKey}`}>了解這個方向 →</Link></article>;
}

export default function SpaceJuneExperience({ view = "home", searchParams = {} }: { view?: View; searchParams?: Record<string, string | undefined> }) {
  const router = useRouter();
  const [birth, setBirth] = useState(searchParams.birth || "1990-06-15");
  const [direction, setDirection] = useState(searchParams.direction || "西");
  const [space, setSpace] = useState(searchParams.space || "rent");
  const [step, setStep] = useState<QuizStep>(1);
  const [compassStatus, setCompassStatus] = useState("");
  const branch = getDajunBranch(birth);
  const sanFang = getSanFang(branch);
  const crystals = getRecommendedCrystals(space, direction);
  const query = getQuery(birth, direction, space);

  const enableCompass = async () => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setCompassStatus("這個瀏覽器無法讀取指南針，請手動選擇方位。");
      return;
    }
    const orientationEvent = DeviceOrientationEvent as OrientationPermissionEvent;
    if (orientationEvent.requestPermission && await orientationEvent.requestPermission() !== "granted") {
      setCompassStatus("指南針權限未開啟，請手動選擇方位。");
      return;
    }
    window.addEventListener("deviceorientation", (event) => {
      const compassEvent = event as CompassEvent;
      const heading = compassEvent.webkitCompassHeading ?? (compassEvent.alpha == null ? null : 360 - compassEvent.alpha);
      if (heading != null) {
        const detectedDirection = directionFromHeading(heading);
        setDirection(detectedDirection);
        setCompassStatus(`目前偵測接近「${detectedDirection}」，請面向門外確認。`);
      }
    }, { once: true });
    setCompassStatus("指南針已啟用，請面向門外並稍微移動手機。");
  };

  if (view !== "home") return <main className={styles.page}><Header/><div className={styles.shell}>{view === "lite" ? <LiteResult crystals={crystals} direction={direction} space={space} birth={birth}/> : <><section className={styles.resultHero}><p className={styles.eyebrow}>空間6月｜Pro 10-Year Rhythm</p><h1>{branch}運｜你的 10 年空間節奏</h1><p className={styles.lead}>目前落在 {getCurrentPhase(birth)}。三方能量把空間分成啟動、建立與整合，不需要一次把整個家改完。</p></section><ProResult branch={branch} sanFang={sanFang}/></>}</div><BottomNav result/></main>;

  return <main className={styles.page}><Header/><div className={styles.shell}>
    <section className={styles.hero}><div><p className={styles.eyebrow}>空間6月｜年輕版九宮飛星測驗</p><h1>不要租到<span>會衰的房子。</span></h1><p className={styles.lead}>看房、搬家、移家具前，先測一下今年你的方位節奏。</p><div className={styles.actions}><a className={styles.button} href="#quiz">開始測空間</a><a className={styles.ghost} href="#nine-grid-preview">我只是想看九宮飛星</a></div><div className={styles.tags}><span>先測驗</span><span>先看結果</span><span>最後才選配置</span></div></div><div id="nine-grid-preview" className={styles.heroCompass} aria-label="九宮飛星指南針預覽"><span>空間6月</span><strong>先找到方向<br/>再決定怎麼動</strong><div className={styles.compassRose}>N<small>北</small></div></div></section>

    <section className={styles.quizSection} id="quiz"><div className={styles.sectionHead}><p className={styles.eyebrow}>Space rhythm quiz · {step}/3</p><h2>{step === 1 ? "先從你的出生日期開始。" : step === 2 ? "你現在準備動哪一種空間？" : "你現在要判讀哪個方向？"}</h2><p>{step === 3 ? "站在門口往外看，這間房子朝哪裡？可以啟用指南針，或直接手動選擇。" : "不用懂命理，只要照現在的情境回答。"}</p></div><div className={styles.progress}><span style={{ width: `${step / 3 * 100}%` }}/></div><form className={styles.quiz} onSubmit={e => { e.preventDefault(); router.push(`/space-june/result/lite?${query}`); }}>
      {step === 1 && <div className={styles.field}><label htmlFor="birth">出生日期 / 年份</label><input id="birth" type="date" value={birth} onChange={e => setBirth(e.target.value)} required/><button type="button" className={styles.button} onClick={() => setStep(2)}>下一步：選使用情境</button></div>}
      {step === 2 && <div className={styles.field}><label>使用情境</label><div className={styles.choiceGrid}>{SCENARIOS.map(item => <button type="button" key={item.id} onClick={() => setSpace(item.id)} className={`${styles.choice} ${space === item.id ? styles.choiceActive : ""}`}><strong>{item.label}</strong><small>{item.note}</small></button>)}</div><div className={styles.quizActions}><button type="button" className={styles.ghost} onClick={() => setStep(1)}>上一步</button><button type="button" className={styles.button} onClick={() => setStep(3)}>下一步：判讀方位</button></div></div>}
      {step === 3 && <div className={styles.field}><div className={styles.compassPrompt}><div className={styles.compassRose}>N<small>北</small></div><div><strong>讓手機協助確認方向</strong><p>{compassStatus || "指南針只用來協助你選方位，不會儲存位置。"}</p><button type="button" className={styles.ghost} onClick={enableCompass}>啟用手機指南針</button></div></div><label>或手動選擇方位</label><div className={styles.directionGrid}>{DIRECTIONS.map(item => <button type="button" key={item} onClick={() => setDirection(item)} className={`${styles.directionChoice} ${direction === item ? styles.choiceActive : ""}`}>{item}</button>)}</div><div className={styles.quizActions}><button type="button" className={styles.ghost} onClick={() => setStep(2)}>上一步</button><button className={styles.button}>取得九宮飛星結果</button></div></div>}
    </form></section>
  </div><BottomNav/><footer className={`${styles.shell} ${styles.footer}`}>空間6月 · 先測、先理解，再決定要不要配置。</footer></main>;
}

function NineGrid({ direction }: { direction: string }) {
  return <div className={styles.gridWrap}><div className={styles.grid}>{GRID_LABELS.map((item) => { const cellDirection = item.split("｜")[0]; return <div key={item} className={`${styles.gridCell} ${cellDirection === direction ? styles.gridCellActive : ""}`}><strong>{cellDirection}</strong><span>{item.split("｜")[1]}</span></div>; })}</div><div className={styles.gridCompass}><span>N</span><strong>北</strong><small>你的方位<br/>{direction}</small></div></div>;
}

function LiteResult({ crystals, direction, space, birth }: { crystals: typeof CRYSTAL_TYPES[number][]; direction: string; space: string; birth: string }) {
  return <><section className={styles.resultVisual} id="result"><p className={styles.eyebrow}>空間6月｜2025 九宮飛星</p><div className={styles.resultTitle}><div><span>你的方位</span><h1>{direction}</h1></div><p>{directionReading(direction)}</p></div><NineGrid direction={direction}/><p className={styles.scrollHint}>往下看這個方向今年怎麼用 ↓</p></section>
  <div className={styles.resultFlow}><section className={styles.panel}><p className={styles.eyebrow}>今年這個方向代表什麼</p><h2>先讓「{direction}」變清楚、可使用。</h2><p>你的 {getBirthElement(birth)} 元素與{getSunSign(birth)}節奏，適合用「{getElementColor(getBirthElement(birth))}」作為視覺線索。不是一次改完整間房，而是先讓這個方向能被日常使用。</p></section><section className={styles.panel}><p className={styles.eyebrow}>為什麼要先整理</p><h3>先清動線，再加東西。</h3><p>{getAvoidZone(direction)}</p><h3>三個空間行動</h3><ol><li>先移除三件不屬於這個用途的物品。</li><li>保留一個每天看得到的視覺焦點。</li><li>連續使用七天，再決定是否增加配置。</li></ol></section><section className={styles.panel}><p className={styles.eyebrow}>植物、水晶與材質方向</p><h3>把意圖變成看得見的提示。</h3><div className={styles.recommendations}><div><strong>適合植物</strong><p>{getPlantRec(space)}</p></div>{crystals.map(c => <div key={c.id}><strong>{c.name} · {c.crystal}</strong><p>{c.description}</p><Link href={`/space-june/crystals/${c.id}`}>看完整說明 →</Link></div>)}<div><strong>適合材質</strong><p>木、霧面陶器、天然纖維；避免一次加入太多高反光物件。</p></div></div><p className={styles.disclaimer}>植物與水晶是空間意圖的視覺提示，不代表專業醫療、心理或財務建議。</p></section><section className={styles.section}><div className={styles.sectionHead}><p className={styles.eyebrow}>想更準一點？</p><h2>看完結果，再選擇你需要的支持。</h2></div><div className={styles.cards}>{[READY_PRODUCTS[0], COMBO_PRODUCTS[0], CONSULT_PACKAGES[1]].map(p => <ProductCard key={p.id} product={p}/>)}</div><div className={styles.actions}><Link className={styles.button} href="/space-june/category/ready">看現成款</Link><Link className={styles.ghost} href="/space-june/category/combo">植物＋水晶組</Link><Link className={styles.ghost} href="/space-june/category/consult">一對一配置</Link><Link className={styles.ghost} href="/space-june#quiz">重新測驗</Link></div></section></div></>;
}

function ProResult({ branch, sanFang }: { branch: string; sanFang: string[] }) {
  return <div className={styles.resultLayout}><section className={styles.panel}><p className={styles.eyebrow}>San Fang Energy</p><h3>{BRANCH_TO_PALACE[branch]} · 三方能量三角形</h3><div className={styles.triangle}>{sanFang.map(x => <span key={x}>{x} · {BRANCH_TO_STARS[x]?.[0]}</span>)}</div><p>三個節點不是三個要同時完成的任務，而是用來檢查空間是否同時具有啟動、支持與收斂。</p></section><section className={styles.stack}>{[0, 1, 2].map(i => { const x = getPhaseStrategy(i); const b = sanFang[i]; return <article className={styles.panel} key={x.phase}><span className={styles.pill}>{x.phase} · {b}</span><h3>{BRANCH_TO_STARS[b]?.join(" × ")}</h3><p><strong>空間動作：</strong>{x.action}</p><p>植物：{x.plant} · 水晶：{x.crystal}</p></article>; })}</section></div>;
}
