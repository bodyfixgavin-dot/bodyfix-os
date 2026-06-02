"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function InlineAdminLoginCard() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const loginRes = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (!loginRes.ok) {
        setErrorMessage("密碼錯誤，或後台環境變數尚未設定。");
        return;
      }

      setPassword("");

      const meRes = await fetch("/api/admin/me", { cache: "no-store" });
      if (!meRes.ok) {
        setErrorMessage("密碼錯誤，或後台環境變數尚未設定。");
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("密碼錯誤，或後台環境變數尚未設定。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bf-container clinic-page calendar-backfill-login-shell">
      <section className="bf-card calendar-backfill-login-card" aria-labelledby="calendar-backfill-login-title">
        <div className="bf-brand"><span className="bf-logo-box">BF</span> BodyFix OS</div>
        <h1 id="calendar-backfill-login-title">管理後台登入</h1>
        <p className="bf-subtitle">此工具僅限 BodyFix admin 使用。請輸入後台密碼後繼續。</p>

        <form className="bf-form calendar-backfill-login-form" onSubmit={login}>
          <label>
            後台密碼
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              minLength={1}
              required
            />
          </label>

          <button className="bf-primary calendar-backfill-login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "登入中…" : "登入並返回本頁"}
          </button>

          {errorMessage && <div className="bf-notice calendar-backfill-login-error" role="alert">{errorMessage}</div>}

          <Link className="bf-secondary bf-link-button calendar-backfill-login-hub" href="/clinic">
            返回 BodyFix OS Hub
          </Link>
        </form>
      </section>
    </main>
  );
}
