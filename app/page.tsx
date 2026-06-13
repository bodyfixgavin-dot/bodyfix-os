import Link from "next/link";
import styles from "./portal.module.css";

const flows = [
  ["SERVICE", "BodyFix 提供哪些身體整理服務"],
  ["BOOKING", "如何預約、填寫問卷與準備"],
  ["RECORDS", "服務後的紀錄、摘要與追蹤"],
  ["TOOLS", "後續使用的判讀、管理與學習工具"],
] as const;

const entries = [
  { tag: "Public", title: "我想了解 / 預約 BodyFix", note: "第一次來，從這裡開始", description: "了解 BodyFix 的服務內容，或前往預約與填寫預約前問卷。", links: [["前往 Booking", "/booking"], ["填寫問卷", "/intake"]], tone: "primary" },
  { tag: "Method", title: "我想學 BodyFix", note: "從身體狀態整理入門", description: "了解 BodyFix 如何把運動按摩、筋膜鏈判讀、低痛感手法與服務流程整理成一套學習路線。", links: [["查看學習路線", "/method"]], tone: "method" },
  { tag: "Coming Soon", title: "我是已服務客戶", note: "進展查看功能開發中", description: "未來可查看自己的服務摘要、居家建議與身體狀態進展。", links: [["Client Portal Coming Soon", "/client"]], tone: "soon" },
  { tag: "Coming Soon", title: "我是課程學員", note: "教材與進度功能開發中", description: "給未來已報名 BodyFix 課程的學員使用，可查看教材、練習任務與課程進度。", links: [["Learner Portal Coming Soon", "/learn"]], tone: "soon" },
  { tag: "Owner Mode", title: "我是老闆", note: "老闆模式｜請本人進入", description: "有些入口，不是為了多看一個功能，而是為了看懂整套系統。", links: [["進入老闆模式", "/owner"]], tone: "owner" },
] as const;

export default function HomePage() {
  return <main className={styles.page}><div className={styles.shell}>
    <nav className={styles.nav}><span className={styles.brand}><b>BF</b> BodyFix OS</span><Link href="/clinic/dashboard" className={styles.admin}>Admin</Link></nav>
    <header className={styles.hero}>
      <div className={styles.heroCopy}><p className={styles.eyebrow}>BODYFIX OPERATING SYSTEM</p><h1>BodyFix OS</h1><h2>身體服務、預約管理、紀錄追蹤與工具系統入口</h2><p>BodyFix OS 是 BodyFix 專屬服務管理系統，目前以內部運作、預約流程與未來學習入口為主。請依你的身份選擇要前往的功能。</p></div>
      <div className={styles.flow}>{flows.map(([title, text], i) => <div className={styles.flowItem} key={title}><span>{String(i + 1).padStart(2, "0")}</span><strong>{title}</strong><p>{text}</p></div>)}</div>
    </header>
    <section className={styles.entries} aria-labelledby="entry-title"><div className={styles.sectionHeading}><p>CHOOSE YOUR ENTRY</p><h2 id="entry-title">請選擇你的入口</h2></div><div className={styles.cardGrid}>{entries.map(entry => <article className={`${styles.card} ${styles[entry.tone]}`} key={entry.title}><span className={styles.tag}>{entry.tag}</span><h3>{entry.title}</h3><strong className={styles.note}>{entry.note}</strong><p>{entry.description}</p><div className={styles.actions}>{entry.links.map(([label, href]) => <Link href={href} key={href}>{label}<span>→</span></Link>)}</div></article>)}</div></section>
    <footer className={styles.footer}><span>BodyFix OS</span><p>從一次服務，整理成可理解、可追蹤、可延伸的系統。</p></footer>
  </div></main>;
}
