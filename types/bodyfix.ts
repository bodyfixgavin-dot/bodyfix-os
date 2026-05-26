export type BodyFixServiceId =
  | "BF-MI-001"
  | "BF-MI-PKG-001"
  | "BF-MI-PKG-002"
  | "BF-MI-PKG-003"
  | "BF-MI-PKG-004"
  | "BF-BR-001"
  | "BF-BR-002"
  | "BF-BR-EXT-001"
  | "BF-BR-003"
  | "BF-PC-001"
  | "BF-PC-EXT-001"
  | "BF-SR-TR-TXT-001"
  | "BF-SR-TR-TXT-002"
  | "BF-SR-ZW-TXT-001"
  | "BF-SR-ZW-001"
  | "BF-SR-PKG-001";

export type CreditType =
  | "training"
  | "fascia_time"
  | "pelvic_time"
  | "tarot_question"
  | "status_text";

export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "comp";

export type ReadingStatus =
  | "pending"
  | "drafting"
  | "delivered"
  | "upgraded"
  | "canceled";

export type CustomerBalance = {
  customer_id: string;
  customer_name: string;
  service_name: string;
  credit_type: CreditType;
  unit_name: string;
  total_units: number;
  remaining_units: number;
  unit_minutes: number | null;
};

export type AppointmentItemInput = {
  service_id: BodyFixServiceId;
  bucket_id?: string;
  entitlement_id?: string;
  units_to_deduct?: number;
  billing_type: "credit" | "cash" | "package" | "campaign_reward" | "deposit" | "comp";
  unit_price?: number;
  quantity?: number;
  note?: string;
};

export type CompleteAppointmentInput = {
  appointment_id: string;
  customer_id: string;
  items: AppointmentItemInput[];
  today_focus?: string;
  body_status?: string;
  next_focus?: string;
};

export type DigitalReadingOrderInput = {
  customer_id?: string;
  service_id: "BF-SR-ZW-TXT-001" | "BF-SR-TR-TXT-001" | "BF-SR-TR-TXT-002";
  question_text: string;
  input_data?: Record<string, unknown>;
  price: number;
  payment_status?: PaymentStatus;
  delivery_format?: "line_text" | "pdf" | "text";
};
