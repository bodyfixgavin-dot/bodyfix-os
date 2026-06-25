export type ClientProfile = {
  id: string;
  auth_user_id: string;
  display_name: string | null;
  status: string;
};

export type ClientBooking = {
  id: string;
  service_name: string;
  start_at: string;
  location_label: string | null;
  booking_status: string;
};

export type ClientServiceRecord = {
  id: string;
  service_date: string;
  service_name: string;
  session_focus: string | null;
  client_summary: string | null;
  follow_up_focus: string | null;
};

export type ClientHomeRecommendation = {
  id: string;
  title: string;
  instructions: string;
  dosage: string | null;
  caution: string | null;
  completed_today?: boolean;
};

export type ClientCheckin = {
  id: string;
  checkin_date: string;
  movement_ease: "較容易" | "差不多" | "較不容易" | "尚未回報" | null;
  tension_level: "較容易" | "差不多" | "較不容易" | "尚未回報" | null;
};
