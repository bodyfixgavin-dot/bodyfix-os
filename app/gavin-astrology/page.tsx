import type { Metadata } from "next";
import ziweiChart from "@/data/gavin-ziwei-chart.json";
import vedicChart from "@/data/gavin-vedic-chart.json";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Gavin｜紫微斗數 × 吠陀占星關係解析",
  description: "傳統命盤展示、雙系統交叉判讀與親密關係模式整理的網站原型。"
};

type ZiWeiPalace = (typeof ziweiChart.palaces)[number];
type VedicHouse = (typeof vedicChart.charts.D1)[number];

const methodSteps = [
  ["01", "定主題", "先確認這次要整理的是人格、關係、情感模式，還是某一段具體關係。"],
  ["02", "排出傳統命盤", "紫微斗數看宮位、星曜、四化；吠陀占星看 Graha、House、Nakshatra 與節點。"],
  ["03", "紫微斗數判讀", "從命宮、身宮、夫妻宮、福德宮、大限流年，整理人格骨架與關係慣性。"],
  ["04", "吠陀占星判讀", "從 Lagna、Moon、Venus、Rahu / Ketu、7th / 8th / 12th House，整理吸引模式與深層動機。"],
  ["05", "交叉比對", "當兩套系統指向相同主題時，判讀才更有重量；若兩套系統矛盾，則標記為需要更多現實資料確認。"],
  ["06", "現代轉譯", "把古典命理語言轉成能理解、能選擇、能行動的關係建議。"]
];

const frameworkModules = [
  {
    code: "A",
    title: "關係腳本彈性",
    axis: "你是否容易跳脫傳統關係模板",
    ziwei: "夫妻宮、福德宮、四化、煞星結構",
    vedic: "7th House、7th Lord、Rahu / Ketu"
  },
  {
    code: "B",
    title: "吸引模式流動性",
    axis: "你容易被什麼樣的人、氣質或狀態吸引",
    ziwei: "夫妻宮、貪狼、太陽、福德宮",
    vedic: "Venus、Moon、5th House、Nakshatra"
  },
  {
    code: "C",
    title: "情感需求落差",
    axis: "你內在真正想要的，和你表面選擇的是否一致",
    ziwei: "福德宮、命宮、夫妻宮互動",
    vedic: "Moon、4th House、8th House"
  },
  {
    code: "D",
    title: "關係角色彈性",
    axis: "你在關係裡是否容易不服從固定角色",
    ziwei: "命宮主星、中性星曜、夫妻宮結構",
    vedic: "Mercury、Venus、Mars、Sun 的互動"
  },
  {
    code: "E",
    title: "隱密關係壓力",
    axis: "你是否容易進入不能明講、不能公開或難以定義的關係",
    ziwei: "化忌、空劫、福德宮、夫妻宮",
    vedic: "8th House、12th House、Venus、Moon"
  },
  {
    code: "F",
    title: "關係模式觸發器",
    axis: "哪些流年、星曜或宮位容易讓舊模式被啟動",
    ziwei: "大限、流年、四化觸發",
    vedic: "Dasha、Transit、Rahu / Ketu Return"
  }
];

const services = [
  ["關係模式解析", "適合一直暈同一種人、總是進入相似關係劇本、想知道自己為什麼會被某些人吸引的人。"],
  ["紫微 × 吠陀雙系統人格整理", "用兩套命理系統交叉比對人格結構、情緒慣性、選擇模式與人生節奏。"],
  ["曖昧與暈船狀態整理", "不是問對方愛不愛你，而是看這段關係對你來說是滋養、上癮，還是消耗。"],
  ["非主流關係腳本分析", "適合同性戀、雙性戀、流動關係、開放式關係、曖昧不明，或關係形式不容易被傳統模板定義的人。"]
];

function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.kicker}>Zi Wei Dou Shu × Vedic Astrology Relationship Reading</p>
        <h1>紫微斗數 × 吠陀占星<br />看懂你在關係裡，為什麼總是被同一種模式拉回去。</h1>
        <p>
          我用紫微斗數與吠陀占星，整理人格結構、情感慣性、吸引模式與親密關係裡反覆出現的選擇。不是替你預言會遇見誰，而是幫你看懂：你為什麼總是被某種人、某種關係、某種劇本拉回去。
        </p>
        <div className={styles.actions}>
          <a className={styles.primaryButton} href="#intake">申請命盤解析</a>
          <a className={styles.secondaryButton} href="#method">查看雙系統方法</a>
        </div>
      </div>
      <div className={styles.heroChart} aria-hidden="true">
        <div className={styles.orbit} />
        <div className={styles.chartGlyph}>命</div>
        <span>Gavin</span>
        <strong>傳統命盤不是拿來替人貼標籤，而是用來看懂一個人反覆選擇的模式。</strong>
      </div>
    </section>
  );
}

function SectionHeading({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div className={styles.sectionHeading}>
      <p className={styles.kicker}>{kicker}</p>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  );
}

const ziweiPositions = [
  [1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4],
  [4, 4], [4, 3], [4, 2], [4, 1], [3, 1], [2, 1]
];

const vedicPositions = [
  [50, 23], [26, 13], [13, 27], [25, 50], [13, 73], [26, 87],
  [50, 77], [74, 87], [87, 73], [75, 50], [87, 27], [74, 13]
];

function ShareHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className={styles.shareHeader}>
      <div><span className={styles.shareMonogram}>G</span><strong>Gavin Dual Astrology</strong></div>
      <div className={styles.shareTitle}><h3>{title}</h3><p>{subtitle}</p></div>
      <span className={styles.referenceBadge}>命盤展示版 · For reference only</span>
    </header>
  );
}

function ZiWeiChart({ palaces }: { palaces: ZiWeiPalace[] }) {
  return (
    <div className={styles.chartScroll} aria-label="紫微斗數十二宮命盤展示">
      <div className={`${styles.shareSheet} ${styles.ziweiSheet}`}>
        <ShareHeader title="Zi Wei Dou Shu Chart" subtitle="紫微斗數 · 十二宮格命盤" />
        <div className={styles.ziweiGrid}>
          {palaces.map((palace, index) => {
            const isLife = palace.name === "命宮";
            const isBody = palace.tags.includes("身宮同宮");
            return (
              <article
                className={`${styles.palaceCell} ${isLife ? styles.lifePalace : ""}`}
                key={`${palace.name}-${palace.branch}`}
                style={{ gridRow: ziweiPositions[index][0], gridColumn: ziweiPositions[index][1] }}
              >
                <div className={styles.cellTop}><strong>{palace.name}</strong><span>{palace.branch}</span></div>
                <p>{palace.mainStars.join("、") || "待補"}</p>
                <small>{palace.subStars.join("、") || "副星待補"}</small>
                <div className={styles.palaceMarks}>
                  {isLife ? <em>命宮</em> : null}{isBody ? <em>身宮</em> : null}
                  {palace.transformations.map((item) => <b key={item}>化{item}</b>)}
                </div>
              </article>
            );
          })}
          <div className={styles.ziweiCenter}>
            <span>紫微斗數</span>
            <strong>{ziweiChart.profile.name}</strong>
            <p>{ziweiChart.profile.birth}</p>
            <dl><div><dt>命宮</dt><dd>巳 · 天相</dd></div><div><dt>身宮</dt><dd>命宮同宮</dd></div></dl>
            <small>三合派 · 手動整理展示</small>
          </div>
        </div>
        <footer className={styles.shareFooter}><span>GAVIN DUAL ASTROLOGY</span><span>/gavin-astrology</span></footer>
      </div>
    </div>
  );
}

function VedicChart({ houses }: { houses: VedicHouse[] }) {
  return (
    <div className={styles.chartScroll} aria-label="吠陀占星 North Indian D1 命盤展示">
      <div className={`${styles.shareSheet} ${styles.vedicSheet}`}>
        <ShareHeader title="Vedic Astrology Chart" subtitle="North Indian Style · D1 Rāśi Chart" />
        <div className={styles.northChart}>
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <rect x="1" y="1" width="98" height="98" />
            <path d="M1 1 L99 99 M99 1 L1 99 M50 1 L99 50 L50 99 L1 50 Z" />
          </svg>
          {houses.map((house, index) => {
            const isNode = house.graha.some((item) => item === "Rahu" || item === "Ketu");
            return (
              <article
                className={`${styles.vedicHouse} ${isNode ? styles.nodeHouse : ""}`}
                key={house.house}
                style={{ left: `${vedicPositions[index][0]}%`, top: `${vedicPositions[index][1]}%` }}
              >
                <span>H{house.house}</span><strong>{house.sign}</strong>
                <p>{house.graha.length ? house.graha.join(" · ") : "—"}</p>
              </article>
            );
          })}
          <div className={styles.vedicCenterMark}><b>D1</b><span>RĀŚI</span></div>
        </div>
        <div className={styles.vedicLegend}>
          <span><b>Lagna</b> Libra · Chitra</span><span><b>Moon</b> Aquarius · Shatabhisha</span><span><b>Nodes</b> Rahu H3 ↔ Ketu H7</span>
        </div>
        <footer className={styles.shareFooter}><span>GAVIN DUAL ASTROLOGY</span><span>/gavin-astrology</span></footer>
      </div>
    </div>
  );
}

function ChartGeneratorPreview() {
  return (
    <div className={styles.generatorBox}>
      <div><p className={styles.systemLabel}>YOUR CHART · PREVIEW</p><h3>先留下出生資料，未來即可生成你的雙系統命盤。</h3><p>目前按鈕為 UI 預留；本頁展示使用 Gavin 的手動整理示範資料，並非完整自動排盤結果。</p></div>
      <form className={styles.generatorForm}>
        <label>出生年月日<input type="date" name="chartBirthDate" /></label>
        <label>出生時間<input type="time" name="chartBirthTime" /></label>
        <label>出生地點<input type="text" name="chartBirthPlace" placeholder="城市、國家" /></label>
        <button type="button" className={styles.primaryButton}>生成雙系統命盤</button>
      </form>
    </div>
  );
}

function InsightCards({ type }: { type: "ziwei" | "vedic" }) {
  const items = type === "ziwei" ? [
    ["命宮主星", "天相坐命", "重視平衡、角色與互動秩序。"],
    ["身宮位置", "身宮同命宮", "外在行動與人格核心較為一致。"],
    ["夫妻宮重點", "廉貞 · 七殺 · 化忌", "關係張力與界線是重要觀察題。"],
    ["福德宮重點", "貪狼 · 天空", "慾望結構與情感慣性值得深讀。"]
  ] : [
    ["Lagna", "Libra · Chitra", "關係感與美感是人格入口。"],
    ["Moon", "Aquarius · Shatabhisha", "情緒需要空間與觀察距離。"],
    ["Venus", "Scorpio · H2", "價值、親密與表達彼此牽動。"],
    ["Rahu / Ketu", "H3 ↔ H7 Axis", "月交點／影子行星，非實體行星。"],
    ["D1 Chart Note", "Rāśi · Whole Sign", "本命盤展示版，資料仍待天文校正。"]
  ];
  return <div className={styles.insightGrid}>{items.map(([label, title, copy]) => <article key={label}><span>{label}</span><strong>{title}</strong><p>{copy}</p></article>)}</div>;
}

function TraditionalChartSection() {
  return (
    <section className={styles.section} id="charts">
      <SectionHeading kicker="Traditional Chart · Visualized" title="先看見命盤，再開始理解自己。">
        兩張命盤皆以「可讀、可截圖、可分享」設計：保留傳統結構辨識度，也讓第一次接觸命理的人知道下一步該看哪裡。
      </SectionHeading>
      <ChartGeneratorPreview />
      <p className={styles.modelNotice}>以下為 Gavin 示範命盤。資料來自手動整理 JSON，尚非完整自動排盤或天文計算引擎。</p>
      <div className={styles.chartPanels}>
        <article className={styles.chartPanel}>
          <div className={styles.panelHeader}><div><span>紫微斗數 · 12 PALACES</span><h3>十二宮格與中央命盤資料區</h3></div><small>{ziweiChart.settings.note}</small></div>
          <ZiWeiChart palaces={ziweiChart.palaces} />
          <InsightCards type="ziwei" />
        </article>
        <article className={styles.chartPanel}>
          <div className={styles.panelHeader}><div><span>VEDIC ASTROLOGY · D1</span><h3>North Indian 菱形本命盤</h3></div><small>{vedicChart.settings.note}</small></div>
          <VedicChart houses={vedicChart.charts.D1} />
          <p className={styles.nodeNote}>Rahu / Ketu 已明確標示為月交點／影子行星，非實體行星。Nakshatra 摘要置於命盤下方資訊卡。</p>
          <InsightCards type="vedic" />
        </article>
      </div>
      <div className={styles.chartCta}><div><span>看見命盤，卻不知道它正在說什麼？</span><strong>下一步，用雙系統交叉比對，把符號轉成可理解的關係模式。</strong></div><a className={styles.primaryButton} href="#method">往下看 Gavin 的方法</a></div>
    </section>
  );
}

function MethodSection() {
  return (
    <section className={styles.section} id="method">
      <SectionHeading kicker="Dual Method" title="兩套系統，一個人。不是混在一起講，而是交叉驗證。" />
      <div className={styles.methodGrid}>
        {methodSteps.map(([number, title, copy]) => (
          <article className={styles.methodCard} key={number}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RelationshipFrameworkSection() {
  return (
    <section className={styles.section} id="framework">
      <SectionHeading kicker="Relationship Framework" title="親密關係結構與吸引模式整理框架">
        這份框架不是用來判定一個人的性傾向，而是觀察：一個人在親密關係裡，容易被什麼樣的模式牽動、困住，或反覆選擇。
      </SectionHeading>
      <div className={styles.frameworkGrid}>
        {frameworkModules.map((item) => (
          <article className={styles.frameworkCard} key={item.code}>
            <span>{item.code}</span>
            <h3>{item.title}</h3>
            <p><strong>觀察主軸：</strong>{item.axis}</p>
            <p><strong>紫微對應：</strong>{item.ziwei}</p>
            <p><strong>吠陀對應：</strong>{item.vedic}</p>
          </article>
        ))}
      </div>
      <p className={styles.weightNotice}>每個模組以低、中、高權重觀察，不做單一標籤判定，而是整理整體關係模式。</p>
      <div className={styles.ethicsBox}>
        <h3>使用底線</h3>
        <ol>
          <li>本框架不得用於判定個人性傾向、性別認同或人格價值。</li>
          <li>本框架僅用於分析親密關係結構、情感表達樣態與關係模式。</li>
          <li>單一星曜、單一宮位、單一指標不得獨立下結論。</li>
          <li>命盤只能提供象徵性傾向，不可取代當事人的自我認同與真實經驗。</li>
          <li>若議題涉及心理創傷、暴力、重大身心危機，應優先尋求專業協助。</li>
        </ol>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section className={styles.section} id="services">
      <SectionHeading kicker="Services" title="你可以申請的解析方向" />
      <div className={styles.servicesGrid}>
        {services.map(([title, copy], index) => (
          <article className={styles.serviceCard} key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function EssaySection() {
  return (
    <section className={styles.essaySection} id="essay">
      <SectionHeading kicker="Essay" title="我為什麼不說「你是什麼人」，而說「你的關係模式怎麼運作」" />
      <div className={styles.essayBody}>
        <p>如果我看著一張盤，直接替你貼上一個身份標籤，那不是高級的命理判讀，而是一種危險的簡化。</p>
        <p>命盤可以看出傾向、結構、慣性與觸發點。它可以幫我們理解：一個人為什麼容易被某種關係吸引，為什麼在親密關係裡反覆進入相似劇本，為什麼明明想穩定，卻又被不穩定的人牽動。</p>
        <p>但命盤不能取代一個人的自我認同。</p>
        <p>所以我做的不是「你是什麼人」的判決，而是「你的關係模式怎麼運作」的整理。這兩者差很多。前者容易貼標籤，後者才有機會帶來理解、選擇與行動。</p>
        <p>我相信好的命理，不是讓人更害怕命運，而是讓人終於看懂自己為什麼一直在同一個地方跌倒。</p>
      </div>
    </section>
  );
}

function IntakeFormSection() {
  return (
    <section className={styles.section} id="intake">
      <SectionHeading kicker="Intake Form" title="申請我的命盤解析">
        表單先設計成可改接 Tally、Google Form、Netlify Forms 或 Formspree 的結構；目前不使用 mailto 作為正式送出方式。
      </SectionHeading>
      <form className={styles.intakeForm} data-form-provider="placeholder" aria-label="命盤解析申請表單">
        <label>稱呼 / 暱稱<input name="name" type="text" placeholder="請填寫你希望 Gavin 怎麼稱呼你" /></label>
        <label>聯絡方式 Email 或 IG<input name="contact" type="text" placeholder="Email 或 Instagram 帳號" /></label>
        <label>出生年月日<input name="birthDate" type="date" /></label>
        <label>出生時間<input name="birthTime" type="time" /></label>
        <label>出生地點<input name="birthplace" type="text" placeholder="城市、國家，例如：新北市，台灣" /></label>
        <label className={styles.fullField}>目前想整理的主題<textarea name="topic" placeholder="人格、關係、曖昧、分手後整理，或某段具體關係" /></label>
        <label>目前關係狀態<select name="relationshipStatus" defaultValue=""><option value="" disabled>請選擇</option><option>單身</option><option>曖昧中</option><option>穩定關係中</option><option>分手後整理</option><option>關係混亂中</option><option>不想透露</option></select></label>
        <label>想以哪個系統為主<select name="systemPreference" defaultValue=""><option value="" disabled>請選擇</option><option>紫微斗數</option><option>吠陀占星</option><option>雙系統交叉判讀</option><option>不確定，請 Gavin 判斷</option></select></label>
        <label className={styles.consent}><input name="privacyConsent" type="checkbox" />我了解本表單資料僅供 Gavin 進行命盤與關係模式分析使用，不會公開或外流。</label>
        <button type="button" className={styles.primaryButton}>申請我的命盤解析</button>
      </form>
    </section>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <strong>Gavin｜紫微斗數 × 吠陀占星關係解析</strong>
      <p>不是算你會愛上誰，而是看懂你為什麼一直被某種人吸走。</p>
    </footer>
  );
}

export default function GavinAstrologyPage() {
  return (
    <main className={styles.pageShell}>
      <nav className={styles.nav} aria-label="頁面導覽">
        <a className={styles.brand} href="#top"><span>G</span>Gavin Astrology</a>
        <div>
          <a href="#charts">命盤展示</a>
          <a href="#method">雙系統方法</a>
          <a href="#framework">關係框架</a>
          <a href="#intake">申請表單</a>
        </div>
      </nav>
      <div id="top" className={styles.shell}>
        <HeroSection />
        <TraditionalChartSection />
        <MethodSection />
        <RelationshipFrameworkSection />
        <ServicesSection />
        <EssaySection />
        <IntakeFormSection />
        <Footer />
      </div>
    </main>
  );
}
