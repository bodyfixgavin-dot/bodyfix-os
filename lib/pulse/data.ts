import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseServerClient, getSupabaseBrowserEnvStatus } from "@/lib/supabase/server";

export type PulseStatus = "危險" | "注意" | "穩定";
export type PulseMetrics = { date: string; todayIncome: number; todayTarget: number; todayRemaining: number; monthTarget: number; monthIncome: number; monthRemaining: number; remainingWorkdays: number; appointmentsNext7Days: number; status: PulseStatus; error?: string };
export const money = (n: number) => `NT$${n.toLocaleString("zh-TW")}`;
export const demoFollowups = [
  ["勁甫", "2026-06-03", "肩胛、手臂、腰臀", "LINE", "高"], ["LRC", "2026-05-29", "肩背痠、重訓型", "IG", "高"], ["蜜汁熊", "2026-05-21", "肩背痠緊", "LINE", "高"], ["Kai", "2026-05-16", "腰痠、髖內外緊", "IG", "高"], ["Patrick", "2026-05-15", "肩膀沾黏、酸痛", "LINE", "高"], ["Dustin Shen", "2026-04-30", "腰舊傷、運動表現", "IG", "中"], ["Albert", "2026-04-30", "肩頸酸緊", "LINE", "中"], ["Johnny", "2026-04-24", "背部緊", "IG", "中"], ["Shawn翔", "2026-05-09", "闊背、脊柱、腰方緊", "LINE", "中"], ["Chester", "2026-05-02", "腰部、臀部痠緊", "LINE", "中"],
];

function localDate(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function remainingWorkdays(start: string, end: string, rests: number[]) {
  let n = 0;
  const d = new Date(`${start}T12:00:00+08:00`);
  const e = new Date(`${end}T12:00:00+08:00`);
  for (; d <= e; d.setDate(d.getDate() + 1)) if (!rests.includes(d.getDay())) n++;
  return n;
}

function monthEnd(date: string) {
  const d = new Date(`${date}T12:00:00+08:00`);
  return localDate(new Date(d.getFullYear(), d.getMonth() + 1, 0, 12));
}

export async function getPulseMetrics(): Promise<PulseMetrics> {
  noStore();
  const date = localDate();
  const fallbackSettings = { month_target: 150000, period_start: date.slice(0, 8) + "01", period_end: monthEnd(date), rest_weekdays: [2] };
  const empty = { date, todayIncome: 0, todayTarget: 0, todayRemaining: 0, monthTarget: fallbackSettings.month_target, monthIncome: 0, monthRemaining: fallbackSettings.month_target, remainingWorkdays: remainingWorkdays(date, fallbackSettings.period_end, fallbackSettings.rest_weekdays), appointmentsNext7Days: 0, status: "危險" as PulseStatus };
  const env = getSupabaseBrowserEnvStatus();
  if (!env.ok) return { ...empty, error: `Supabase 環境變數缺失：${env.missingEnv.join(", ")}` };

  const db = createSupabaseServerClient();
  if (!db) return { ...empty, error: "Supabase 環境變數格式錯誤。" };

  const settingsResult = await db.from("pulse_settings").select("month_target,period_start,period_end,rest_weekdays").limit(1).maybeSingle();
  if (settingsResult.error) return { ...empty, error: settingsResult.error.message };
  const settings = settingsResult.data ?? fallbackSettings;

  const incomeResult = await db.from("pulse_income_entries").select("entry_date,amount").gte("entry_date", settings.period_start).lte("entry_date", settings.period_end);
  if (incomeResult.error) return { ...empty, error: incomeResult.error.message };

  const end = new Date(`${date}T12:00:00+08:00`);
  end.setDate(end.getDate() + 6);
  const appointmentResult = await db.from("pulse_appointments").select("id", { count: "exact", head: true }).gte("appointment_date", date).lte("appointment_date", localDate(end)).in("status", ["已排", "待確認"]);
  if (appointmentResult.error) return { ...empty, error: appointmentResult.error.message };

  const income = incomeResult.data ?? [];
  const monthIncome = income.reduce((n, x) => n + Number(x.amount), 0);
  const todayIncome = income.filter((x) => x.entry_date === date).reduce((n, x) => n + Number(x.amount), 0);
  const monthRemaining = Math.max(0, Number(settings.month_target) - monthIncome);
  const workdays = Math.max(1, remainingWorkdays(date, settings.period_end, settings.rest_weekdays ?? []));
  const todayTarget = Math.ceil(monthRemaining / workdays);
  const todayRemaining = Math.max(0, todayTarget - todayIncome);
  const appointmentCount = appointmentResult.count ?? 0;
  const status: PulseStatus = appointmentCount >= 8 ? "穩定" : appointmentCount >= 4 ? "注意" : "危險";
  return { date, todayIncome, todayTarget, todayRemaining, monthTarget: Number(settings.month_target), monthIncome, monthRemaining, remainingWorkdays: workdays, appointmentsNext7Days: appointmentCount, status };
}
