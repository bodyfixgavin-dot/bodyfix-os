"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./SadmPage.module.css";

type ElementKey = "emv" | "lv" | "av" | "cc" | "tc" | "oc" | "sc";

type SadmElement = {
  key: ElementKey;
  label: string;
  group: "value" | "cost";
  title: string;
  question: string;
  lowLabel: string;
  highLabel: string;
};

const sadmElements: SadmElement[] = [
  {
    key: "emv",
    label: "EMV",
    group: "value",
    title: "情感收益",
    question: "這段關係讓我感到被愛、被理解嗎？",
    lowLabel: "很少被接住",
    highLabel: "很常被滋養"
  },
  {
    key: "lv",
    label: "LV",
    group: "value",
    title: "生活價值",
    question: "這段關係讓我的生活更穩，還是更亂？",
    lowLabel: "生活更混亂",
    highLabel: "生活更穩定"
  },
  {
    key: "av",
    label: "AV",
    group: "value",
    title: "吸引力價值",
    question: "我是真喜歡，還是被刺激感綁住？",
    lowLabel: "只是被拉扯",
    highLabel: "真實被吸引"
  },
  {
    key: "cc",
    label: "CC",
    group: "cost",
    title: "溝通成本",
    question: "我需要花多少力氣解釋、討好、修復？",
    lowLabel: "幾乎不費力",
    highLabel: "非常耗力"
  },
  {
    key: "tc",
    label: "TC",
    group: "cost",
    title: "時間成本",
    question: "我花多少時間等待、猜測、反覆確認？",
    lowLabel: "很少等待猜測",
    highLabel: "大量被佔據"
  },
  {
    key: "oc",
    label: "OC",
    group: "cost",
    title: "機會成本",
    question: "我因此錯過了哪些更好的可能？",
    lowLabel: "幾乎沒錯過",
    highLabel: "錯過很多可能"
  },
  {
    key: "sc",
    label: "SC",
    group: "cost",
    title: "自我成本",
    question: "這段關係對我的自尊與情緒健康造成多少消耗？",
    lowLabel: "仍保有自己",
    highLabel: "嚴重自我懷疑"
  }
];

const initialScores: Record<ElementKey, number> = {
  emv: 6,
  lv: 5,
  av: 7,
  cc: 5,
  tc: 6,
  oc: 4,
  sc: 6
};

function getResult(svs: number) {
  if (svs >= 1.5) {
    return {
      tone: "continue",
      title: "回報明顯高於成本，可以繼續投入",
      short: "這段關係目前給你的滋養與價值明顯高於你付出的成本。",
      action: "可以繼續投入，但不要只看感覺，也要持續觀察對方是否用穩定行動承擔關係。"
    };
  }

  if (svs >= 1.0) {
    return {
      tone: "adjust",
      title: "略高於成本，建議修正互動方式",
      short: "這段關係仍有價值，但成本已經開始靠近你得到的回報。",
      action: "先不要盲目加碼，建議把需求說清楚、設定觀察期，看看互動方式能不能被一起修正。"
    };
  }

  if (svs >= 0.7) {
    return {
      tone: "limit",
      title: "成本偏高，降低投入並設定停損",
      short: "這段關係目前不是完全沒有價值，但你付出的成本已經接近，甚至開始超過你得到的回報。",
      action: "最重要的不是立刻做結論，而是先降低投入，觀察對方是否也願意一起承擔關係成本。"
    };
  }

  return {
    tone: "pause",
    title: "高消耗低回報，建議暫停或離場",
    short: "這段關係正在用很高的成本換取很低的回報。你可能還喜歡他，但你也正在被等待、猜測、修復與自我懷疑消耗。",
    action: "先暫停投入，把時間、注意力與生活支撐收回來。不要再用更多成本證明自己值得被愛。"
  };
}

export default function SadmTarotPage() {
  const [subject, setSubject] = useState("某個放不下的人");
  const [scores, setScores] = useState<Record<ElementKey, number>>(initialScores);

  const valueScore = scores.emv + scores.lv + scores.av;
  const costScore = scores.cc + scores.tc + scores.oc + scores.sc;
  const svs = useMemo(() => valueScore / Math.max(costScore, 1), [valueScore, costScore]);
  const result = getResult(svs);

  function updateScore(key: ElementKey, value: string) {
    setScores((current) => ({ ...current, [key]: Number(value) }));
  }

  return (
    <main className={styles.pageShell}>
      <nav className={styles.nav} aria-label="SADM 頁面導覽">
        <Link className={styles.brand} href="/tarot/sadm" aria-label="BF Tarot SADM 首頁">
          <span className={styles.brandMark}>BF</span>
          <span>BF Tarot · SADM</span>
        </Link>
        <div className={styles.navLinks}>
          <a href="#system">系統說明</a>
          <a href="#elements">七個元素</a>
          <a href="#test">開始測驗</a>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Relationship Decision Mapping System</p>
          <h1>你不是放不下他，<br />你是還沒看清這段關係的成本。</h1>
          <p className={styles.heroSubtitle}>
            SADM 關係決策整理系統，透過 7 個關係元素、7 張塔羅牌與一個 SVS 分數，
            幫你看見這段關係到底是滋養你，還是在消耗你。
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#test">開始整理這段關係</a>
            <a className={styles.secondaryButton} href="#system">了解 SADM 怎麼運作</a>
          </div>
        </div>
        <aside className={styles.heroPanel} aria-label="SADM 核心定位">
          <p>不是問他愛不愛你，而是看這段關係值不值得你繼續投入。</p>
          <strong>7 個元素、7 張牌、7 個分數，一個 SVS 結果。</strong>
          <span>塔羅負責看見狀態，公式負責整理價值與成本，最後由你做出選擇。</span>
        </aside>
      </section>

      <section className={styles.sectionGrid} id="system">
        <div>
          <p className={styles.sectionKicker}>What SADM does</p>
          <h2>SADM 不是算命，也不是替你決定要不要分開。</h2>
        </div>
        <div className={styles.explainCard}>
          <p>
            它是一套關係決策整理工具。塔羅牌負責幫你看見每個面向的狀態；
            分數負責幫你整理價值與成本；最後的選擇，仍然回到你自己手上。
          </p>
          <p>
            第一版不需要登入、不接資料庫、不保存個資。你只需要輸入一個代稱，
            依照 7 個元素打分數，就能即時計算出 SVS 結果。
          </p>
        </div>
      </section>

      <section className={styles.section} id="elements">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>Seven elements</p>
          <h2>七個元素：三個價值面，四個成本面。</h2>
        </div>
        <div className={styles.elementGrid}>
          {sadmElements.map((element) => (
            <article className={styles.elementCard} key={element.key}>
              <div className={styles.elementTopline}>
                <span className={element.group === "value" ? styles.valueBadge : styles.costBadge}>{element.label}</span>
                <small>{element.group === "value" ? "價值面" : "成本面"}</small>
              </div>
              <h3>{element.title}</h3>
              <p>{element.question}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.formulaSection}>
        <div>
          <p className={styles.sectionKicker}>SVS Formula</p>
          <h2>SVS =（EMV + LV + AV）÷（CC + TC + OC + SC）</h2>
        </div>
        <div className={styles.formulaCopy}>
          <p>上面是這段關係給你的價值，下面是你為這段關係付出的成本。</p>
          <ul>
            <li>如果價值遠高於成本，這段關係值得繼續投入。</li>
            <li>如果成本快要吃掉價值，你就需要重新調整互動方式。</li>
            <li>如果成本明顯大於價值，你可能不是在愛，而是在消耗。</li>
          </ul>
        </div>
      </section>

      <section className={styles.testSection} id="test">
        <div className={styles.testIntro}>
          <p className={styles.sectionKicker}>Interactive test</p>
          <h2>用 3 分鐘整理這段關係。</h2>
          <p>請用直覺打分數。1 代表非常低，10 代表非常高；成本面分數越高，代表消耗越大。</p>
        </div>

        <div className={styles.testLayout}>
          <form className={styles.scoreCard}>
            <label className={styles.subjectLabel}>
              Step 1｜輸入關係對象代稱
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="曖昧對象、前任、交往中的人、某個放不下的人"
              />
              <span>不用輸入真名，保護隱私。</span>
            </label>

            <div className={styles.sliderGroup}>
              <h3>Step 2｜七個元素打分數</h3>
              {sadmElements.map((element) => (
                <label className={styles.sliderRow} key={element.key}>
                  <span className={styles.sliderHeader}>
                    <span><strong>{element.label}</strong> {element.title}</span>
                    <b>{scores[element.key]}</b>
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={scores[element.key]}
                    onChange={(event) => updateScore(element.key, event.target.value)}
                  />
                  <span className={styles.sliderHints}>
                    <small>{element.lowLabel}</small>
                    <small>{element.highLabel}</small>
                  </span>
                </label>
              ))}
            </div>
          </form>

          <aside className={styles.resultCard} aria-live="polite">
            <p className={styles.sectionKicker}>Step 3｜產生 SVS 結果</p>
            <div className={styles.scoreCircle}>
              <span>SVS</span>
              <strong>{svs.toFixed(2)}</strong>
            </div>
            <div className={styles.scoreBreakdown}>
              <span>價值總分：{valueScore}</span>
              <span>成本總分：{costScore}</span>
            </div>
            <div className={`${styles.resultBox} ${styles[result.tone]}`}>
              <h3>{result.title}</h3>
              <p>
                你正在整理的對象是「{subject || "這段關係"}」。你的 SVS 分數是 {svs.toFixed(2)}。
                {result.short}
              </p>
              <p>{result.action}</p>
            </div>
            <div className={styles.resultTable}>
              <div><strong>≥ 1.5</strong><span>回報明顯高於成本</span></div>
              <div><strong>1.0–1.49</strong><span>略高於成本，修正互動</span></div>
              <div><strong>0.7–0.99</strong><span>成本偏高，設定停損</span></div>
              <div><strong>&lt; 0.7</strong><span>高消耗低回報</span></div>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div>
          <p className={styles.sectionKicker}>BF Tarot relationship reading</p>
          <h2>如果你想更深入看清這段關係，可以預約 BF Tarot 關係狀態整理。</h2>
          <p>不是替你決定未來，而是幫你看清現在。</p>
        </div>
        <div className={styles.ctaActions}>
          <a className={styles.primaryButton} href="https://line.me/R/ti/p/@359gzxzi" target="_blank" rel="noreferrer">
            預約關係狀態整理
          </a>
          <a className={styles.secondaryButton} href="https://www.instagram.com/bodyfixgavin/" target="_blank" rel="noreferrer">
            私訊 Gavin 看這段關係
          </a>
        </div>
      </section>

      <p className={styles.disclaimer}>
        本工具為自我覺察與決策輔助，不是醫療、心理治療、法律或安全風險評估。若關係涉及暴力、威脅、跟蹤、勒索或人身安全疑慮，請優先尋求可信任的人與專業協助。
      </p>
    </main>
  );
}
