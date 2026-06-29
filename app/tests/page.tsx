import Link from "next/link";

type Tool = { category: string; title: string; description: string; status: string; label: string; href?: string; featured?: boolean };
const sections: { title: string; tools: Tool[] }[] = [
  { title: "身體測驗", tools: [{ category: "BODY STATE CHECK", title: "你是哪一種硬撐型身體？", description: "久坐、壓力、訓練恢復、骨盆核心代償。5 題看你現在的身體，是哪裡正在默默硬撐。", status: "Tool", label: "開始測驗", href: "/tests/body-tension", featured: true }] },
  { title: "關係測驗", tools: [
    { category: "RELATIONSHIP RADAR", title: "海王雷達", description: "快速檢查一段關係裡的曖昧、迴避、消失、話術與高風險互動訊號。", status: "Tool", label: "開始檢測", href: "/tarot/sea-king-radar" },
    { category: "RELATIONSHIP DECISION SYSTEM", title: "SADM 關係決策整理", description: "用七個分數整理一段關係的價值、成本與停損點，幫你看清現在，不替你做決定。", status: "Tool", label: "開始整理", href: "/tarot/sadm" },
  ] },
  { title: "空間測驗", tools: [{ category: "SPACE / PLANT / CRYSTAL", title: "空間6月｜Space Guide", description: "測你的房型、玄關、床位、書桌與 2026 九宮飛星，看看今年適合你的植物、水晶與空間配置方向。", status: "Beta", label: "開始測空間", href: "/space-june" }] },
  { title: "命盤測驗", tools: [
    { category: "ZI WEI STRUCTURE", title: "紫微命盤主題測驗", description: "測你現在最想問的問題，比較偏向感情、工作、財務、人生方向，還是近期卡住的節奏。", status: "Planned", label: "Coming Soon" },
    { category: "VEDIC / NAVAGRAHA", title: "吠陀九曜狀態測驗", description: "測你最近比較像哪一種 Graha 狀態：太陽、月亮、火星、水星、木星、金星、土星、羅睺或計都。", status: "Planned", label: "Coming Soon" },
  ] },
];
export default function TestsPage() { return <main className="tests-page"><div className="tests-shell">
  <nav className="tests-nav"><Link className="portal-wordmark" href="/"><span>BF</span><strong>BodyFix OS</strong></Link><div><Link href="/">回 BodyFix OS</Link><Link href="/tests/body-tension">測身體張力</Link></div></nav>
  <header className="tests-hero"><p className="portal-kicker">BodyFix / Gavin Lab · Public Tools</p><h1>今天想測什麼？</h1><p>你可能不是想預約，只是想知道自己現在卡在哪。這裡整理了 BodyFix / Gavin Lab 的互動測驗與小工具。</p><strong>先玩測驗，不一定要預約。</strong></header>
  <section className="tests-section"><div className="tests-heading"><div><p className="portal-kicker">Pick a small experiment</p><h2>從現在最有感覺的地方開始。</h2></div><p>每一個工具都只是整理線索，不替你做醫療判定，也不急著替你下結論。</p></div>
  {sections.map(section => <section className="tests-category" key={section.title}><h2>{section.title}</h2><div className="tests-grid">{section.tools.map(tool => <article className={`tests-card${tool.featured ? " tests-card-featured" : ""}`} key={tool.title}><div className="tests-card-topline"><span>{tool.category}</span><em>{tool.status}</em></div><h3>{tool.title}</h3><p>{tool.description}</p>{tool.href ? <Link className="tests-button" href={tool.href}>{tool.label}<span>→</span></Link> : <span className="tests-button tests-button-disabled" aria-disabled="true">{tool.label}</span>}</article>)}</div></section>)}
  </section><footer className="tests-footer"><p>不一定要準備好，也不用先理解所有方法。</p><Link className="tests-home-button" href="/">回 BodyFix OS 首頁</Link></footer>
</div></main> }
