import type { BookingService } from "@/types/booking";

export const FALLBACK_BOOKING_SERVICES: BookingService[] = [
  {
    code: "fascia_chain_reset_60",
    name: "筋膜鏈整理｜60 分鐘",
    price_twd: 2200,
    duration_minutes: 60,
    description:
      "看整體張力路線與代償，適合肩頸緊繃、胸口卡住、久坐壓力與日常卡住感整理。",
  },
  {
    code: "pelvic_core_reset_60",
    name: "骨盆核心整理｜60 分鐘",
    price_twd: 2500,
    duration_minutes: 60,
    description:
      "聚焦骨盆、髖關節、核心、呼吸與穩定控制，適合骨盆不穩、下背痠痛、核心代償明顯者。",
  },
  {
    code: "fascia_line_selected_reset_60",
    name: "筋膜線指定整理｜60 分鐘",
    price_twd: 2300,
    duration_minutes: 60,
    description:
      "鎖定特定筋膜線或特定區域處理，適合已知道自己想處理哪條線、哪個限制或特定痠痛點的人。",
  },
  {
    code: "multi_line_reset_90",
    name: "多線整合整理｜90 分鐘",
    price_twd: 3600,
    duration_minutes: 90,
    description:
      "適合多條筋膜線同時失衡、問題範圍較廣或希望進行較完整整體評估與整理者。",
  },
].map((service, index) => ({
  ...service,
  id: `fallback-${service.code}`,
  category: "bodywork",
  display_name_zh: service.name,
  display_name_en: null,
  price: service.price_twd,
  cash_price_twd: null,
  is_active: true,
  is_addon: false,
  is_public_visible: true,
  is_direct_booking_allowed: true,
  is_city_session_allowed: false,
  requires_consultation: false,
  daily_limit: null,
  status: "active",
  sort_order: index,
  booking_note: service.description,
  internal_note: null,
}));

export const PUBLIC_BOOKING_SERVICE_CODES = new Set(
  FALLBACK_BOOKING_SERVICES.map((service) => service.code),
);

export function getPublicBookingServices(
  services: BookingService[] | null | undefined,
) {
  const allowedByCode = new Map(
    (services ?? [])
      .filter(
        (service) =>
          service.code && PUBLIC_BOOKING_SERVICE_CODES.has(service.code),
      )
      .map((service) => [service.code, service]),
  );

  return FALLBACK_BOOKING_SERVICES.map(
    (fallback) => allowedByCode.get(fallback.code) ?? fallback,
  );
}

export const FASCIA_LINE_OPTIONS = [
  {
    code: "sbl",
    name: "背側緊繃線｜淺背線 SBL",
    description: "常見於後頸、背部、臀部、腿後側緊繃。",
  },
  {
    code: "sfl",
    name: "前側壓縮線｜淺前線 SFL",
    description: "常見於胸口卡住、肋骨緊、髖屈肌緊、呼吸受限。",
  },
  {
    code: "ll",
    name: "側邊失衡線｜側線 LL",
    description: "常見於身體側邊緊繃、骨盆側傾、單側不穩定。",
  },
  {
    code: "sl",
    name: "旋轉代償線｜螺旋線 SL",
    description: "常見於旋轉受限、核心代償、動作左右不對稱。",
  },
  {
    code: "al",
    name: "肩頸手臂線｜手臂線 AL",
    description: "常見於肩頸緊繃、手臂痠麻、上肢張力高。",
  },
  {
    code: "fl",
    name: "動作連動線｜功能線 FL",
    description: "常見於動作卡卡、發力不順、運動表現受限。",
  },
  {
    code: "dfl",
    name: "深層核心線｜深前線 DFL",
    description: "常見於核心無力、骨盆前傾、腰椎壓力大、呼吸卡住。",
  },
  {
    code: "unknown",
    name: "我不確定，請 Gavin 現場判讀",
    description: "適合不知道該選哪條線，但有明確不舒服或卡住感的人。",
  },
] as const;
