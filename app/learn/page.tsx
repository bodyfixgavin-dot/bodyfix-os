import Link from "next/link";
import styles from "../detail.module.css";
export default function Page() { return <main className={styles.page}><nav><Link href="/">← BodyFix OS</Link></nav><header><p className={styles.eyebrow}>BODYFIX OS / LEARN</p><h1>BodyFix Learner Portal</h1><h2>未來已報名課程學員入口。</h2><p>未來可查看教材、練習任務與課程進度。</p></header><aside>目前功能開發中。</aside><footer><p>學習入口將在課程內容與進度系統準備完成後開放。</p><Link href="/">回到系統入口 →</Link></footer></main>; }
