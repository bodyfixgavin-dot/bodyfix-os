"use client";

import { useEffect, useState } from "react";
import type { AvailabilitySlot, BookingRequest, BookingService, BookingStatus } from "@/types/booking";

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
  const [bypassMode, setBypassMode] = useState(false);

  async function loadAdminData() {
    setErrorMessage("");
    const res = await fetch("/api/admin/slots", { cache: "no-store" });

    if (res.status === 401) {
      setAuthed(false);
      return;
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const missingEnv = Array.isArray(data?.missingEnv) ? data.missingEnv.join("、") : "";
      setErrorMessage(
        missingEnv
          ? `載入後台資料失敗，Preview 缺少環境變數：${missingEnv}。請在 Vercel Preview 設定後重新部署。`
          : "載入後台資料失敗，請確認 Supabase 與後台環境變數。"
      );
      return;
    }

    setBookings((data.bookings ?? []) as BookingRequest[]);
    setSlots((data.slots ?? []) as AvailabilitySlot[]);
    setServices((data.services ?? []) as BookingService[]);
  }

  async function login() {
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

  async function bypassLogin() {
    setErrorMessage("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bypass: true })
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

  if (!authed) {
    return (
      <main className="bf-container bf-admin-login-shell">
        <section className="bf-hero">
          <div className="bf-brand"><span className="bf-logo-box">BF</span> BodyFix Admin</div>
          <h1>管理後台登入</h1>
          <div className="bf-form bf-login-form">
            <label>
              後台密碼
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button className="bf-primary" type="button" onClick={login}>登入</button>
            {bypassMode && (
              <button className="bf-small-btn" type="button" onClick={bypassLogin}>免密碼測試登入</button>
            )}
            {bypassMode && (
              <div className="bf-notice">目前為 Preview 免密碼測試模式，請勿匯入正式客戶資料。</div>
            )}
            {errorMessage && <div className="bf-notice">{errorMessage}</div>}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bf-container">
      <section className="bf-hero">
        <div className="bf-brand"><span className="bf-logo-box">BF</span> BodyFix Console</div>
        <h1>預約管理後台</h1>
        <p className="bf-subtitle">管理時段、確認預約、取消、完成。這裡是第一版營運控制台。</p>
        <button className="bf-small-btn" type="button" onClick={logout}>登出</button>
      </section>

      {bypassMode && (
        <div className="bf-notice bf-admin-notice">目前為 Preview 免密碼測試模式，請勿匯入正式客戶資料。</div>
      )}
      {errorMessage && <div className="bf-notice bf-admin-notice">{errorMessage}</div>}

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
                  <td><button className="bf-small-btn" type="button" onClick={() => deleteSlot(slot.id)}>刪除</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
