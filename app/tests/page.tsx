import Link from "next/link";

const tools = [
  {
    category: "SPACE / PLANT / CRYSTAL",
    title: "空間6月｜Space Guide",
    description: "測你的房型、玄關、床位、書桌與 2026 九宮飛星，看看今年適合你的植物、水晶與空間配置方向。",
    label: "開始測空間",
    href: "/space-june",
    status: "Beta",
    featured: true,
  },
  {
    category: "RELATIONSHIP RADAR",
    title: "海王雷達",
    description: "快速檢查一段關係裡的曖昧、迴避、消失、話術與高風險互動訊號。",
    label: "開始檢測",
    href: "/tarot/sea-king-radar",
    status: "Tool",
  },
  {
    category: "RELATIONSHIP DECISION SYSTEM",
    title: "SADM 關係決策整理",
    description: "用七個分數整理一段關係的價值、成本與停損點，幫你看清現在，不替你做決定。",
    label: "開始整理",
    href: "/tarot/sadm",
    status: "Tool",
  },
  {
    category: "DESTINY / ZI WEI",
    title: "紫微命盤主題測驗",
    description: "先不急著排完整命盤。從你現在最想問的問題，看它比較靠近關係、工作、財務、遷移，還是福德主題。",
    label: "Planned",
    status: "Planned",
  },
  {
    category: "DESTINY / NAVAGRAHA",
    title: "吠陀九曜狀態測驗",
    description: "Navagraha｜नवग्रह。從近期生活狀態，看看你現在比較像哪一顆 Graha 的能量與慣性。",
    label: "Planned",
    status: "Planned",
  },
  {
    category: "DESTINY / RAHU & KETU",
    title: "羅睺計都慣性測驗",
    description: "你最近是 Rahu 上頭，還是 Ketu 斷線？整理自己正在執著、上癮，或抽離、切斷的地方。",
    label: "Coming Soon",
    status: "Coming Soon",
  },
  {
    category: "BODY / TENSION",
    title: "身體張力型測驗",
    description: "測你現在比較像久坐型、壓力型、訓練恢復型，還是骨盆核心代償型。",
    label: "Coming Soon",
    status: "Coming Soon",
  },
];

export default function TestsPage() {
  return (
    <main className="tests-page">
      <div className="tests-shell">
        <nav className="tests-nav" aria-label="測驗工具頁面導覽">
          <Link className="portal-wordmark" href="/" aria-label="回 BodyFix OS">
            <span>BF</span>
            <strong>BodyFix OS</strong>
          </Link>
          <div>
            <Link href="/">回 BodyFix OS</Link>
            <Link href="/space-june">前往 Space Guide</Link>
          </div>
        </nav>

        <header className="tests-hero">
          <p className="portal-kicker">Gavin Lab · Public Tools</p>
          <h1>今天想測什麼？</h1>
          <p>身體、關係、空間、命盤。有些答案不用急著問人，先測一下自己在哪裡。</p>
          <strong>先玩測驗，不一定要預約。</strong>
        </header>

        <section className="tests-section" aria-labelledby="tests-list-title">
          <div className="tests-heading">
            <div>
              <p className="portal-kicker">Pick a small experiment</p>
              <h2 id="tests-list-title">你可能只是想知道，自己現在卡在哪。</h2>
            </div>
            <p>這裡是 Gavin Lab 的測驗入口大廳。從空間、關係、身體或命盤，挑一個現在最有感覺的開始就好。</p>
          </div>

          <div className="tests-grid">
            {tools.map((tool) => (
              <article className={`tests-card${tool.featured ? " tests-card-featured" : ""}`} key={tool.title}>
                <div className="tests-card-topline">
                  <span>{tool.category}</span>
                  <em>{tool.status}</em>
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                {tool.href ? (
                  <Link className="tests-button" href={tool.href}>{tool.label}<span aria-hidden="true">→</span></Link>
                ) : (
                  <span className="tests-button tests-button-disabled" aria-disabled="true">{tool.label}</span>
                )}
              </article>
            ))}
          </div>
        </section>

        <footer className="tests-footer">
          <p>不一定要準備好，也不用先理解所有方法。</p>
          <Link className="tests-home-button" href="/">回 BodyFix OS 首頁</Link>
        </footer>
      </div>
    </main>
  );
}
