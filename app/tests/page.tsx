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
    category: "BODY STATE CHECK",
    title: "身體狀態小測驗",
    description: "用幾個問題快速整理你現在比較像久坐型、壓力型、訓練恢復型，還是需要先放鬆呼吸與睡眠。",
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
          <p>有些人是來預約，有些人只是想先看看自己的狀態。這裡整理了 BodyFix / Gavin Lab 的互動測驗與小工具。</p>
          <strong>先玩測驗，不一定要預約。</strong>
        </header>

        <section className="tests-section" aria-labelledby="tests-list-title">
          <div className="tests-heading">
            <div>
              <p className="portal-kicker">Pick a small experiment</p>
              <h2 id="tests-list-title">你可能只是想知道，自己現在卡在哪。</h2>
            </div>
            <p>這裡是 Gavin Lab 的小工具入口。從空間、關係或身體狀態挑一個有感覺的開始就好。</p>
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
