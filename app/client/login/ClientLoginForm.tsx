"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ClientLoginForm({ missingEnv }: { missingEnv: readonly string[] }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const disabled = missingEnv.length > 0;

  async function signInWithGoogle() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return setMessage("Supabase 尚未設定，無法登入。");
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback?next=/client` } });
  }

  async function signInWithEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return setMessage("Supabase 尚未設定，無法登入。");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback?next=/client` } });
    setMessage(error ? "登入連結寄送失敗，請稍後再試。" : "登入連結已寄出，請查看信箱。");
    setLoading(false);
  }

  return <div className="client-login-actions">
    {disabled ? <p className="client-state-card">缺少環境變數：{missingEnv.join(", ")}</p> : null}
    <button className="portal-button" onClick={signInWithGoogle} disabled={disabled}>使用 Google 登入</button>
    <button className="portal-button portal-button-secondary" disabled>LINE 登入即將開放</button>
    <form onSubmit={signInWithEmail} className="client-email-form">
      <label>Email 備用登入<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" disabled={disabled || loading} /></label>
      <button className="portal-button" disabled={disabled || loading}>{loading ? "寄送中…" : "寄送登入連結"}</button>
    </form>
    {message ? <p className="client-state-card" role="status">{message}</p> : null}
  </div>;
}
