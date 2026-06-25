"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseUserServerClient } from "@/lib/supabase/server";

export async function markRecommendationComplete(recommendationId: string) {
  const supabase = await createSupabaseUserServerClient();
  if (!supabase) return { ok: false, message: "Supabase 尚未設定。" };

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, message: "請先登入。" };

  const { data: profile, error: profileError } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile) return { ok: false, message: "尚未連結客戶檔案。" };

  const { data: recommendation, error: recommendationError } = await supabase
    .from("client_home_recommendations")
    .select("id")
    .eq("id", recommendationId)
    .eq("client_profile_id", profile.id)
    .eq("client_visible", true)
    .maybeSingle();

  if (recommendationError || !recommendation) return { ok: false, message: "找不到可標記的居家建議。" };

  const { error } = await supabase.from("client_recommendation_logs").upsert({
    recommendation_id: recommendation.id,
    client_profile_id: profile.id,
    completed_on: new Date().toISOString().slice(0, 10)
  }, { onConflict: "recommendation_id,client_profile_id,completed_on" });

  if (error) return { ok: false, message: "標記失敗，請稍後再試。" };
  revalidatePath("/client");
  return { ok: true, message: "已標記今天完成。" };
}


export async function signOutClientPortal() {
  const supabase = await createSupabaseUserServerClient();
  await supabase?.auth.signOut();
  redirect("/client");
}
