import { SupabaseNotConnectedState } from "@/components/SupabaseNotConnectedState";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { QuickCheckoutPage } from "@/components/QuickCheckoutPage";
import { INTEGRATED_24_PLUS_12_PAYMENT_RULE } from "@/lib/bodyfix/flexible-payment";

export const dynamic = "force-dynamic";

type BalanceRow = {
  customer_id: string;
  customer_name?: string | null;
  service_name?: string | null;
  credit_type?: string | null;
  remaining_units?: number | string | null;
};

type LedgerRow = {
  customer_id?: string | null;
  amount?: number | string | null;
  payment_status?: string | null;
  entry_type?: string | null;
  note?: string | null;
};

type PaymentRow = {
  customer_id?: string | null;
  amount?: number | string | null;
  payment_status?: string | null;
  note?: string | null;
};

type ServiceRecordRow = {
  client_id?: string | null;
  customer_id?: string | null;
  service_date?: string | null;
  service_name_snapshot?: string | null;
  service_code?: string | null;
};

export default async function AppointmentsPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseNotConnectedState />;
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data: balances } = await supabase
    .from("customer_balances")
    .select("customer_id,customer_name,service_name,credit_type,remaining_units")
    .order("customer_name", { ascending: true })
    .limit(300);

  const customerIds = Array.from(new Set(((balances ?? []) as BalanceRow[]).map((row) => row.customer_id).filter(Boolean)));

  const [{ data: ledgerRows }, { data: paymentRows }, { data: serviceRecords }] = await Promise.all([
    supabase
      .from("ledger_entries")
      .select("customer_id,amount,payment_status,entry_type,note")
      .in("customer_id", customerIds.length > 0 ? customerIds : ["00000000-0000-0000-0000-000000000000"]),
    supabase
      .from("payments")
      .select("customer_id,amount,payment_status,note")
      .in("customer_id", customerIds.length > 0 ? customerIds : ["00000000-0000-0000-0000-000000000000"]),
    supabase
      .from("service_records")
      .select("client_id,customer_id,service_date,service_name_snapshot,service_code")
      .in("customer_id", customerIds.length > 0 ? customerIds : ["00000000-0000-0000-0000-000000000000"])
      .order("service_date", { ascending: false })
      .limit(200)
  ]);

  const normalized = customerIds.map((customerId) => {
    const customerRows = ((balances ?? []) as BalanceRow[]).filter((row) => row.customer_id === customerId);
    const customerName = customerRows.find((row) => row.customer_name)?.customer_name ?? "未命名客戶";
    const trainingRemaining = customerRows
      .filter((row) => row.credit_type === "training" || row.credit_type === "training_session")
      .reduce((sum, row) => sum + Number(row.remaining_units ?? 0), 0);
    const bodyworkRemaining = customerRows
      .filter((row) => row.credit_type === "fascia_time" || row.credit_type === "pelvic_time" || row.credit_type === "bodywork_session")
      .reduce((sum, row) => sum + Number(row.remaining_units ?? 0), 0);
    const customerLedgerRows = ((ledgerRows ?? []) as LedgerRow[]).filter((row) => row.customer_id === customerId);
    const unpaidAmount = customerLedgerRows
      .filter((row) => row.payment_status === "unpaid" || row.entry_type === "accounts_receivable")
      .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    const hasFlexiblePaymentPlan = customerLedgerRows.some((row) => row.note?.includes("payment_mode=彈性補款模式"));
    const flexibleTopupPaid = ((paymentRows ?? []) as PaymentRow[])
      .filter((row) => row.customer_id === customerId && row.payment_status === "paid" && row.note?.includes("payment_entry_type=flexible_payment_topup"))
      .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    const flexibleOutstanding = hasFlexiblePaymentPlan ? Math.max(0, unpaidAmount - flexibleTopupPaid) : null;
    const flexiblePaymentStatus = hasFlexiblePaymentPlan
      ? (flexibleOutstanding === 0 ? "paid" as const : "payment_in_progress" as const)
      : null;
    const latestService = ((serviceRecords ?? []) as ServiceRecordRow[]).find((row) => row.customer_id === customerId || row.client_id === customerId);

    return {
      customer_id: customerId,
      customer_name: customerName,
      plan_name: customerRows[0]?.service_name ?? "未設定方案",
      training_remaining: trainingRemaining,
      bodywork_remaining: bodyworkRemaining,
      unpaid_amount: unpaidAmount,
      flexible_payment_outstanding: flexibleOutstanding,
      flexible_payment_total_paid: hasFlexiblePaymentPlan ? INTEGRATED_24_PLUS_12_PAYMENT_RULE.contractAmount - (flexibleOutstanding ?? 0) : null,
      flexible_payment_status: flexiblePaymentStatus,
      latest_service_label: latestService?.service_name_snapshot ?? latestService?.service_code ?? null,
      latest_service_date: latestService?.service_date ?? null
    };
  });

  return <QuickCheckoutPage customers={normalized} />;
}
