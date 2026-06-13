import Link from "next/link";
import styles from "../detail.module.css";
export default function Page() { return <main className={styles.page}><nav><Link href="/">← BodyFix OS</Link></nav><header><p className={styles.eyebrow}>BODYFIX OS / CLIENT</p><h1>BodyFix Client Portal</h1><h2>未來已服務客戶進展入口。</h2><p>未來可查看自己的服務摘要、居家建議與身體狀態進展。</p></header><aside>目前功能開發中。</aside><footer><p>我們正在整理更清楚、安心的服務後追蹤體驗。</p><Link href="/">回到系統入口 →</Link></footer></main>; }
