"use client";

import { useEffect, useMemo, useState } from "react";
import type { AvailabilitySlot, BookingRequest, BookingService, BookingStatus } from "@/types/booking";

type AdminDataMode = "preview-local" | "supabase-connected" | "supabase-error-fallback";

const LOCAL_STORAGE_SLOTS_KEY = "bodyfix-admin-preview-slots";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(supabaseUrl) && Boolean(supabaseKey);

function getModeLabel(mode: AdminDataMode) {
  if (mode === "supabase-connected") return "Supabase Connected";
  if (mode === "supabase-error-fallback") return "Supabase Error Fallback";
  return "Preview Local Mode";
}

function readLocalSlots() {
  if (typeof window === "undefined") return [] as AvailabilitySlot[];

  const raw = window.localStorage.getItem(LOCAL_STORAGE_SLOTS_KEY);
  if (!raw) return [] as AvailabilitySlot[];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AvailabilitySlot[]) : [];
  } catch (error) {
    console.error("Failed to parse local preview slots", error);
    return [] as AvailabilitySlot[];
  }
}

function writeLocalSlots(slots: AvailabilitySlot[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_STORAGE_SLOTS_KEY, JSON.stringify(slots));
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
  const [bypassMode, setBypassMode] = useState(false);
  const [dataMode, setDataMode] = useState<AdminDataMode>(hasSupabaseConfig ? "supabase-connected" : "preview-local");

  const isLocalMode = dataMode === "preview-local" || dataMode === "supabase-error-fallback";
  const modeNotice = useMemo(() => {
    if (dataMode === "supabase-connected") return "正式資料庫連線中，後台資料會寫入 Supabase。";
    if (dataMode === "supabase-error-fallback") return "Supabase 讀寫失敗，已切換為本地 fallback；資料只存在此瀏覽器，不會寫入正式資料庫。";
    return "目前為 Preview 本地測試模式，資料只存在此瀏覽器，不會寫入正式資料庫。";
  }, [dataMode]);

  function enterLocalMode(mode: AdminDataMode = "preview-local", message = "") {
    setDataMode(mode);
    setBookings([]);
    setServices([]);
    setSlots(readLocalSlots());
    setErrorMessage(message);
  }

  async function loadAdminData() {
    if (!hasSupabaseConfig || isLocalMode) {
      enterLocalMode(dataMode === "supabase-error-fallback" ? "supabase-error-fallback" : "preview-local");
      return;
    }

    setErrorMessage("");
    const res = await fetch("/api/admin/slots", { cache: "no-store" });

    if (res.status === 401) {
      setAuthed(false);
      return;
    }

    const data = await res.json().catch((error) => {
      console.error("Failed to parse admin data response", error);
      return null;
    });

    if (!res.ok) {
      console.error("Failed to load admin data", data);
      const details = [
        data?.error,
        Array.isArray(data?.envErrors) ? data.envErrors.join("；") : "",
        Array.isArray(data?.missingEnv) && data.missingEnv.length ? `missing env: ${data.missingEnv.join("、")}` : "",
        data?.errorType ? `type: ${data.errorType}` : ""
      ].filter(Boolean).join("；");
      enterLocalMode("supabase-error-fallback", details ? `Supabase 讀取失敗，已改用本地測試模式。細節：${details}` : "Supabase 讀取失敗，已改用本地測試模式。");
      return;
    }

    setDataMode("supabase-connected");
    setBookings((data.bookings ?? []) as BookingRequest[]);
    setSlots((data.slots ?? []) as AvailabilitySlot[]);
    setServices((data.services ?? []) as BookingService[]);
  }

  async function login() {
    setErrorMessage("");

    if (!hasSupabaseConfig) {
      setAuthed(true);
      setPassword("");
      enterLocalMode("preview-local");
      return;
    }

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
      const data = await res.json().catch(() => null);
      console.error("Admin login failed", data);
      setAuthed(true);
      setPassword("");
      enterLocalMode("supabase-error-fallback", data?.error ? `正式登入暫不可用，已切換本地測試模式。細節：${data.error}` : "正式登入暫不可用，已切換本地測試模式。");
    }
  }

  async function bypassLogin() {
    setErrorMessage("");

    if (!hasSupabaseConfig) {
      setAuthed(true);
      setPassword("");
      enterLocalMode("preview-local");
      return;
    }

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
      const data = await res.json().catch(() => null);
      console.error("Admin bypass login failed", data);
      setAuthed(true);
      setPassword("");
      enterLocalMode("supabase-error-fallback", data?.error ? `免密碼測試登入暫不可用，已切換本地測試模式。細節：${data.error}` : "免密碼測試登入暫不可用，已切換本地測試模式。");
    }
  }

  async function logout() {
    if (hasSupabaseConfig) {
      await fetch("/api/admin/logout", { method: "POST" });
    }
    setAuthed(false);
    setBookings([]);
    setSlots([]);
    setServices([]);
  }

  useEffect(() => {
    async function checkSession() {
      if (!hasSupabaseConfig) {
        setBypassMode(true);
        enterLocalMode("preview-local");
        return;
      }

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
    // loadAdminData depends on data mode; initial session check intentionally runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateBookingStatus(id: string, status: BookingStatus) {
    if (isLocalMode) {
      setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status } : booking));
      return;
    }

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

    if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      setErrorMessage("結束時間必須晚於開始時間");
      return;
    }

    if (isLocalMode) {
      const nextSlots = [
        ...slots,
        {
          id: crypto.randomUUID(),
          starts_at: new Date(startsAt).toISOString(),
          ends_at: new Date(endsAt).toISOString(),
          city,
          slot_type: slotType,
          note: note || null,
          status: "available" as const
        }
      ].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
      setSlots(nextSlots);
      writeLocalSlots(nextSlots);
      setStartsAt("");
      setEndsAt("");
      setNote("");
      setErrorMessage("");
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
      const data = await res.json().catch(() => null);
      console.error("Failed to create slot", data);
      enterLocalMode("supabase-error-fallback", data?.error ? `新增時段寫入 Supabase 失敗，已切換本地測試模式。細節：${data.error}` : "新增時段寫入 Supabase 失敗，已切換本地測試模式。");
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

    if (isLocalMode) {
      const nextSlots = slots.filter((slot) => slot.id !== id);
      setSlots(nextSlots);
      writeLocalSlots(nextSlots);
      return;
    }

    const res = await fetch("/api/admin/slots/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      console.error("Failed to delete slot", data);
      enterLocalMode("supabase-error-fallback", data?.error ? `刪除 Supabase 時段失敗，已切換本地測試模式。細節：${data.error}` : "刪除失敗，已切換本地測試模式。");
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
            <div className="bf-notice">
              <strong>{getModeLabel(dataMode)}</strong><br />
              {modeNotice}
            </div>
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

      <div className="bf-notice bf-admin-notice">
        <strong>{getModeLabel(dataMode)}</strong><br />
        {modeNotice}
      </div>
      {bypassMode && dataMode === "supabase-connected" && (
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
