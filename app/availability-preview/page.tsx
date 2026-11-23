"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SERVICES, type AvailabilityResult, type DayAvailability, type ServiceId } from "@/lib/availability-preview";
import styles from "./AvailabilityPreview.module.css";

const statusLabel: Record<DayAvailability["status"], string> = {
  AVAILABLE: "可洽詢", LIMITED: "剩餘時段", FULL: "額滿",
  CLOSED: "休息", NOT_OPEN: "未開放", ENDED: "已結束",
};

function dateLabel(iso: string) {
  const d = new Date(iso + "T12:00:00+08:00");
  return new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", weekday: "short" }).format(d);
}

function localTime(iso: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei", month: "numeric", day: "numeric", weekday: "short",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(iso));
}

export default function AvailabilityPreviewPage() {
  const [serviceId, setServiceId] = useState<ServiceId>("fascia");
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const requestId = useRef(0);
  useEffect(() => {
    // Internal-only testing: the ordinary customer-facing preview remains demo.
    if (new URLSearchParams(window.location.search).get("source") === "calendar") setMode("live");
  }, []);
  const [data, setData] = useState<AvailabilityResult | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const service = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[1];

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");
    setCopied(false);
    setSelectedTime("");
    try {
      const response = await fetch(
        "/api/availability-preview?mode=" + mode + "&service=" + serviceId + "&days=30",
        { cache: "no-store" },
      );
      const next = await response.json();
      if (id !== requestId.current) return;
      if (!response.ok) throw new Error(next.error || "無法取得空檔");
      setData(next as AvailabilityResult);
      setSelectedDate((current) => next.days.some((d: DayAvailability) => d.date === current) ? current : next.days[0]?.date || "");
    } catch (err) {
      if (id !== requestId.current) return;
      setData(null);
      setError(err instanceof Error ? err.message : "目前無法查詢，請改用 LINE 人工詢問");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [serviceId, mode]);

  useEffect(() => { void refresh(); }, [refresh]);

  const days = useMemo(() => data?.days.slice(0, showAll ? 30 : 7) ?? [], [data, showAll]);
  const day = data?.days.find((d) => d.date === selectedDate);
  const canCopy = Boolean(day && selectedTime && day.slots.includes(selectedTime));

  async function copyRequest() {
    if (!canCopy || !day) return;
    // Confirm again before handing any information off.
    const response = await fetch(
      "/api/availability-preview?mode=" + mode + "&service=" + serviceId +
      "&from=" + encodeURIComponent(selectedDate) + "&days=1",
      { cache: "no-store" },
    );
    if (!response.ok) {
      setError("時段暫時無法重新核對，請透過 LINE 人工確認");
      return;
    }
    const latest = (await response.json()) as AvailabilityResult;
    if (!latest.days[0]?.slots.includes(selectedTime)) {
      setError("這個時間剛剛有變動，請重新選擇其他時段");
      await refresh();
      return;
    }
    const message = [
      "您好，我想預約 BodyFix，請協助人工確認：",
      "服務：" + service.name,
      "日期：" + dateLabel(selectedDate),
      "時間：" + selectedTime,
      "時長：" + service.duration + " 分鐘",
      "地點：請再協助確認",
      "（此訊息不代表預約已成立）",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setError("複製失敗，請手動透過 LINE 詢問");
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <div className={styles.brand}>BodyFix</div>
            <h1>預約時間</h1>
          </div>
          <span className={styles.previewTag}>測試版</span>
        </header>
        <p className={styles.demoNotice}>
          {mode === "demo" ? "目前為示範時段，尚未連接實際預約。" :
            data?.calendarConnected
              ? "Google 行事曆已連線，工作日仍待確認；這裡不會直接成立預約。"
              : "Google 行事曆連線驗證中；尚不開放線上預約。"}
        </p>

        <section className={styles.surface} aria-labelledby="services-title">
          <div className={styles.sectionTop}><span className={styles.step}>01</span><h2 id="services-title">選擇服務</h2></div>
          <div className={styles.serviceGrid}>
            {SERVICES.map((s) => (
              <button type="button" key={s.id} aria-pressed={serviceId === s.id}
                className={serviceId === s.id ? styles.serviceActive : styles.service}
                onClick={() => setServiceId(s.id)}>
                <strong>{s.name}</strong>
                <span>{s.duration} 分鐘 · NT$ {s.price.toLocaleString("en-US")}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.surface} aria-labelledby="slots-title">
          <div className={styles.sectionTop}><span className={styles.step}>02</span><h2 id="slots-title">選擇日期與時間</h2></div>
          {loading ? <p className={styles.loading} role="status">正在核對可洽詢時段…</p> : null}
          {error ? <div className={styles.error} role="alert">{error}</div> : null}
          {!loading && data ? (
            <>
              <div className={styles.summary}>
                <span>最早可洽詢時段</span>
                <strong>{data.nextAvailableAt ? localTime(data.nextAvailableAt) : mode === "live" && !data.scheduleConfigured ? "尚未開放線上時段" : "查詢範圍內暫無可洽詢時段"}</strong>
                <small>{data.nextAvailableAt ? "實際預約須經 Gavin 確認" : "可透過 LINE 詢問其他安排"}</small>
              </div>
              <div className={styles.calendar} aria-label="可查詢日期">
                {days.map((d) => (
                  <button key={d.date} type="button" aria-pressed={selectedDate === d.date}
                    className={selectedDate === d.date ? styles.dayActive : styles.day}
                    onClick={() => {setSelectedDate(d.date); setSelectedTime(""); setCopied(false);}}>
                    <span>{dateLabel(d.date)}</span>
                    <strong>{d.status === "LIMITED" ? "剩 " + d.remaining + " 格" : statusLabel[d.status]}</strong>
                  </button>
                ))}
              </div>
              <button type="button" className={styles.ghost} onClick={() => setShowAll(!showAll)}>
                {showAll ? "收起未來日期" : "查看未來 30 天"}
              </button>
              <div className={styles.slotPanel}>
                <div className={styles.slotHeading}>
                  <strong>{selectedDate ? dateLabel(selectedDate) : "請選擇日期"}</strong>
                  <span>{day?.remaining ? "還有 " + day.remaining + " 個可洽詢時段" : day ? statusLabel[day.status] : ""}</span>
                </div>
                {day?.slots.length ? (
                  <div className={styles.slots}>
                    {day.slots.map((time) => (
                      <button key={time} type="button" aria-pressed={selectedTime === time}
                        className={selectedTime === time ? styles.slotActive : styles.slot}
                        onClick={() => {setSelectedTime(time);setCopied(false);}}>{time}</button>
                    ))}
                  </div>
                ) : <p className={styles.empty}>這天沒有開放可洽詢的時段；請選其他日期，或透過 LINE 人工詢問。</p>}
              </div>
              <div className={styles.action}>
                <button type="button" disabled={!canCopy} onClick={() => void copyRequest()}>
                  {copied ? "已複製預約詢問文字 ✓" : "複製預約詢問文字（測試）"}
                </button>
                <p>測試版僅複製訊息，不會送出 LINE、占用時段或建立任何行事曆事件。</p>
                <p className={styles.updated}>查詢時間：{new Date(data.updatedAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}｜台北時間</p>
              </div>
            </>
          ) : null}
          <button type="button" className={styles.refresh} onClick={() => void refresh()} disabled={loading}>重新查詢</button>
        </section>
        <footer className={styles.footer}>
          <strong>BodyFix 筋膜整理</strong>
          
          <p>{mode === "demo" ? "示範畫面，非正式預約入口。" : "行事曆連線測試，非正式預約入口。"}</p>
        </footer>
      </div>
    </main>
  );
}
