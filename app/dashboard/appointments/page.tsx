import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { QuickCheckoutPage } from "@/components/QuickCheckoutPage";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-6">
        <h1 className="text-2xl font-bold">BodyFix OS 尚未連接 Supabase</h1>
        <p className="text-sm text-gray-600">
          請先在 Vercel Environment Variables 設定 NEXT_PUBLIC_SUPABASE_URL 與 NEXT_PUBLIC_SUPABASE_ANON_KEY。
        </p>
      </main>
    );
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data: customers } = await supabase
    .from("customer_balances")
    .select("customer_id,customer_name")
    .order("customer_name", { ascending: true })
    .limit(100);

  const { data: balances } = await supabase
    .from("customer_balances")
    .select("customer_id,service_name,credit_type,remaining_units");

  const normalized = (customers ?? []).map((c: any) => {
    const customerRows = (balances ?? []).filter((b: any) => b.customer_id === c.customer_id);
    const trainingRemaining = customerRows
      .filter((b: any) => b.credit_type === "training")
      .reduce((sum: number, row: any) => sum + Number(row.remaining_units ?? 0), 0);
    const fasciaRemainingMinutes = customerRows
      .filter((b: any) => b.credit_type === "fascia_time")
      .reduce((sum: number, row: any) => sum + Number(row.remaining_units ?? 0), 0);

    return {
      customer_id: c.customer_id,
      customer_name: c.customer_name,
      plan_name: customerRows[0]?.service_name ?? "未設定方案",
      training_remaining: trainingRemaining,
      fascia_remaining_minutes: fasciaRemainingMinutes
    };
  });

  return <QuickCheckoutPage customers={normalized} />;
}
