import { NextResponse } from "next/server";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

type ClientRow = {
  id: string;
  client_code?: string | null;
  display_name?: string | null;
  client_name?: string | null;
  nickname?: string | null;
  line_id?: string | null;
  last_session_date?: string | null;
  updated_at?: string | null;
};

type BalanceRow = {
  customer_id?: string | null;
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
  created_at?: string | null;
};

type ServiceRecordRow = {
  client_id?: string | null;
  customer_id?: string | null;
  service_date?: string | null;
  service_name_snapshot?: string | null;
  service_code?: string | null;
};

type PackagePurchaseRow = {
  id?: string | null;
  client_id?: string | null;
  customer_id?: string | null;
  client_name?: string | null;
  customer_name?: string | null;
  package_name?: string | null;
  service_name?: string | null;
  paid_amount?: number | string | null;
  outstanding_amount?: number | string | null;
  payment_mode?: string | null;
  payment_status?: string | null;
  latest_payment_at?: string | null;
  last_payment_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

const EMPTY_UUID = "00000000-0000-0000-0000-000000000000";

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function displayClientName(client?: ClientRow, fallback?: string | null) {
  return client?.display_name ?? client?.client_name ?? client?.nickname ?? fallback ?? "未命名客戶";
}

function includesPaymentMode(note: string | null | undefined, expected: string) {
  return (note ?? "").toLowerCase().includes(expected.toLowerCase());
}

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client is unavailable" }, { status: 503 });
  }

  const clientsQuery = await supabase
    .from("clients")
    .select("id, client_code, display_name, client_name, nickname, line_id, last_session_date, updated_at")
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(500);

  if (clientsQuery.error) {
    console.error("Failed to load dashboard customers clients", clientsQuery.error);
    return NextResponse.json({ error: "資料讀取失敗，請稍後再試。" }, { status: 500 });
  }

  const clients = (clientsQuery.data ?? []) as ClientRow[];
  const clientIds = clients.map((client) => client.id).filter(Boolean);
  const idsForFilter = clientIds.length > 0 ? clientIds : [EMPTY_UUID];

  const [balancesQuery, ledgerQuery, serviceRecordsQuery, packagePurchasesQuery] = await Promise.all([
    supabase
      .from("customer_balance_view")
      .select("customer_id, customer_name, service_name, credit_type, remaining_units")
      .order("remaining_units", { ascending: true }),
    supabase
      .from("ledger_entries")
      .select("customer_id, amount, payment_status, entry_type, note, created_at")
      .in("customer_id", idsForFilter)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("service_records")
      .select("client_id, customer_id, service_date, service_name_snapshot, service_code")
      .or(`client_id.in.(${idsForFilter.join(",")}),customer_id.in.(${idsForFilter.join(",")})`)
      .order("service_date", { ascending: false })
      .limit(500),
    supabase
      .from("package_purchases")
      .select("id, client_id, customer_id, client_name, customer_name, package_name, service_name, paid_amount, outstanding_amount, payment_mode, payment_status, latest_payment_at, last_payment_at, updated_at, created_at")
      .in("client_id", idsForFilter)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(500)
  ]);

  if (balancesQuery.error) console.error("Failed to load customer balance view", balancesQuery.error);
  if (ledgerQuery.error) console.error("Failed to load ledger entries", ledgerQuery.error);
  if (serviceRecordsQuery.error) console.error("Failed to load service records", serviceRecordsQuery.error);
  if (packagePurchasesQuery.error) console.error("Failed to load package purchases", packagePurchasesQuery.error);

  const balances = balancesQuery.error ? [] : ((balancesQuery.data ?? []) as BalanceRow[]);
  const ledgerRows = ledgerQuery.error ? [] : ((ledgerQuery.data ?? []) as LedgerRow[]);
  const serviceRecords = serviceRecordsQuery.error ? [] : ((serviceRecordsQuery.data ?? []) as ServiceRecordRow[]);
  const packagePurchases = packagePurchasesQuery.error ? [] : ((packagePurchasesQuery.data ?? []) as PackagePurchaseRow[]);

  const clientById = new Map(clients.map((client) => [client.id, client]));
  const allCustomerIds = Array.from(new Set([...clientIds, ...balances.map((row) => row.customer_id).filter(Boolean) as string[]]));

  const customers = allCustomerIds.map((customerId) => {
    const client = clientById.get(customerId);
    const customerBalances = balances.filter((row) => row.customer_id === customerId);
    const customerPackages = packagePurchases.filter((row) => row.client_id === customerId || row.customer_id === customerId);
    const trainingBalances = customerBalances.filter((row) => row.credit_type === "training" || row.credit_type === "training_session");
    const bodyworkBalances = customerBalances.filter((row) => ["fascia_time", "pelvic_time", "bodywork_session"].includes(row.credit_type ?? ""));
    const trainingRemaining = trainingBalances.reduce((sum, row) => sum + toNumber(row.remaining_units), 0);
    const bodyworkRemaining = bodyworkBalances.reduce((sum, row) => sum + toNumber(row.remaining_units), 0);
    const unpaidLedgerAmount = ledgerRows
      .filter((row) => row.customer_id === customerId && (row.payment_status === "unpaid" || row.entry_type === "accounts_receivable"))
      .reduce((sum, row) => sum + toNumber(row.amount), 0);
    const packageOutstanding = customerPackages.reduce((sum, row) => sum + toNumber(row.outstanding_amount), 0);
    const latestService = serviceRecords.find((row) => row.client_id === customerId || row.customer_id === customerId);
    const planNames = Array.from(new Set([
      ...customerPackages.map((row) => row.package_name ?? row.service_name).filter(Boolean),
      ...customerBalances.map((row) => row.service_name).filter(Boolean)
    ]));

    return {
      customer_id: customerId,
      client_code: client?.client_code ?? null,
      customer_name: displayClientName(client, customerBalances.find((row) => row.customer_name)?.customer_name),
      line_id: client?.line_id ?? null,
      current_plan: planNames.length > 0 ? planNames.join("、") : "未設定方案",
      training_remaining: trainingRemaining,
      bodywork_remaining: bodyworkRemaining,
      has_training_balance: trainingBalances.length > 0,
      has_bodywork_balance: bodyworkBalances.length > 0,
      outstanding_amount: Math.max(0, packageOutstanding + unpaidLedgerAmount),
      latest_service_label: latestService?.service_name_snapshot ?? latestService?.service_code ?? null,
      latest_service_date: latestService?.service_date ?? client?.last_session_date ?? null
    };
  });

  const unpaidRows = packagePurchases
    .filter((row) => toNumber(row.outstanding_amount) > 0)
    .map((row) => {
      const customerId = row.client_id ?? row.customer_id ?? "";
      return {
        id: row.id ?? `${customerId}-${row.package_name ?? row.service_name ?? "package"}`,
        customer_id: customerId,
        customer_name: displayClientName(clientById.get(customerId), row.client_name ?? row.customer_name),
        package_name: row.package_name ?? row.service_name ?? "未命名方案",
        paid_amount: toNumber(row.paid_amount),
        outstanding_amount: toNumber(row.outstanding_amount),
        payment_mode: row.payment_mode ?? "—",
        payment_status: row.payment_status ?? "—"
      };
    });

  const flexibleRows = packagePurchases
    .filter((row) => row.payment_mode === "flexible_payment" && row.payment_status === "payment_in_progress")
    .map((row) => {
      const customerId = row.client_id ?? row.customer_id ?? "";
      return {
        id: row.id ?? `${customerId}-${row.package_name ?? row.service_name ?? "flexible"}`,
        customer_id: customerId,
        customer_name: displayClientName(clientById.get(customerId), row.client_name ?? row.customer_name),
        package_name: row.package_name ?? row.service_name ?? "未命名方案",
        paid_amount: toNumber(row.paid_amount),
        outstanding_amount: toNumber(row.outstanding_amount),
        latest_payment_at: row.latest_payment_at ?? row.last_payment_at ?? row.updated_at ?? row.created_at ?? null
      };
    });

  const ledgerUnpaidFallback = customers
    .filter((customer) => customer.outstanding_amount > 0 && !unpaidRows.some((row) => row.customer_id === customer.customer_id))
    .map((customer) => ({
      id: `ledger-${customer.customer_id}`,
      customer_id: customer.customer_id,
      customer_name: customer.customer_name,
      package_name: customer.current_plan,
      paid_amount: 0,
      outstanding_amount: customer.outstanding_amount,
      payment_mode: "accounts_receivable",
      payment_status: "unpaid"
    }));

  const flexibleLedgerFallback = ledgerRows
    .filter((row) => row.payment_status === "payment_in_progress" && includesPaymentMode(row.note, "flexible_payment"))
    .map((row, index) => {
      const customerId = row.customer_id ?? "";
      const customer = customers.find((item) => item.customer_id === customerId);
      return {
        id: `ledger-flexible-${customerId}-${index}`,
        customer_id: customerId,
        customer_name: customer?.customer_name ?? "未命名客戶",
        package_name: customer?.current_plan ?? "未設定方案",
        paid_amount: 0,
        outstanding_amount: toNumber(row.amount),
        latest_payment_at: row.created_at ?? null
      };
    });

  return NextResponse.json({
    customers,
    unpaid: [...unpaidRows, ...ledgerUnpaidFallback],
    flexiblePayments: [...flexibleRows, ...flexibleLedgerFallback],
    meta: {
      optionalErrors: {
        balances: Boolean(balancesQuery.error),
        ledger: Boolean(ledgerQuery.error),
        serviceRecords: Boolean(serviceRecordsQuery.error),
        packagePurchases: Boolean(packagePurchasesQuery.error)
      }
    }
  });
}
