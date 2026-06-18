import { createSupabaseServerClient } from "@/lib/supabase/server";

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
};

type PulseSettings = {
  month_target: number;
  period_start: string;
  period_end: string;
  rest_weekdays: number[];
};

type IncomeRow = {
  entry_date: string;
  amount_actual: number | null;
  amount: number | null;
};

type PulseQueryDebug = {
  table: "pulse_income_entries";
  dateField: "entry_date";
  amountField: "coalesce(amount_actual, amount, 0)";
};

type PulseErrorResponse = {
  ok: false;
  error: string;
  supabaseUrlHost: string | null;
  query: PulseQueryDebug;
};

export type PulseDebugMetrics = PulseMetrics & {
  ok: true;
  supabaseUrlHost: string | null;
  periodStart: string;
  periodEnd: string;
  rawIncomeRows: IncomeRow[];
  todayIncomeRows: IncomeRow[];
  monthIncomeRows: IncomeRow[];
  errors: string[];
  query: PulseQueryDebug;
};

export type PulseMetricsResponse = PulseMetrics | PulseDebugMetrics | PulseErrorResponse;

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
  ["Chester", "2026-05-02", "腰部、臀部痠緊", "LINE", "中"],
];

const TAIPEI = "Asia/Taipei";
const FALLBACK_SETTINGS: PulseSettings = {
  month_target: 150000,
  period_start: "2026-06-01",
  period_end: "2026-06-30",
  rest_weekdays: [2],
};
const INCOME_QUERY: PulseQueryDebug = {
  table: "pulse_income_entries",
  dateField: "entry_date",
  amountField: "coalesce(amount_actual, amount, 0)",
};

export function localDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TAIPEI,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function remainingWorkdays(today: string, end: string, rest = [2]) {
  let count = 0;
  for (let d = new Date(`${today}T12:00:00+08:00`), e = new Date(`${end}T12:00:00+08:00`); d <= e; d.setDate(d.getDate() + 1)) {
    if (!rest.includes(d.getDay())) count++;
  }
  return count;
}

function supabaseUrlHost() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) return null;

  try {
    return new URL(supabaseUrl).host;
  } catch {
    return null;
  }
}

function amountValue(row: IncomeRow) {
  return row.amount_actual ?? row.amount ?? 0;
}

function calculateMetrics(settings: PulseSettings, monthIncomeRows: IncomeRow[], todayIncomeRows: IncomeRow[], appointmentCount: number, date: string): PulseMetrics {
  const monthIncome = monthIncomeRows.reduce((n, row) => n + amountValue(row), 0);
  const todayIncome = todayIncomeRows.reduce((n, row) => n + amountValue(row), 0);
  const monthRemaining = Math.max(0, settings.month_target - monthIncome);
  const workdays = Math.max(1, remainingWorkdays(date, settings.period_end, settings.rest_weekdays));
  const todayTarget = Math.ceil(monthRemaining / workdays);
  const todayRemaining = Math.max(0, todayTarget - todayIncome);
  const status: PulseStatus = appointmentCount >= 8 ? "穩定" : appointmentCount >= 4 ? "注意" : "危險";

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
  };
}

export function getPulseMetrics(): Promise<PulseMetrics>;
export function getPulseMetrics(options: { debug?: boolean }): Promise<PulseMetricsResponse>;
export async function getPulseMetrics({ debug = false }: { debug?: boolean } = {}): Promise<PulseMetricsResponse> {
  const date = localDate();
  const host = supabaseUrlHost();
  const db = createSupabaseServerClient();

  if (!db) {
    return { ok: false, error: "Missing or invalid NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseUrlHost: host, query: INCOME_QUERY };
  }

  const errors: string[] = [];
  let settings = FALLBACK_SETTINGS;

  const settingsResult = await db.from("pulse_settings").select("month_target,period_start,period_end,rest_weekdays").limit(1).maybeSingle();
  if (settingsResult.error) {
    errors.push(settingsResult.error.message);
  } else if (settingsResult.data) {
    settings = settingsResult.data as PulseSettings;
  }

  const [monthResult, todayResult, rawResult] = await Promise.all([
    db
      .from(INCOME_QUERY.table)
      .select("entry_date,amount_actual,amount")
      .gte(INCOME_QUERY.dateField, settings.period_start)
      .lte(INCOME_QUERY.dateField, settings.period_end),
    db.from(INCOME_QUERY.table).select("entry_date,amount_actual,amount").eq(INCOME_QUERY.dateField, date),
    debug
      ? db.from(INCOME_QUERY.table).select("entry_date,amount_actual,amount").order(INCOME_QUERY.dateField, { ascending: false }).limit(10)
      : Promise.resolve({ data: [], error: null }),
  ]);

  for (const error of [monthResult.error, todayResult.error, rawResult.error]) {
    if (error) errors.push(error.message);
  }

  if (monthResult.error || todayResult.error || rawResult.error) {
    return { ok: false, error: errors.join("; "), supabaseUrlHost: host, query: INCOME_QUERY };
  }

  const end = new Date(`${date}T12:00:00+08:00`);
  end.setDate(end.getDate() + 6);
  const appointmentResult = await db
    .from("pulse_appointments")
    .select("id", { count: "exact", head: true })
    .gte("appointment_date", date)
    .lte("appointment_date", localDate(end))
    .in("status", ["已排", "待確認"]);

  if (appointmentResult.error) errors.push(appointmentResult.error.message);

  const monthIncomeRows = (monthResult.data ?? []) as IncomeRow[];
  const todayIncomeRows = (todayResult.data ?? []) as IncomeRow[];
  const metrics = calculateMetrics(settings, monthIncomeRows, todayIncomeRows, appointmentResult.count ?? 0, date);

  if (!debug) return metrics;

  return {
    ok: true,
    ...metrics,
    supabaseUrlHost: host,
    periodStart: settings.period_start,
    periodEnd: settings.period_end,
    rawIncomeRows: (rawResult.data ?? []) as IncomeRow[],
    todayIncomeRows,
    monthIncomeRows,
    todayIncome: todayIncomeRows.reduce((n, row) => n + amountValue(row), 0),
    monthIncome: monthIncomeRows.reduce((n, row) => n + amountValue(row), 0),
    errors,
    query: INCOME_QUERY,
  };
}

export const money = (n: number) => new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }).format(n);
