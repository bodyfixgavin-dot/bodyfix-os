import {
  createSupabaseAdminClient,
  getSupabaseAdminEnvStatus,
  getSupabaseBrowserEnvStatus
} from "@/lib/supabase/server";

export type PulseStatus = "危險" | "注意" | "穩定";
export type PulseMetrics = {
  date: string;
  todayIncome: number;
  todayTarget: number;
  todayRemaining: number;
  monthTarget: number;
  monthIncome: number;
  monthRemaining: number;
  remainingWorkdays: number;
  appointmentsNext7Days: number;
  status: PulseStatus;
  error?: string;
  debug?: PulseDebug;
};

type PulseSettings = {
  month_target: number;
  period_start: string;
  period_end: string;
  rest_weekdays: number[];
};

type PulseIncomeEntry = { entry_date: string; amount: number };

type PulseDebug = {
  usingFallback: boolean;
  source: "supabase" | "fallback";
  errors: string[];
  supabaseBrowserEnv: ReturnType<typeof getSupabaseBrowserEnvStatus>;
  supabaseAdminEnv: ReturnType<typeof getSupabaseAdminEnvStatus>;
};

export const demoFollowups = [
  ["勁甫", "2026-06-03", "肩胛、手臂、腰臀", "LINE", "高"],
  ["LRC", "2026-05-29", "肩背痠、重訓型", "IG", "高"],
  ["蜜汁熊", "2026-05-21", "肩背痠緊", "LINE", "高"],
  ["Kai", "2026-05-16", "腰痠、髖內外緊", "IG", "高"],
  ["Patrick", "2026-05-15", "肩膀沾黏、酸痛", "LINE", "高"],
  ["Dustin Shen", "2026-04-30", "腰舊傷、運動表現", "IG", "中"],
  ["Albert", "2026-04-30", "肩頸酸緊", "LINE", "中"],
  ["Johnny", "2026-04-24", "背部緊", "IG", "中"],
  ["Shawn翔", "2026-05-09", "闊背、脊柱、腰方緊", "LINE", "中"],
  ["Chester", "2026-05-02", "腰部、臀部痠緊", "LINE", "中"]
];

const TAIPEI = "Asia/Taipei";
const FALLBACK_SETTINGS: PulseSettings = {
  month_target: 150000,
  period_start: "2026-06-14",
  period_end: "2026-06-30",
  rest_weekdays: [2]
};
const FALLBACK_INCOME: PulseIncomeEntry[] = [
  { entry_date: "2026-06-14", amount: 2000 },
  { entry_date: "2026-06-14", amount: 2300 }
];
const GENERIC_PULSE_ERROR = "Pulse 資料讀取失敗，請檢查 Supabase env 或 API";

export function localDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TAIPEI,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function remainingWorkdays(today: string, end: string, rest = [2]) {
  let count = 0;
  for (
    const d = new Date(`${today}T12:00:00+08:00`), e = new Date(`${end}T12:00:00+08:00`);
    d <= e;
    d.setDate(d.getDate() + 1)
  ) {
    if (!rest.includes(d.getDay())) count++;
  }
  return count;
}

function formatError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "Unknown Pulse data error";
}

export async function getPulseMetrics({ debug = false }: { debug?: boolean } = {}): Promise<PulseMetrics> {
  const date = localDate();
  const errors: string[] = [];
  let settings = FALLBACK_SETTINGS;
  let income = FALLBACK_INCOME;
  let appointmentCount = 1;
  let source: PulseDebug["source"] = "fallback";

  const supabaseBrowserEnv = getSupabaseBrowserEnvStatus();
  const supabaseAdminEnv = getSupabaseAdminEnvStatus();

  try {
    const db = createSupabaseAdminClient();

    if (!db) {
      errors.push(...supabaseAdminEnv.errors, ...supabaseBrowserEnv.errors);
    } else {
      const settingsResult = await db.from("pulse_settings").select("*").limit(1).maybeSingle();
      if (settingsResult.error) throw settingsResult.error;
      if (settingsResult.data) settings = settingsResult.data as PulseSettings;

      const incomeResult = await db
        .from("pulse_income_entries")
        .select("entry_date,amount")
        .gte("entry_date", settings.period_start)
        .lte("entry_date", settings.period_end);
      if (incomeResult.error) throw incomeResult.error;
      if (incomeResult.data) income = incomeResult.data as PulseIncomeEntry[];

      const end = new Date(`${date}T12:00:00+08:00`);
      end.setDate(end.getDate() + 6);
      const appointmentResult = await db
        .from("pulse_appointments")
        .select("id", { count: "exact", head: true })
        .gte("appointment_date", date)
        .lte("appointment_date", localDate(end))
        .in("status", ["已排", "待確認"]);
      if (appointmentResult.error) throw appointmentResult.error;
      appointmentCount = appointmentResult.count ?? 0;
      source = "supabase";
    }
  } catch (error) {
    errors.push(formatError(error));
  }

  const monthIncome = income.reduce((n, x) => n + x.amount, 0);
  const todayIncome = income.filter((x) => x.entry_date === date).reduce((n, x) => n + x.amount, 0);
  const monthRemaining = Math.max(0, settings.month_target - monthIncome);
  const workdays = Math.max(1, remainingWorkdays(date, settings.period_end, settings.rest_weekdays));
  const todayTarget = Math.ceil(monthRemaining / workdays);
  const todayRemaining = Math.max(0, todayTarget - todayIncome);
  const status: PulseStatus = appointmentCount >= 8 ? "穩定" : appointmentCount >= 4 ? "注意" : "危險";
  const hasError = errors.length > 0;

  return {
    date,
    todayIncome,
    todayTarget,
    todayRemaining,
    monthTarget: settings.month_target,
    monthIncome,
    monthRemaining,
    remainingWorkdays: workdays,
    appointmentsNext7Days: appointmentCount,
    status,
    ...(hasError ? { error: GENERIC_PULSE_ERROR } : {}),
    ...(debug || hasError
      ? {
          debug: {
            usingFallback: source === "fallback",
            source,
            errors: Array.from(new Set(errors)),
            supabaseBrowserEnv,
            supabaseAdminEnv
          }
        }
      : {})
  };
}

export const money = (n: number) =>
  new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }).format(n);
