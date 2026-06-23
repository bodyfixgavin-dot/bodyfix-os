import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Owner Mode",
  robots: {
    index: false,
    follow: false,
  },
};

const modules = [
  {
    id: "service",
    label: "SERVICE",
    lines: ["你賣的是時間，", "還是一套能被理解的服務？", "客人是否知道自己買到什麼，", "以及這次服務之後應該往哪裡走？"],
  },
  {
    id: "booking",
    label: "BOOKING",
    lines: ["客人是隨便約進來，", "還是被正確分流？", "預約不只是選時間，", "也是需求判讀、期待管理與服務配對。"],
  },
  {
    id: "records",
    label: "RECORDS",
    lines: ["服務結束後，", "只剩一句多喝水，", "還是留下能追蹤的紀錄？", "紀錄讓每一次服務能接續，", "而不是每次重新開始。"],
  },
  {
    id: "tools",
    label: "TOOLS",
    lines: ["你靠記憶經營，", "還是有工具幫你判讀、回訪與升級？", "工具不是取代專業，", "而是讓重要的事情不再只靠腦袋記住。"],
  },
];

const quietEntries = ["看服務系統", "探索場域合作", "了解方法轉譯", "留下合作訊號"];

export default function OwnerModePage() {
  return (
    <main className={styles.ownerModeShell}>
      <div className={styles.ownerModeWrap}>
        <header className={styles.ownerModeTopbar}>
          <span className={styles.ownerModeMark}>BodyFix OS / Owner Mode</span>
          <nav className={styles.ownerModeNav} aria-label="Owner Mode sections">
            {modules.map((module) => (
              <a key={module.id} href={`#${module.id}`}>
                {module.label}
              </a>
            ))}
          </nav>
        </header>

        <section className={styles.ownerModeHero} aria-labelledby="owner-mode-title">
          <h1 id="owner-mode-title" className={styles.ownerModeTitle}>
            OWNER MODE
          </h1>
          <div className={styles.ownerModeIntro}>
            <p>你真的走到這裡了。</p>
            <p>那你大概不只是想預約一次 BodyFix。</p>
            <p>
              有些人看見的是一項服務。
              <br />
              有些人開始注意，服務背後還有預約、紀錄、工具與方法。
            </p>
          </div>
        </section>

        <section className={styles.ownerModeGrid} aria-label="BodyFix OS system modules">
          {modules.map((module, index) => (
            <article id={module.id} className={styles.ownerModeModule} key={module.id}>
              <span className={styles.ownerModeIndex}>{String(index + 1).padStart(2, "0")}</span>
              <h2>{module.label}</h2>
              <div className={styles.ownerModeModuleText}>
                {module.lines.map((line, lineIndex) => (
                  <p key={`${module.id}-${lineIndex}`}>{line}</p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <footer className={styles.ownerModeFooter} aria-label="Quiet next steps">
          {quietEntries.map((entry) => (
            <span className={styles.ownerModeStaticEntry} key={entry}>
              {entry}
            </span>
          ))}
        </footer>
      </div>
    </main>
  );
}
