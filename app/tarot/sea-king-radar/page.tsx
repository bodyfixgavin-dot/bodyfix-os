"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  calculateRiskIndex,
  getRiskLevel,
  getTopRisks,
  getZodiac,
  hasRedFlag,
  initialScores,
  questions,
  type QuestionId,
  type SeaKingQuestion
} from "./logic";
import styles from "./SeaKingRadar.module.css";

type TrackingPayload = {
  user_zodiac: string | null;
  target_zodiac: string | null;
  risk_index: number;
  risk_level: string;
  top_risk_ids: QuestionId[];
  red_flag_triggered: boolean;
  clicked_sadm: boolean;
  clicked_tarot_booking: boolean;
  created_at: string;
};

const center = 150;
const maxRadius = 102;
const levels = [0.2, 0.4, 0.6, 0.8, 1];

function getPoint(index: number, total: number, value: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: center + Math.cos(angle) * maxRadius * value,
    y: center + Math.sin(angle) * maxRadius * value
  };
}

function pointsToString(points: { x: number; y: number }[]) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function RiskRadar({ scores }: { scores: Record<QuestionId, number> }) {
  const dataPoints = questions.map((question, index) => getPoint(index, questions.length, scores[question.id] / 10));

  return (
    <section className={styles.radarCard} aria-labelledby="radar-title">
      <div className={styles.sectionHeadingRow}>
        <div>
          <p className={styles.kicker}>Radar view</p>
          <h2 id="radar-title">海王風險雷達圖</h2>
          <p>你的分數分布</p>
        </div>
      </div>
      <div className={styles.radarWrap}>
        <svg viewBox="0 0 300 300" role="img" aria-label="八軸海王風險雷達圖">
          {levels.map((level) => (
            <polygon
              key={level}
              className={styles.radarGrid}
              points={pointsToString(questions.map((_, index) => getPoint(index, questions.length, level)))}
            />
          ))}
          {questions.map((question, index) => {
            const outer = getPoint(index, questions.length, 1);
            const label = getPoint(index, questions.length, 1.18);
            return (
              <g key={question.id}>
                <line className={styles.radarAxis} x1={center} y1={center} x2={outer.x} y2={outer.y} />
                <text className={styles.radarLabel} x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle">
                  {question.axisLabel}
                </text>
              </g>
            );
          })}
          <polygon className={styles.radarFill} points={pointsToString(dataPoints)} />
          <polygon className={styles.radarLine} points={pointsToString(dataPoints)} />
          {questions.map((question, index) => {
            const point = dataPoints[index];
            const score = scores[question.id];
            return (
              <circle key={question.id} className={styles.radarDot} cx={point.x} cy={point.y} r="5">
                <title>{`${question.riskLabel}｜${score} 分｜${question.scaleDescriptions[score]}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className={styles.radarLegend}>
          {questions.map((question) => {
            const score = scores[question.id];
            return (
              <div key={question.id} className={styles.legendItem}>
                <strong>{question.axisLabel}</strong>
                <span>{score} 分 · {question.riskLabel}</span>
                <small>{question.scaleDescriptions[score]}</small>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function QuestionCard({
  question,
  score,
  expanded,
  onToggle,
  onChange
}: {
  question: SeaKingQuestion;
  score: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (value: number) => void;
}) {
  return (
    <article className={styles.questionCard}>
      <div className={styles.questionTopline}>
        <span>{question.riskLabel}</span>
        <small>權重 {question.weight.toFixed(1)}</small>
      </div>
      <div className={styles.questionTitleRow}>
        <div>
          <h3>{question.title}</h3>
          <p>{question.question}</p>
        </div>
        <strong>{score}</strong>
      </div>
      <input
        aria-label={`${question.title} 1 到 10 分`}
        className={styles.slider}
        type="range"
        min="1"
        max="10"
        step="1"
        value={score}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className={styles.sliderMeta}>
        <span>1 低風險</span>
        <span>10 經常發生</span>
      </div>
      <div className={styles.currentDescription}>
        <span>目前 {score} 分</span>
        <p>{question.scaleDescriptions[score]}</p>
      </div>
      <button className={styles.textButton} type="button" onClick={onToggle}>
        {expanded ? "收合完整分數說明" : "查看完整分數說明"}
      </button>
      {expanded ? (
        <ol className={styles.scaleList}>
          {Object.entries(question.scaleDescriptions).map(([value, description]) => (
            <li key={value} className={Number(value) === score ? styles.activeScale : undefined}>
              <strong>{value}</strong>
              <span>{description}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </article>
  );
}

export default function SeaKingRadarPage() {
  const [scores, setScores] = useState<Record<QuestionId, number>>(initialScores);
  const [userBirthday, setUserBirthday] = useState("");
  const [targetBirthday, setTargetBirthday] = useState("");
  const [expandedDescriptions, setExpandedDescriptions] = useState<QuestionId[]>([]);
  const [anonymousConsent, setAnonymousConsent] = useState(false);
  const [clickedSadm, setClickedSadm] = useState(false);
  const [clickedTarotBooking, setClickedTarotBooking] = useState(false);

  const riskIndex = useMemo(() => calculateRiskIndex(scores), [scores]);
  const riskLevel = useMemo(() => getRiskLevel(riskIndex), [riskIndex]);
  const topRisks = useMemo(() => getTopRisks(scores), [scores]);
  const redFlagTriggered = useMemo(() => hasRedFlag(scores), [scores]);
  const userZodiac = useMemo(() => getZodiac(userBirthday), [userBirthday]);
  const targetZodiac = useMemo(() => getZodiac(targetBirthday), [targetBirthday]);
  const hasZodiac = Boolean(userZodiac || targetZodiac);

  const trackingPayload: TrackingPayload | null = anonymousConsent
    ? {
        user_zodiac: userZodiac,
        target_zodiac: targetZodiac,
        risk_index: riskIndex,
        risk_level: riskLevel.label,
        top_risk_ids: topRisks.map((question) => question.id),
        red_flag_triggered: redFlagTriggered,
        clicked_sadm: clickedSadm,
        clicked_tarot_booking: clickedTarotBooking,
        created_at: new Date().toISOString()
      }
    : null;

  function updateScore(id: QuestionId, value: number) {
    setScores((current) => ({ ...current, [id]: value }));
  }

  function toggleDescription(id: QuestionId) {
    setExpandedDescriptions((current) =>
      current.includes(id) ? current.filter((expandedId) => expandedId !== id) : [...current, id]
    );
  }

  return (
    <main className={styles.pageShell}>
      <nav className={styles.nav} aria-label="海王雷達頁面導覽">
        <Link className={styles.brand} href="/tarot/sea-king-radar">
          <span className={styles.brandMark}>BF</span>
          <span>BF Tarot · Sea King Radar</span>
        </Link>
        <div className={styles.navLinks}>
          <a href="#assessment">開始檢測</a>
          <a href="#result">查看結果</a>
          <Link href="/tarot/sadm">SADM</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>BF Tarot｜海王雷達 v2</p>
          <h1>關係風險檢測器</h1>
          <p className={styles.heroLead}>
            這不是幫你替對方定罪，也不是替你做決定。海王雷達用 8 題行為訊號，幫你看見關係中的模糊、消耗、操控、不確定性與高風險互動。
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#assessment">開始 8 題檢測</a>
            <Link className={styles.secondaryButton} href="/tarot/sadm">了解 SADM</Link>
          </div>
        </div>
        <aside className={styles.principleCard}>
          <strong>海王分數看行為，星座資料做導流。</strong>
          <p>生日與星座只用在結果頁個人化提示、BF Tarot 導流與未來匿名分眾分析，不會影響風險指數，也不會影響雷達圖。</p>
        </aside>
      </section>

      <section className={styles.startPanel} id="assessment">
        <div>
          <p className={styles.kicker}>Before you start</p>
          <h2>請依照你在這段關係裡的真實感受作答。</h2>
          <p>
            1 分代表幾乎沒有這種情況；10 分代表經常發生，而且明顯影響你的情緒與判斷。你可以選填生日，結果頁會提供星座互動提示；生日不會影響海王風險分數，只用來輔助理解互動模式。
          </p>
        </div>
        <div className={styles.birthdayGrid}>
          <label>
            你的生日，選填
            <input type="date" value={userBirthday} onChange={(event) => setUserBirthday(event.target.value)} />
            <span>{userZodiac ? `自動推算：${userZodiac}` : "年月日即可，不填也可以"}</span>
          </label>
          <label>
            他的生日，選填
            <input type="date" value={targetBirthday} onChange={(event) => setTargetBirthday(event.target.value)} />
            <span>{targetZodiac ? `自動推算：${targetZodiac}` : "若只填他的生日，結果只顯示他的星座"}</span>
          </label>
        </div>
      </section>

      <section className={styles.questionGrid} aria-label="海王雷達八題行為檢測">
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            score={scores[question.id]}
            expanded={expandedDescriptions.includes(question.id)}
            onToggle={() => toggleDescription(question.id)}
            onChange={(value) => updateScore(question.id, value)}
          />
        ))}
      </section>

      <section className={styles.resultSection} id="result">
        <div className={styles.scorePanel}>
          <p className={styles.kicker}>Risk index</p>
          <div className={styles.scoreValue}>{riskIndex} <span>/ 100</span></div>
          <div className={styles.meter} aria-label={`海王風險指數 ${riskIndex} 分`}>
            <span style={{ width: `${riskIndex}%` }} />
          </div>
          <div className={styles.levelBadge}>{riskLevel.label} · {riskLevel.range}</div>
          <p>{riskLevel.copy}</p>
        </div>

        <div className={styles.resultPanel}>
          <p className={styles.kicker}>Top risks</p>
          <h2>最高分的前三個風險項目</h2>
          <div className={styles.topRiskList}>
            {topRisks.map((question) => (
              <article key={question.id}>
                <span>{question.riskLabel}</span>
                <h3>{question.title}</h3>
                <strong>{scores[question.id]} 分</strong>
              </article>
            ))}
          </div>
          {redFlagTriggered ? (
            <div className={styles.redFlag}>
              <strong>高強度紅旗提醒</strong>
              <p>
                你有出現高強度紅旗訊號。即使總分不是最高，這類互動也很容易讓人懷疑自己、過度付出，或陷入反覆確認。請不要只看他甜的時候，也要看他讓你不安的時候。
              </p>
            </div>
          ) : null}
          <div className={styles.actionBox}>
            <span>建議行動</span>
            <p>{riskLevel.action}</p>
          </div>
        </div>
      </section>

      <RiskRadar scores={scores} />

      {hasZodiac ? (
        <section className={styles.zodiacCard}>
          <p className={styles.kicker}>Zodiac support</p>
          <h2>星座輔助解讀</h2>
          <div className={styles.zodiacPills}>
            {userZodiac ? <span>你的星座：{userZodiac}</span> : null}
            {targetZodiac ? <span>他的星座：{targetZodiac}</span> : null}
          </div>
          <p>
            星座只是互動傾向的參考，不代表一個人一定會怎麼做。真正需要被重視的，是你在這段關係裡實際感受到的模糊、消耗與不安。
          </p>
          {userZodiac && targetZodiac ? (
            <p>
              從你們的星座組合來看，這可以作為理解互動模式的參考。但這份測驗真正看重的，仍然是你在這段關係中實際經歷到的互動行為。從你的風險分布來看，目前最需要優先處理的是「{topRisks[0].title}」。與其急著判斷他是不是某種人，不如先確認：這段互動是否正在讓你反覆猜測、降低自我價值，或失去情緒穩定。
            </p>
          ) : null}
        </section>
      ) : null}

      <section className={styles.ctaGrid}>
        <article className={styles.ctaCard}>
          <p className={styles.kicker}>Next step</p>
          <h2>想知道這段關係還值不值得繼續投入？</h2>
          <p>
            海王雷達可以幫你看見風險訊號。如果你想進一步整理這段關係的價值、成本與停損點，可以使用 SADM 關係決策整理系統。
          </p>
          <Link className={styles.primaryButton} href="/tarot/sadm" onClick={() => setClickedSadm(true)}>
            使用 SADM 關係決策整理系統
          </Link>
        </article>
        <article className={styles.ctaCard}>
          <p className={styles.kicker}>BF Tarot</p>
          <h2>想更深入看這段關係的狀態？</h2>
          <p>如果你想結合塔羅、星座與關係狀態整理，我可以陪你一起看清楚目前最卡住的地方。</p>
          <Link className={styles.secondaryButton} href="/booking" onClick={() => setClickedTarotBooking(true)}>
            預約 BF Tarot 關係狀態整理
          </Link>
        </article>
      </section>

      <section className={styles.consentCard}>
        <label>
          <input
            type="checkbox"
            checked={anonymousConsent}
            onChange={(event) => setAnonymousConsent(event.target.checked)}
          />
          <span>我同意將本次測驗結果以匿名方式作為 BF Tarot 內容與服務優化參考。不會公開個人身份資料。</span>
        </label>
        <p>
          {trackingPayload
            ? "已預留匿名統計欄位；本版僅做前端狀態，不新增大型資料庫功能。"
            : "未勾選同意時，不會儲存可分析資料。"}
        </p>
      </section>
    </main>
  );
}
