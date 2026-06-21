"use client";

import { useEffect, useState } from "react";
import type { AvailabilitySlot, BookingRequest, BookingService, BookingStatus } from "@/types/booking";

type AdminDiagnostics = {
  loginState?: "unauthenticated" | "authenticated";
  databaseState?: "not_checked" | "failed" | "ready";
  requestPath?: string;
  failedRequest?: string;
  errorReason?: string;
  envErrors?: string[];
  missingEnv?: string[];
  checkedEnv?: string[];
  requiredEnv?: string[];
  nextStep?: string;
};

function buildAdminErrorMessage(data: { error?: string; diagnostics?: AdminDiagnostics; missingEnv?: string[]; requestPath?: string; failedRequest?: string } | null) {
  const diagnostics = data?.diagnostics;
  const envErrors = diagnostics?.envErrors ?? [];
  const missingEnv = diagnostics?.missingEnv ?? data?.missingEnv ?? [];
  if (envErrors.length > 0) {
    return `載入後台資料失敗：${envErrors.join("；")}。`;
  }
  if (missingEnv.length > 0) {
    return `載入後台資料失敗：缺少 ${missingEnv.join("、")}。請確認 Vercel Environment Variables 後重新部署。`;
  }
  if (data?.failedRequest || data?.requestPath) {
    return "載入後台資料失敗，請檢查後台 API、登入狀態或 Supabase 環境變數。";
  }
  return data?.error ? `載入後台資料失敗：${data.error}` : "載入後台資料失敗，請確認 Supabase 與後台環境變數。";
}

function AdminDataStatusCard({ diagnostics, errorMessage }: { diagnostics: AdminDiagnostics | null; errorMessage: string }) {
  if (!errorMessage && diagnostics?.databaseState !== "failed") return null;

  return (
    <section className="bf-card bf-section-gap" role="alert">
      <h2 className="bf-section-title">後台資料庫狀態</h2>
      <p>登入狀態：{diagnostics?.loginState === "authenticated" ? "已通過" : "未登入"}</p>
      <p>資料庫狀態：{diagnostics?.databaseState === "failed" ? "失敗" : "未完成檢查"}</p>
      <p>錯誤原因：{diagnostics?.errorReason ?? errorMessage}</p>
      {diagnostics?.missingEnv?.length ? <p>缺少 env：{diagnostics.missingEnv.join("、")}</p> : null}
      {diagnostics?.envErrors?.length ? (
        <ul>
          {diagnostics.envErrors.map((envError) => <li key={envError}>{envError}</li>)}
        </ul>
      ) : null}
      <p>連線狀態：後台資料 API 連線失敗</p>
      <p>下一步：{diagnostics?.nextStep ?? "請確認 Vercel env 後重新部署。"}</p>
      {diagnostics?.checkedEnv?.length ? <p>已檢查 env：{diagnostics.checkedEnv.join("、")}（不顯示任何 secret value）</p> : null}
    </section>
  );
}

function fmt(dt: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(dt));
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [services, setServices] = useState<BookingService[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [city, setCity] = useState<AvailabilitySlot["city"]>("taipei");
  const [slotType, setSlotType] = useState<AvailabilitySlot["slot_type"]>("normal");
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [diagnostics, setDiagnostics] = useState<AdminDiagnostics | null>(null);
  const [bypassMode, setBypassMode] = useState(false);
  const [localMode, setLocalMode] = useState(false);

  async function loadAdminData() {
    if (localMode) {
      setSlots(JSON.parse(localStorage.getItem("bodyfix-preview-slots") || "[]") as AvailabilitySlot[]);
      return;
    }
    setErrorMessage("");
    setDiagnostics(null);
    const res = await fetch("/api/admin/slots", { cache: "no-store" });

    if (res.status === 401) {
      setAuthed(false);
      return;
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setDiagnostics((data?.diagnostics ?? null) as AdminDiagnostics | null);
      setErrorMessage(buildAdminErrorMessage(data));
      return;
    }

    setBookings((data.bookings ?? []) as BookingRequest[]);
    setSlots((data.slots ?? []) as AvailabilitySlot[]);
    setServices((data.services ?? []) as BookingService[]);
    setDiagnostics({ loginState: "authenticated", databaseState: "ready", requestPath: "/api/admin/slots" });
  }

  async function login() {
    if (bypassMode) { setLocalMode(true); setAuthed(true); setSlots(JSON.parse(localStorage.getItem("bodyfix-preview-slots") || "[]")); return; }
    setErrorMessage("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      setAuthed(true);
      setPassword("");
      await loadAdminData();
    } else {
      setErrorMessage("密碼錯誤，或後台環境變數尚未設定。");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setBookings([]);
    setSlots([]);
    setServices([]);
  }

  useEffect(() => {
    async function checkSession() {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      if (!res.ok) return;

      const data = await res.json();
      setBypassMode(Boolean(data.bypassMode));
      if (data.bypassMode) setLocalMode(true);
      if (data.authenticated) {
        setAuthed(true);
        await loadAdminData();
      }
    }

    checkSession();
  }, []);

  async function updateBookingStatus(id: string, status: BookingStatus) {
    const res = await fetch("/api/admin/bookings/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });

    if (!res.ok) {
      setErrorMessage("更新失敗，請重新登入或稍後再試。");
      return;
    }

    await loadAdminData();
  }

  async function createSlot() {
    if (!startsAt || !endsAt) {
      setErrorMessage("請填開始與結束時間");
      return;
    }

    if (localMode) {
      const nextSlot: AvailabilitySlot = { id: crypto.randomUUID(), starts_at: new Date(startsAt).toISOString(), ends_at: new Date(endsAt).toISOString(), city, slot_type: slotType, status: "available", note: note || null };
      const next = [...slots, nextSlot]; setSlots(next); localStorage.setItem("bodyfix-preview-slots", JSON.stringify(next)); setStartsAt(""); setEndsAt(""); setNote(""); setErrorMessage(""); return;
    }

    const res = await fetch("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        city,
        slot_type: slotType,
        note: note || null
      })
    });

    if (!res.ok) {
      setErrorMessage("新增時段失敗，請確認時間格式與後台權限。");
      return;
    }

    setStartsAt("");
    setEndsAt("");
    setNote("");
    setErrorMessage("");
    await loadAdminData();
  }

  async function deleteSlot(id: string) {
    if (!confirm("確定刪除此時段？")) return;

    if (localMode) { const next = slots.filter((slot) => slot.id !== id); setSlots(next); localStorage.setItem("bodyfix-preview-slots", JSON.stringify(next)); return; }

    const res = await fetch("/api/admin/slots/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    if (!res.ok) {
      setErrorMessage("刪除失敗，可能已有預約資料。建議改成 closed。");
      return;
    }

    await loadAdminData();
  }

  function updateLocalSlot(id: string) {
    const next = slots.map((slot) => slot.id === id ? { ...slot, status: slot.status === "available" ? "closed" as const : "available" as const } : slot);
    setSlots(next); localStorage.setItem("bodyfix-preview-slots", JSON.stringify(next));
  }

  if (!authed) {
    return (
      <main className="bf-container bf-admin-login-shell">
        <section className="bf-hero">
          <div className="bf-brand"><span className="bf-logo-box">BF</span> BODYFIX ADMIN</div>
          <h1>管理後台登入</h1>
          <div className="bf-form bf-login-form">
            <label>
              後台密碼
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button className="bf-primary" type="button" onClick={login}>登入</button>
            {bypassMode && (
              <button className="bf-small-btn" type="button" onClick={login}>直接進入 Preview 後台</button>
            )}
            {bypassMode && (
              <div className="bf-notice">Preview Local Mode｜資料只存在此瀏覽器，不會寫入正式資料庫。</div>
            )}
            {errorMessage && <div className="bf-notice">{errorMessage}</div>}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bf-container bf-admin-mobile-safe">
      <section className="bf-hero">
        <div className="bf-brand"><span className="bf-logo-box">BF</span> BODYFIX ADMIN</div>
        <h1>預約管理後台</h1>
        <p className="bf-subtitle">管理時段、確認預約、取消、完成。這裡是第一版營運控制台。</p>
        <button className="bf-small-btn" type="button" onClick={logout}>登出</button>
      </section>

      {bypassMode && (
        <div className="bf-notice bf-admin-notice">Preview Local Mode｜資料只存在此瀏覽器，不會寫入正式資料庫。</div>
      )}
      {errorMessage && <div className="bf-notice bf-admin-notice">{errorMessage}</div>}
      <AdminDataStatusCard diagnostics={diagnostics} errorMessage={errorMessage} />

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">BodyFix Pulse</h2>
        <p className="bf-subtitle">收入節奏、今日戰況與回訪空狀態。Pulse 放在 Admin 管理後台，不取代既有預約管理功能。</p>
        <a className="bf-primary" href="/admin/pulse">進入 BodyFix Pulse</a>
      </section>

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">新增可約時段</h2>
        <div className="bf-form">
          <label>開始時間<input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></label>
          <label>結束時間<input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></label>
          <label>
            城市
            <select value={city} onChange={(e) => setCity(e.target.value as AvailabilitySlot["city"])}>
              <option value="taipei">台北</option>
              <option value="taichung">台中</option>
              <option value="kaohsiung">高雄</option>
            </select>
          </label>
          <label>
            時段類型
            <select value={slotType} onChange={(e) => setSlotType(e.target.value as AvailabilitySlot["slot_type"])}>
              <option value="normal">一般</option>
              <option value="late_night">深夜</option>
              <option value="last_minute">臨時空檔</option>
              <option value="vip_hold">VIP 保留，前台不顯示</option>
            </select>
          </label>
          <label>備註<input value={note} onChange={(e) => setNote(e.target.value)} /></label>
          <button className="bf-primary" type="button" onClick={createSlot}>新增時段</button>
        </div>
      </section>

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">預約申請</h2>
        <div className="bf-table-wrap">
          <table className="bf-admin-table">
            <thead>
              <tr>
                <th>狀態</th>
                <th>時間</th>
                <th>客戶</th>
                <th>服務</th>
                <th>身體狀況</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.status}</td>
                  <td>{booking.availability_slots ? fmt(booking.availability_slots.starts_at) : "未連結時段"}</td>
                  <td>
                    <strong>{booking.client_name}</strong><br />
                    LINE：{booking.line_id}<br />
                    {booking.phone || ""}
                  </td>
                  <td>{booking.services?.display_name_zh || booking.services?.name || booking.service_id}</td>
                  <td>{booking.body_notes}<br />{booking.message}</td>
                  <td>
                    <div className="bf-admin-actions">
                      <button className="bf-small-btn" type="button" onClick={() => updateBookingStatus(booking.id, "confirmed")}>確認</button>
                      <button className="bf-small-btn" type="button" onClick={() => updateBookingStatus(booking.id, "cancelled")}>取消</button>
                      <button className="bf-small-btn" type="button" onClick={() => updateBookingStatus(booking.id, "completed")}>完成</button>
                      <button className="bf-small-btn" type="button" onClick={() => updateBookingStatus(booking.id, "expired")}>釋放</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">所有時段</h2>
        <p className="bf-subtitle">服務項目數：{services.length}</p>
        <div className="bf-table-wrap">
          <table className="bf-admin-table">
            <thead>
              <tr>
                <th>時間</th>
                <th>城市</th>
                <th>類型</th>
                <th>狀態</th>
                <th>備註</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td>{fmt(slot.starts_at)} 到 {fmt(slot.ends_at)}</td>
                  <td>{slot.city}</td>
                  <td>{slot.slot_type}</td>
                  <td>{slot.status}</td>
                  <td>{slot.note}</td>
                  <td><div className="bf-admin-actions">{localMode && <button className="bf-small-btn" type="button" onClick={() => updateLocalSlot(slot.id)}>{slot.status === "available" ? "完成／關閉" : "重新開放"}</button>}<button className="bf-small-btn" type="button" onClick={() => deleteSlot(slot.id)}>刪除</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
