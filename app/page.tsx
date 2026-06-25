import Link from "next/link";

type PortalCard = {
  title: string;
  eyebrow: string;
  description: string;
  tag: string;
  tone: "primary" | "lab" | "method" | "muted" | "owner";
  actions: { label: string; href: string; secondary?: boolean }[];
};

const flow = [
  ["SERVICE", "BodyFix 提供哪些身體整理服務"],
  ["BOOKING", "如何預約、填寫問卷與準備"],
  ["RECORDS", "服務後的紀錄、摘要與追蹤"],
  ["TOOLS", "後續使用的判讀、管理與學習工具"],
];

const entrances: PortalCard[] = [
  {
    title: "我想了解 / 預約 BodyFix",
    eyebrow: "第一次來，從這裡開始",
    description: "了解 BodyFix 的服務內容，或前往預約與填寫預約前問卷。",
    tag: "Public",
    tone: "primary",
    actions: [
      { label: "前往 Booking", href: "/booking" },
      { label: "填寫問卷", href: "/intake", secondary: true },
    ],
  },
  {
    title: "我是來做測驗的",
    eyebrow: "測驗工具入口",
    description: "身體、關係、空間與命盤的小工具入口。先玩測驗，不一定要預約。",
    tag: "Public",
    tone: "lab",
    actions: [
      { label: "前往測驗工具", href: "/tests" },
      { label: "測身體張力", href: "/tests/body-tension", secondary: true },
    ],
  },
  {
    title: "我想學 BodyFix",
    eyebrow: "從身體狀態整理入門",
    description: "了解 BodyFix 如何把運動按摩、筋膜鏈判讀、低痛感手法與服務流程整理成一套學習路線。",
    tag: "Method",
    tone: "method",
    actions: [{ label: "查看學習路線", href: "/method" }],
  },
  {
    title: "我是已服務客戶",
    eyebrow: "進展查看功能開發中",
    description: "未來可查看自己的服務摘要、居家建議與身體狀態進展。",
    tag: "Coming Soon",
    tone: "muted",
    actions: [{ label: "Client Portal Coming Soon", href: "/client" }],
  },
  {
    title: "我是課程學員",
    eyebrow: "教材與進度功能開發中",
    description: "給未來已報名 BodyFix 課程的學員使用，可查看教材、練習任務與課程進度。",
    tag: "Coming Soon",
    tone: "muted",
    actions: [{ label: "Learner Portal Coming Soon", href: "/learn" }],
  },
];

export default function HomePage() {
  return (
    <main className="portal-page">
      <div className="portal-shell">
        <nav className="portal-nav" aria-label="BodyFix OS navigation">
          <Link className="portal-wordmark" href="/" aria-label="BodyFix OS 首頁">
            <span>BF</span>
            <strong>BodyFix OS</strong>
          </Link>
          <Link className="portal-admin-link" href="/admin">Admin</Link>
        </nav>

        <section className="portal-hero" aria-labelledby="portal-title">
          <div className="portal-hero-copy">
            <p className="portal-kicker">BodyFix System Entrance</p>
            <h1 id="portal-title">BodyFix OS</h1>
            <p className="portal-lead">身體服務、預約管理、紀錄追蹤與工具系統入口</p>
            <p className="portal-intro">
              BodyFix OS 是 BodyFix 專屬服務管理系統，目前以內部運作、預約流程與未來學習入口為主。請依你的身份選擇要前往的功能。
            </p>
            <p className="portal-hero-hint">也可以先從測驗工具開始，看看自己的身體、關係或空間狀態。</p>
          </div>

          <div className="portal-flow" aria-label="BodyFix OS system flow">
            {flow.map(([title, description], index) => (
              <div className="portal-flow-step" key={title}>
                <span className="portal-flow-number">0{index + 1}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="portal-entrances" aria-labelledby="entrances-title">
          <header className="portal-section-heading">
            <div>
              <p className="portal-kicker">Choose your entrance</p>
              <h2 id="entrances-title">你今天想從哪裡開始？</h2>
            </div>
            <p>不需要先理解整套系統。選擇最接近你現在身份的入口，就可以開始。</p>
          </header>

          <div className="portal-card-grid">
            {entrances.map((entrance, index) => (
              <article className={`portal-card portal-card-${entrance.tone}`} key={entrance.title}>
                <div className="portal-card-topline">
                  <span className="portal-card-index">0{index + 1}</span>
                  <span className="portal-tag">{entrance.tag}</span>
                </div>
                <p className="portal-card-eyebrow">{entrance.eyebrow}</p>
                <h3>{entrance.title}</h3>
                <p className="portal-card-copy">{entrance.description}</p>
                <div className="portal-card-actions">
                  {entrance.actions.map((action) => (
                    <Link className={action.secondary ? "portal-button portal-button-secondary" : "portal-button"} href={action.href} key={action.href}>
                      {action.label}<span aria-hidden="true">→</span>
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="portal-footer">
          <div>
            <span>BodyFix OS</span>
            <p>服務從理解開始，系統讓每一次整理都能留下下一步。</p>
          </div>
          <Link className="portal-system-noise-link" href="/internal-access?entry=footer">
            BodyFix OS v1.4.2 // INTERNAL_ACCESS →
          </Link>
        </footer>
      </div>
    </main>
  );
}
