import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClientBooking, ClientCheckin, ClientHomeRecommendation, ClientProfile, ClientServiceRecord } from "@/types/client-portal";

export type ClientPortalData = {
  profile: ClientProfile;
  nextBooking: ClientBooking | null;
  latestRecord: ClientServiceRecord | null;
  recommendations: ClientHomeRecommendation[];
  recentServiceCount: number;
  latestCheckin: ClientCheckin | null;
  completedRecommendationCount: number;
};

export async function loadClientPortalData(supabase: SupabaseClient, authUserId: string): Promise<ClientPortalData | null> {
  const { data: profile, error: profileError } = await supabase
    .from("client_profiles")
    .select("id, auth_user_id, display_name, status")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) return null;

  const today = new Date().toISOString();
  const since = new Date();
  since.setMonth(since.getMonth() - 6);

  const [booking, record, recommendations, serviceCount, checkin, logs] = await Promise.all([
    supabase
      .from("client_bookings")
      .select("id, service_name, start_at, location_label, booking_status")
      .eq("client_profile_id", profile.id)
      .in("booking_status", ["confirmed", "已確認"])
      .gte("start_at", today)
      .order("start_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("client_service_records")
      .select("id, service_date, service_name, session_focus, client_summary, follow_up_focus")
      .eq("client_profile_id", profile.id)
      .eq("client_visible", true)
      .order("service_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("client_home_recommendations")
      .select("id, title, instructions, dosage, caution")
      .eq("client_profile_id", profile.id)
      .eq("client_visible", true)
      .order("sort_order", { ascending: true })
      .limit(3),
    supabase
      .from("client_service_records")
      .select("id", { count: "exact", head: true })
      .eq("client_profile_id", profile.id)
      .eq("client_visible", true)
      .gte("service_date", since.toISOString().slice(0, 10)),
    supabase
      .from("client_checkins")
      .select("id, checkin_date, movement_ease, tension_level")
      .eq("client_profile_id", profile.id)
      .order("checkin_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("client_recommendation_logs")
      .select("recommendation_id")
      .eq("client_profile_id", profile.id)
      .eq("completed_on", new Date().toISOString().slice(0, 10))
  ]);

  const error = booking.error || record.error || recommendations.error || serviceCount.error || checkin.error || logs.error;
  if (error) throw error;

  const completedIds = new Set((logs.data ?? []).map((log) => String(log.recommendation_id)));

  return {
    profile: profile as ClientProfile,
    nextBooking: (booking.data as ClientBooking | null) ?? null,
    latestRecord: (record.data as ClientServiceRecord | null) ?? null,
    recommendations: ((recommendations.data ?? []) as ClientHomeRecommendation[]).map((item) => ({ ...item, completed_today: completedIds.has(item.id) })),
    recentServiceCount: serviceCount.count ?? 0,
    latestCheckin: (checkin.data as ClientCheckin | null) ?? null,
    completedRecommendationCount: completedIds.size
  };
}
