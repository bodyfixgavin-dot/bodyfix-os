export type BookingCity = "taipei" | "taichung" | "kaohsiung";
export type SlotType = "normal" | "late_night" | "last_minute" | "vip_hold";
export type SlotStatus = "available" | "closed";
export type BookingStatus = "held" | "confirmed" | "cancelled" | "completed" | "expired";
export type ServiceStatus = "active" | "limited" | "coming_soon" | "archived" | "draft";

export type BookingService = {
  id: string;
  code: string | null;
  name: string;
  category: string | null;
  display_name_zh: string | null;
  display_name_en: string | null;
  duration_minutes: number | null;
  price: number | null;
  price_twd: number | null;
  cash_price_twd: number | null;
  is_active: boolean;
  is_addon: boolean;
  is_public_visible: boolean;
  is_direct_booking_allowed: boolean;
  is_city_session_allowed: boolean;
  requires_consultation: boolean;
  daily_limit: number | null;
  status: ServiceStatus;
  sort_order: number;
  booking_note: string | null;
  internal_note: string | null;
  description?: string;
};

export type AvailabilitySlot = {
  id: string;
  starts_at: string;
  ends_at: string;
  city: BookingCity;
  slot_type: SlotType;
  status: SlotStatus;
  note: string | null;
};

export type BookingRequest = {
  id: string;
  slot_id: string;
  service_id: string;
  client_name: string;
  line_id: string;
  phone: string | null;
  body_notes: string | null;
  message: string | null;
  status: BookingStatus;
  hold_expires_at: string | null;
  created_at: string;
  availability_slots?: AvailabilitySlot | null;
  services?: BookingService | null;
};
