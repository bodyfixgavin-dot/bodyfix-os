"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import styles from "./page.module.css";

export default function InternalAccessClient() {
  const [attempts, setAttempts] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const denied = attempts === 1;
  const revealed = attempts >= 2;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    formRef.current?.reset();
    setAttempts((current) => Math.min(current + 1, 2));
    setShakeKey((current) => current + 1);
  }

  return (
    <main className={styles.systemAccessShell}>
      <section className={styles.systemAccessPanel} aria-labelledby="system-access-title">
        <p className={styles.systemAccessEyebrow}>BODYFIX OS / RESTRICTED INTERFACE</p>
        <h1 id="system-access-title" className={styles.systemAccessTitle}>
          Restricted system interface.
        </h1>
        <p className={styles.systemAccessLead}>Internal authorization required.</p>
        <p className={styles.systemAccessNote}>本介面僅供 BodyFix 授權人員存取。</p>

        <form ref={formRef} className={styles.systemAccessForm} onSubmit={handleSubmit}>
          <label className={styles.systemAccessLabel} htmlFor="access-key">
            ACCESS KEY
          </label>
          <input
            key={shakeKey}
            id="access-key"
            className={`${styles.systemAccessInput} ${denied ? styles.systemAccessInputDenied : ""}`}
            name="access-key"
            type="text"
            autoComplete="off"
            inputMode="text"
            placeholder="Enter authorization key"
            aria-describedby="access-status"
          />
          <button className={styles.systemAccessButton} type="submit">
            VERIFY ACCESS
          </button>
        </form>

        <div id="access-status" className={styles.systemAccessStatus} aria-live="polite">
          {denied ? (
            <p className={styles.systemAccessDenied}>
              ACCESS DENIED.
              <br />
              Credentials are not the interesting part.
            </p>
          ) : null}

          {revealed ? (
            <div className={styles.systemAccessReveal}>
              <p>密鑰確實不對。</p>
              <p>但你已經試了第二次。</p>
              <p>多數人不會走到這裡。</p>
              <Link className={styles.systemAccessRevealLink} href="/owner-mode?entry=retry">
                推開這面牆，看看服務背後的結構 →
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
