import type { BookingService } from "@/types/booking";

export const FALLBACK_BOOKING_SERVICES: BookingService[] = [
  { code: "fascia_chain_reset_60", name: "筋膜鏈整理｜60 分鐘", price_twd: 2200, duration_minutes: 60, description: "看整體張力路線與代償，適合肩頸緊繃、胸口卡住、久坐壓力與日常卡住感整理。" },
  { code: "pelvic_core_reset_60", name: "骨盆核心整理｜60 分鐘", price_twd: 2500, duration_minutes: 60, description: "聚焦骨盆、髖關節、核心、呼吸與穩定控制，適合骨盆不穩、下背痠痛、核心代償明顯者。" },
  { code: "fascia_line_selected_reset_60", name: "筋膜線指定整理｜60 分鐘", price_twd: 2300, duration_minutes: 60, description: "鎖定特定筋膜線或特定區域處理，適合已知道自己想處理哪條線、哪個限制或特定痠痛點的人。" },
  { code: "fascia_chain_extension_30", name: "筋膜鏈延長整理｜+30 分鐘", price_twd: 1000, duration_minutes: 30, description: "加購延長整理。適合張力較多、需要額外時間做更完整銜接者。" },
  { code: "pelvic_core_extension_30", name: "骨盆核心延長整理｜+30 分鐘", price_twd: 1200, duration_minutes: 30, description: "加購延長整理。適合骨盆、呼吸、核心穩定與代償控制需要更多時間整合者。" }
].map((service, index) => ({
  ...service, id: `fallback-${service.code}`, category: "bodywork", display_name_zh: service.name,
  display_name_en: null, price: service.price_twd, cash_price_twd: null, is_active: true,
  is_addon: service.duration_minutes === 30, is_public_visible: true, is_direct_booking_allowed: true,
  is_city_session_allowed: false, requires_consultation: false, daily_limit: null, status: "active",
  sort_order: index, booking_note: service.description, internal_note: null
}));

export const PUBLIC_BOOKING_SERVICE_CODES = new Set(FALLBACK_BOOKING_SERVICES.map((service) => service.code));

export function getPublicBookingServices(services: BookingService[] | null | undefined) {
  const allowedByCode = new Map(
    (services ?? [])
      .filter((service) => service.code && PUBLIC_BOOKING_SERVICE_CODES.has(service.code))
      .map((service) => [service.code, service])
  );

  return FALLBACK_BOOKING_SERVICES.map((fallback) => allowedByCode.get(fallback.code) ?? fallback);
}
