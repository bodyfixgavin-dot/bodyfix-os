import { CustomerBalanceCard } from "@/components/CustomerBalanceCard";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { CustomerBalance } from "@/types/bodyfix";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
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
  if (!supabase) {
    return null;
  }

  const { data: balances } = await supabase.from("customer_balance_view").select("*").order("remaining_units", { ascending: true });
  const rows = (balances ?? []) as CustomerBalance[];

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">客戶列表 / 方案餘額</h1>
      <p className="text-sm text-gray-600">剩餘額度 ≤ 3 會顯示續約提醒。</p>
      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((balance) => (
          <CustomerBalanceCard key={`${balance.customer_id}-${balance.service_name}`} balance={balance} />
        ))}
      </div>
    </main>
  );
}
