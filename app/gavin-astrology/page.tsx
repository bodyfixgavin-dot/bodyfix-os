"use client";

import { FormEvent, useState } from "react";
import ziweiChart from "@/data/gavin-ziwei-chart.json";
import styles from "./page.module.css";

type ZiWeiPalace = (typeof ziweiChart.palaces)[number];

const navagraha = [
  ["☉", "太陽", "Surya / Sun", "सूर्य", "蘇哩呀", "自我、生命力、父親、權威、中心感", "看一個人如何發光、如何建立自我與存在感。"],
  ["☾", "月亮", "Chandra / Moon", "चन्द्र", "羌德拉", "情緒、感受、母親、安全感、內在需求", "看一個人的情緒反應、依附模式與內在安全感。"],
  ["△", "火星", "Mangala / Mars", "मङ्गल", "芒嘎拉", "行動、衝突、慾望、勇氣、身體火力", "看一個人如何出手、如何競爭，也看衝動與攻擊性。"],
  ["◇", "水星", "Budha / Mercury", "बुध", "布達", "思考、語言、學習、交易、彈性", "看一個人如何思考、溝通、學習與交換資訊。"],
  ["✦", "木星", "Guru / Jupiter", "गुरु", "咕嚕", "智慧、信念、老師、擴張、祝福", "看一個人的信念系統、成長方向與生命中的貴人力量。"],
  ["○", "金星", "Shukra / Venus", "शुक्र", "舒克拉", "愛、美感、享受、關係、吸引力", "看一個人如何愛、如何享受，也看審美與吸引模式。"],
  ["□", "土星", "Shani / Saturn", "शनि", "夏尼", "責任、限制、時間、壓力、成熟", "看一個人需要面對的功課、延遲、紀律與長期承擔。"],
  ["☊", "羅睺", "Rahu / North Node", "राहु", "拉呼", "執著、上癮、異常吸引、野心、未知欲望", "Rahu 不是實體行星，而是月交點。它像一股讓人想突破、想得到、想靠近的強烈拉力。"],
  ["☋", "計都", "Ketu / South Node", "केतु", "給土", "疏離、切斷、前世慣性、靈性、抽離", "Ketu 不是實體行星，而是月交點。它像一股讓人放手、疏離、往內走的力量。"]
];

const methodSteps = [
  ["01", "先產生命盤", "先讓你看見命盤本體，而不是只聽抽象解釋。"],
  ["02", "紫微斗數看結構", "看命宮、身宮、夫妻宮、福德宮與四化如何描述人格與關係慣性。"],
  ["03", "吠陀占星看力量", "看 Lagna、Moon、Venus、Rahu / Ketu、Nakshatra 與 Dasha 如何描述吸引與時間週期。"],
  ["04", "交叉比對", "兩套系統都指向同一個主題，才是值得深入看的線索。"],
  ["05", "轉成白話", "把古典語言翻成你聽得懂、能拿回生活裡使用的提醒。"],
  ["06", "申請深度解析", "如果你想看完整脈絡，可以申請 Gavin 的雙系統命盤解析。"]
];

const frameworks = [
  ["A", "關係腳本彈性", "觀察你是否容易跳脫傳統關係模板。"], ["B", "吸引模式流動性", "觀察你容易被什麼樣的人、氣質或狀態吸引。"],
  ["C", "情感需求落差", "觀察你內在真正想要的，和你表面選擇的是否一致。"], ["D", "關係角色彈性", "觀察你在關係裡是否容易不服從固定角色。"],
  ["E", "隱密關係壓力", "觀察你是否容易進入不能明講、不能公開或難以定義的關係。"], ["F", "關係模式觸發器", "觀察哪些流年、星曜或宮位容易讓舊模式被啟動。"]
];

const services = [
  ["紫微斗數命盤解析", "看命宮、身宮、夫妻宮、福德宮與四化，整理人格結構與人生節奏。"],
  ["吠陀占星入門解析", "從九曜、上升、月亮、Rahu / Ketu 與星宿，理解另一套生命地圖。"],
  ["雙系統關係模式解析", "用紫微與吠陀交叉比對，看你在親密關係裡反覆出現的選擇。"],
  ["曖昧與暈船狀態整理", "不是問對方愛不愛你，而是看這段關係對你來說是滋養、上癮，還是消耗。"]
];

const positions = [[1,1],[1,2],[1,3],[1,4],[2,4],[3,4],[4,4],[4,3],[4,2],[4,1],[3,1],[2,1]];

function Heading({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <header className={styles.heading}><span>{eyebrow}</span><h2>{title}</h2><p>{children}</p></header>;
}

function VedicDiagram() {
  return <div className={styles.vedicVisual} aria-label="吠陀盤視覺示意">
    <div className={styles.vedicSquare}><i /><i /><i /><i /><b>ॐ</b><span className={styles.v1}>सूर्य</span><span className={styles.v2}>चन्द्र</span><span className={styles.v3}>राहु</span><span className={styles.v4}>केतु</span></div>
    <p>吠陀盤視覺示意｜完整計算功能開發中</p>
  </div>;
}

function ZiWeiChart({ palaces }: { palaces: ZiWeiPalace[] }) {
  return <div className={styles.chartScroll}><div className={styles.chartSheet}>
    <div className={styles.chartBrand}><b>Gavin｜Chart Navigator</b><span>ZI WEI DOU SHU · 十二宮</span></div>
    <div className={styles.ziweiGrid}>
      {palaces.map((palace, index) => <article key={palace.name} className={`${styles.palace} ${palace.name === "命宮" ? styles.life : ""}`} style={{gridRow: positions[index][0], gridColumn: positions[index][1]}}>
        <div><b>{palace.name}</b><span>{palace.branch}</span></div><strong>{palace.mainStars.join("・") || "—"}</strong><small>{palace.subStars.join("・") || "副星待補"}</small>
        <p>{palace.tags.includes("身宮同宮") ? "身宮同宮" : ""} {palace.transformations.map(item => `化${item}`).join(" · ")}</p>
      </article>)}
      <div className={styles.chartCenter}><span>你的生命地圖</span><b>命盤導航</b><small>Chart Navigator by Gavin</small></div>
    </div>
    <div className={styles.chartFoot}><span>第一版前端命盤</span><span>僅供自我理解與後續諮詢參考</span></div>
  </div></div>;
}

export default function GavinAstrologyPage() {
  const [generated, setGenerated] = useState(false);
  function generate(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setGenerated(true); setTimeout(() => document.querySelector("#ziwei-result")?.scrollIntoView({ behavior: "smooth" }), 80); }

  return <main className={styles.page}>
    <nav className={styles.nav}><a href="#top"><b>G</b><span>Chart Navigator</span></a><div><a href="#birth-input">看命盤</a><a href="#vedic-hook">認識吠陀</a><a href="#intake">深度解析</a></div></nav>

    <section className={styles.hero} id="top"><div className={styles.heroCopy}>
      <span className={styles.eyebrow}>VEDIC ASTROLOGY｜वैदिक ज्योतिष<br />吠陀占星｜外行星座之外的另一套生命地圖</span>
      <h1>先看見你的命盤，<br /><em>再開始理解自己。</em></h1>
      <p>吠陀占星不是只看太陽星座，而是從上升、月亮、九曜與星宿，看一個人的生命地圖。輸入生日後，你會先看到可驗證的紫微斗數命盤；吠陀占星真盤功能，將在下一階段加入。</p>
      <div className={styles.actions}><a className={styles.primary} href="#birth-input">輸入生日看命盤 <span>↘</span></a><a className={styles.secondary} href="#vedic-hook">先看吠陀跟西洋差在哪</a></div>
      <div className={styles.heroNote}><span>九曜 NAVAGRAHA</span><span>紫微十二宮</span><span>雙系統交叉判讀</span></div>
    </div><VedicDiagram /></section>

    <section className={`${styles.section} ${styles.birthSection}`} id="birth-input"><div>
      <Heading eyebrow="01 · START HERE" title="輸入出生資料，先看你的命盤。">第一版會先產生紫微斗數命盤。這一步只在你的瀏覽器中計算，不會儲存資料。</Heading>
      <p className={styles.truthNote}>目前以第一版前端命盤展示資料呈現；完整自動排盤規則仍會持續校正。</p>
    </div><form className={styles.birthForm} onSubmit={generate}>
      <label>出生年月日<input required type="date" /></label><label>出生時間<input required type="time" /></label><label>出生地點<input required placeholder="例如：台北市" /></label>
      <label>性別<select required defaultValue=""><option value="" disabled>請選擇</option><option>男</option><option>女</option><option>其他 / 不透露</option></select></label>
      <button type="submit">產生我的命盤 <span>→</span></button><small>命盤產生過程不會儲存你的資料。</small>
    </form></section>

    <section className={`${styles.section} ${styles.resultSection}`} id="ziwei-result"><Heading eyebrow="02 · YOUR FIRST CHART" title={generated ? "這是你的紫微斗數命盤。" : "你的紫微斗數命盤，會出現在這裡。"}>你原本可能只是想看吠陀占星，但紫微斗數可以先讓你看到一張更熟悉、也更容易驗證的生命地圖。</Heading>
      {generated ? <ZiWeiChart palaces={ziweiChart.palaces} /> : <div className={styles.lockedChart}><span>命</span><p>完成上方出生資料，就能開啟十二宮命盤。</p><a href="#birth-input">回到輸入資料 ↑</a></div>}
      <p className={styles.disclaimer}>第一版紫微斗數命盤由前端計算產生，僅供自我理解與後續諮詢參考。</p>
    </section>

    <section className={styles.section} id="vedic-hook"><Heading eyebrow="03 · VEDIC HOOK" title="為什麼吠陀占星不是只看太陽星座？">很多人第一次接觸吠陀占星，會驚訝於它跟西洋星座完全不是同一種觀看方式。它更重視上升、月亮、九曜、星宿與時間週期。</Heading>
      <div className={styles.threeGrid}>{[["निरयन राशि","它看的是恆星黃道","吠陀占星多使用恆星黃道，因此同一個人用西洋占星與吠陀占星排出來，星座位置可能不同。"],["चन्द्र｜लग्न｜ग्रह","它不只看太陽","吠陀占星會同時看月亮、上升與九曜。你不是只有一個太陽星座，而是一整套生命結構。"],["दशा","它重視時間週期","吠陀占星會看 Dasha 時期，理解一個人在不同生命階段被哪些力量推動。"]].map((x,i)=><article key={x[1]}><span>0{i+1}</span><b lang="sa">{x[0]}</b><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div>
      <p className={styles.disclaimer}>吠陀真盤計算功能開發中。此區目前提供九曜、天城文與系統差異教學，不作為個人化吠陀命盤結果。</p>
    </section>

    <section className={`${styles.section} ${styles.navagrahaSection}`}><Heading eyebrow="04 · NINE FORCES" title="九曜 Navagraha｜नवग्रह">吠陀占星裡的九種生命力量。Graha 不是單純的「行星」，更像會抓住注意力、牽動人生經驗的力量。</Heading>
      <p className={styles.nodeNote}>Rahu / Ketu 為月交點，也常被稱為影子行星，不是實體行星。</p><div className={styles.cardRail}>{navagraha.map(g=><article className={styles.grahaCard} key={g[1]}><span className={styles.glyph}>{g[0]}</span><div><small>{g[2]}</small><h3>{g[1]}</h3></div><b lang="sa">{g[3]}</b><em>空耳 · {g[4]}</em><strong>{g[5]}</strong><p>{g[6]}</p></article>)}</div>
    </section>

    <section className={`${styles.section} ${styles.compare}`}><Heading eyebrow="05 · TWO COORDINATES" title="為什麼你熟悉的星座，可能不是吠陀占星裡的你？">兩套系統使用不同座標，也從不同入口理解一個人。</Heading><div className={styles.compareGrid}><article><span>WESTERN</span><h3>西洋占星</h3><ul><li>常見入口是太陽星座</li><li>多使用熱帶黃道</li><li>大眾常用「我是什麼星座」理解自己</li><li>現代心理占星語言較普及</li></ul></article><article><span>VEDIC</span><h3>吠陀占星</h3><ul><li>更重視上升、月亮與九曜</li><li>多使用恆星黃道</li><li>會看 Nakshatra 星宿與 Dasha 時期</li><li>更像一套時間、業力與生命階段的判讀系統</li></ul></article></div><blockquote>所以你在西洋占星裡是天蠍，不代表你在吠陀占星裡一定還是同一個位置。這不是誰對誰錯，而是兩套系統的座標不同。</blockquote></section>

    <section className={styles.section}><Heading eyebrow="06 · DUAL SYSTEM METHOD" title="一張盤看結構，兩套系統看交集。">紫微斗數讓你看見宮位、人生場域與事件節奏；吠陀占星讓你看見九曜、星宿與時間週期。兩套系統不是混在一起講，而是用來互相驗證。</Heading><div className={styles.methodGrid}>{methodSteps.map(x=><article key={x[0]}><span>{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div></section>

    <section className={styles.section}><Heading eyebrow="07 · RELATIONSHIP FRAMEWORK" title="親密關係結構與吸引模式整理框架">這份框架不是用來判定一個人的性傾向，而是觀察：一個人在親密關係裡，容易被什麼樣的模式牽動、困住，或反覆選擇。</Heading><div className={styles.frameworkGrid}>{frameworks.map(x=><article key={x[0]}><b>{x[0]}</b><div><h3>{x[1]}</h3><p>{x[2]}</p></div></article>)}</div></section>

    <section className={`${styles.section} ${styles.service}`}><Heading eyebrow="08 · GO DEEPER" title="看見命盤之後，下一步是看懂它。">免費命盤讓你先看見自己的生命地圖；深度解析則是把星曜、宮位、九曜與關係模式整理成你真的聽得懂的語言。</Heading><div className={styles.serviceGrid}>{services.map((x,i)=><article key={x[0]}><span>0{i+1}</span><h3>{x[0]}</h3><p>{x[1]}</p></article>)}</div><a className={styles.primary} href="#intake">申請 Gavin 深度解析 <span>→</span></a></section>

    <section className={`${styles.section} ${styles.intake}`} id="intake"><Heading eyebrow="09 · INTAKE" title="申請 Gavin 深度解析">如果你已經看到命盤，但還不知道怎麼解讀，可以留下資料，我會用紫微斗數與吠陀占星的雙系統視角，幫你整理下一層脈絡。</Heading><form className={styles.intakeForm} onSubmit={e=>e.preventDefault()}><label>稱呼 / 暱稱<input required /></label><label>聯絡方式 Email 或 IG<input required /></label><label>出生年月日<input type="date" required /></label><label>出生時間<input type="time" required /></label><label>出生地點<input required /></label><label>想解析的主題<input required placeholder="例如：關係、工作、人生方向" /></label><label>目前關係狀態<select><option>單身</option><option>曖昧中</option><option>穩定關係中</option><option>分手後整理</option><option>關係混亂中</option><option>不想透露</option></select></label><label>想以哪個系統為主<select><option>紫微斗數</option><option>吠陀占星</option><option>雙系統交叉判讀</option><option>不確定，請 Gavin 判斷</option></select></label><label className={styles.consent}><input type="checkbox" required /><span>我同意將以上資料用於本次分析聯繫。</span></label><button type="submit">送出深度解析申請 <span>→</span></button><p>你填寫的資料只會用於 Gavin 進行命盤與關係模式分析，不會公開或外流。</p></form></section>

    <footer><b>Gavin｜Chart Navigator</b><span>先看見命盤，再開始理解自己。</span><a href="#top">回到頂端 ↑</a></footer>
  </main>;
}
