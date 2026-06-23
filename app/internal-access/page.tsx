import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "System Layer Found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InternalAccessPage() {
  return (
    <main className={styles.systemAccessShell}>
      <section className={styles.systemAccessPanel} aria-labelledby="system-access-title">
        <p className={styles.systemAccessEyebrow}>BodyFix OS / Public system layer</p>
        <h1 id="system-access-title" className={styles.systemAccessTitle}>
          SYSTEM LAYER FOUND
        </h1>
        <p className={styles.systemAccessLead}>This is not a login.</p>
        <p className={styles.systemAccessBody}>
          BodyFix OS records how services, decisions, follow-ups, and knowledge continue to grow from the same
          underlying system.
        </p>
        <p className={styles.systemAccessNote}>
          你找到的不是後台，而是 BodyFix 如何看待服務、紀錄、決策與長期生長的系統層。
        </p>
        <Link className={styles.systemAccessAction} href="/owner-mode">
          ENTER OWNER MODE
        </Link>
      </section>
    </main>
  );
}
