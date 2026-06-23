import type { Metadata } from "next";
import Link from "next/link";
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
    text: "Every service is treated as a living protocol: what the client needs, what the body reveals, and what should be carried into the next decision.",
  },
  {
    id: "booking",
    label: "BOOKING",
    text: "Bookings are not isolated reservations. They connect time, capacity, preparation, and follow-up so the operation can see demand before it becomes pressure.",
  },
  {
    id: "records",
    label: "RECORDS",
    text: "Records preserve context across sessions: symptoms, choices, outcomes, and learning signals that help BodyFix remember more than a single appointment.",
  },
  {
    id: "tools",
    label: "TOOLS",
    text: "Tools turn repeated judgment into reusable structure, linking service knowledge, owner decisions, and client care without pretending the system is finished.",
  },
];

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
          <p className={styles.ownerModeIntro}>
            A public view of how BodyFix thinks in systems: services create records, records sharpen decisions,
            decisions improve tools, and tools make the next service more precise.
          </p>
        </section>

        <section className={styles.ownerModeGrid} aria-label="BodyFix OS system modules">
          {modules.map((module, index) => (
            <article id={module.id} className={styles.ownerModeModule} key={module.id}>
              <span className={styles.ownerModeIndex}>{String(index + 1).padStart(2, "0")}</span>
              <h2>{module.label}</h2>
              <p>{module.text}</p>
            </article>
          ))}
        </section>

        <footer className={styles.ownerModeFooter}>
          <p className={styles.ownerModeStatement}>
            This first public layer uses static anchors only. It introduces the operating logic without opening private
            administration, client records, payments, booking controls, or unfinished destinations.
          </p>
          <Link className={styles.ownerModeBack} href="/internal-access">
            Back to system layer
          </Link>
        </footer>
      </div>
    </main>
  );
}
