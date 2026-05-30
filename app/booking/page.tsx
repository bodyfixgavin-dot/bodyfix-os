"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AvailabilitySlot, BookingService } from "@/types/booking";

function formatSlotTime(startsAt: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    weekday: "short",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(startsAt));
}

function slotLabel(slot: AvailabilitySlot) {
  if (slot.slot_type === "late_night") return "深夜時段";
  if (slot.slot_type === "last_minute") return "臨時空檔";
  if (slot.slot_type === "vip_hold") return "VIP 保留";
  return "一般時段";
}

function cityLabel(city: AvailabilitySlot["city"]) {
  if (city === "taipei") return "台北";
  if (city === "taichung") return "台中";
  return "高雄";
}

function formatPrice(price: number | null | undefined) {
  if (price == null) return "價格另洽";
  return `NT$${new Intl.NumberFormat("en-US").format(price)}`;
}

function serviceLabel(service: BookingService) {
  const name = service.display_name_zh || service.name;
  const duration = service.duration_minutes ? `${service.duration_minutes} 分鐘` : "時間另洽";
  return `${name}｜${duration}｜${formatPrice(service.price_twd ?? service.price)}`;
}

export default function BookingPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [services, setServices] = useState<BookingService[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [clientName, setClientName] = useState("");
  const [lineId, setLineId] = useState("");
  const [phone, setPhone] = useState("");
  const [bodyNotes, setBodyNotes] = useState("");
  const [message, setMessage] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    const res = await fetch("/api/booking/public", { cache: "no-store" });
    setLoadingData(false);

    if (!res.ok) {
      setSubmitMessage("目前無法載入可預約時段，請稍後再試或改用 LINE 私訊。");
      return;
    }

    const data = await res.json();
    setSlots((data.slots ?? []) as AvailabilitySlot[]);
    setServices((data.services ?? []) as BookingService[]);

    if (!serviceId && data.services?.length > 0) {
      setServiceId(data.services[0].id);
    }
  }, [serviceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId),
    [slots, selectedSlotId]
  );

  async function submitBooking() {
    setSubmitMessage("");

    if (!selectedSlotId || !serviceId || !clientName.trim() || !lineId.trim()) {
      setSubmitMessage("請先選擇時段，並填寫姓名與 LINE ID。");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/booking/hold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slot_id: selectedSlotId,
        service_id: serviceId,
        client_name: clientName.trim(),
        line_id: lineId.trim(),
        phone: phone.trim() || null,
        body_notes: bodyNotes.trim() || null,
        message: message.trim() || null
      })
    });
    setLoading(false);

    if (!res.ok) {
      setSubmitMessage("這個時段可能剛被保留，請重新整理後選擇其他時段。");
      await loadData();
      return;
    }

    const data = await res.json();
    if (data && data.success === false) {
      setSubmitMessage(data.message || "此時段暫時無法預約。");
      await loadData();
      return;
    }

    setSubmitMessage("已為你暫時保留此時段。正式預約以 LINE 確認為準。");
    setSelectedSlotId("");
    setClientName("");
    setLineId("");
    setPhone("");
    setBodyNotes("");
    setMessage("");
    await loadData();
  }

  return (
    <main className="bf-container">
      <section className="bf-hero">
        <div className="bf-brand"><span className="bf-logo-box">BF</span> BodyFix Booking</div>
        <h1>選擇你想預約的時段</h1>
        <p className="bf-subtitle">
          目前開放五、六、日與臨時空檔預約。送出後系統會先為你暫時保留時段，正式預約以 LINE 確認為準。
        </p>
      </section>

      <section className="bf-grid">
        <div className="bf-card">
          <h2 className="bf-section-title">目前可約時段</h2>
          <div className="bf-slot-list">
            {loadingData && <div className="bf-notice">正在載入可預約時段...</div>}
            {!loadingData && slots.length === 0 && <div className="bf-notice">目前沒有公開可預約時段。可從 LINE 私訊詢問臨時空檔。</div>}
            {slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                className={`bf-slot ${selectedSlotId === slot.id ? "selected" : ""}`}
                onClick={() => setSelectedSlotId(slot.id)}
              >
                <strong>{formatSlotTime(slot.starts_at)}</strong>
                <span className="bf-tag">{cityLabel(slot.city)}</span>
                <span className="bf-tag">{slotLabel(slot)}</span>
                {slot.note && <div className="bf-muted-note">{slot.note}</div>}
              </button>
            ))}
          </div>
        </div>

        <div className="bf-card">
          <h2 className="bf-section-title">卡位資料</h2>
          {selectedSlot && (
            <div className="bf-notice bf-margin-bottom">
              已選擇：{formatSlotTime(selectedSlot.starts_at)}。此送出動作為暫時卡位，尚非正式預約成功。
            </div>
          )}

          <div className="bf-form">
            <label>
              服務項目
              <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {serviceLabel(service)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              姓名
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="請填寫稱呼或姓名" />
            </label>

            <label>
              LINE ID
              <input value={lineId} onChange={(e) => setLineId(e.target.value)} placeholder="方便 Gavin 聯絡確認" />
            </label>

            <label>
              電話，可不填
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="可不填" />
            </label>

            <label>
              想處理的身體狀況
              <textarea value={bodyNotes} onChange={(e) => setBodyNotes(e.target.value)} placeholder="例如肩頸緊、骨盆卡、重訓後恢復差、腰反覆酸等" />
            </label>

            <label>
              備註
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="例如第一次預約、希望 90 分鐘、可接受前後調整 30 分鐘等" />
            </label>

            <button className="bf-primary" disabled={loading} type="button" onClick={submitBooking}>
              {loading ? "卡位中..." : "送出並暫時保留時段"}
            </button>

            {submitMessage && <div className="bf-notice">{submitMessage}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
