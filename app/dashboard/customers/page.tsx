import { SupabaseNotConnectedState } from "@/components/SupabaseNotConnectedState";
import { CustomerBalanceOverview } from "@/components/CustomerBalanceOverview";
import { hasSupabaseEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default function CustomersPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseNotConnectedState />;
  }

  return <CustomerBalanceOverview />;
}
