import { NextRequest, NextResponse } from "next/server";
import { getPulseSupabaseClient, getSupabaseUrlHost, isDebug, jsonError, missingSupabaseEnvResponse } from "@/lib/pulse/api";
import { localDate, remainingWorkdays } from "@/lib/pulse/data";

const TABLE = "pulse_income_entries";

function moneyAmount(row: { amount_actual?: number | null; amount?: number | null }) {
  return Number(row.amount_actual ?? row.amount ?? 0) || 0;
}

export async function GET(request: NextRequest) {
  const debug = isDebug(request);
  const supabaseUrlHost = getSupabaseUrlHost();
  const supabase = getPulseSupabaseClient();
  if (!supabase) return missingSupabaseEnvResponse();

  const date = request.nextUrl.searchParams.get("date") ?? localDate();
  const monthStart = `${date.slice(0, 7)}-01`;
  const monthEnd = `${date.slice(0, 7)}-31`;
  const filters = { entry_date: { gte: monthStart, lte: monthEnd }, today: date };

  const { data, error } = await supabase
    .from(TABLE)
    .select("entry_date, amount_actual, amount")
    .gte("entry_date", monthStart)
    .lte("entry_date", monthEnd);

  if (error) {
    return jsonError(error, 500, debug ? { supabaseUrlHost, table: TABLE, queryFilters: filters, rowCount: 0, rawRows: [], supabaseErrorMessage: error.message } : {});
  }

  const rows = data ?? [];
  const todayIncome = rows.filter((row) => row.entry_date === date).reduce((sum, row) => sum + moneyAmount(row), 0);
  const monthIncome = rows.reduce((sum, row) => sum + moneyAmount(row), 0);
  const monthTarget = 150000;
  const monthRemaining = Math.max(0, monthTarget - monthIncome);
  const workdays = Math.max(1, remainingWorkdays(date, monthEnd, [2]));
  const todayTarget = Math.ceil(monthRemaining / workdays);

  return NextResponse.json({
    ok: true,
    date,
    todayIncome,
    todayTarget,
    todayRemaining: Math.max(0, todayTarget - todayIncome),
    monthTarget,
    monthIncome,
    monthRemaining,
    remainingWorkdays: workdays,
    appointmentsNext7Days: 0,
    status: "危險",
    ...(debug ? { supabaseUrlHost, table: TABLE, queryFilters: filters, rowCount: rows.length, rawRows: rows.slice(0, 5), supabaseErrorMessage: null } : {})
  }, { headers: { "Cache-Control": "no-store" } });
}
