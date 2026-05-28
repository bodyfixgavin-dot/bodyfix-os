export type BookingCity = "taipei" | "taichung" | "kaohsiung";
export type SlotType = "normal" | "late_night" | "last_minute" | "vip_hold";
export type SlotStatus = "available" | "closed";
export type BookingStatus = "held" | "confirmed" | "cancelled" | "completed" | "expired";

export type BookingService = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
  is_active: boolean;
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
