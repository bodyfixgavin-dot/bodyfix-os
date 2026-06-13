"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CustomerOverview = {
  customer_id: string;
  client_code: string | null;
  customer_name: string;
  line_id: string | null;
  current_plan: string;
  training_remaining: number;
  bodywork_remaining: number;
  has_training_balance: boolean;
  has_bodywork_balance: boolean;
  outstanding_amount: number;
  latest_service_label: string | null;
  latest_service_date: string | null;
};

type UnpaidOverview = {
  id: string;
  customer_id: string;
  customer_name: string;
  package_name: string;
  paid_amount: number;
  outstanding_amount: number;
  payment_mode: string;
  payment_status: string;
};

type FlexiblePaymentOverview = {
  id: string;
  customer_id: string;
  customer_name: string;
  package_name: string;
  paid_amount: number;
  outstanding_amount: number;
  latest_payment_at: string | null;
};

type CustomersPayload = {
  customers: CustomerOverview[];
  unpaid: UnpaidOverview[];
  flexiblePayments: FlexiblePaymentOverview[];
};

type TabKey = "all" | "low" | "unpaid" | "flexible";

const tabs: Array<{ key: TabKey; label: string; description: string }> = [
  { key: "all", label: "全部客戶", description: "顯示所有客戶與目前方案摘要。" },
  { key: "low", label: "低餘額提醒", description: "剩餘教練課或身體整理 ≤ 3。" },
  { key: "unpaid", label: "未收款", description: "顯示 outstanding_amount > 0 的方案或帳款。" },
  { key: "flexible", label: "彈性補款中", description: "顯示 flexible_payment 且 payment_in_progress 的高單價方案。" }
];

function money(amount: number) {
  return `NT$${Math.max(0, amount).toLocaleString("zh-TW")}`;
}

function formatDate(date: string | null) {
  return date || "—";
}

function formatRemaining(hasBalance: boolean, remaining: number) {
  return hasBalance ? String(remaining) : "—";
}

function EmptyState({ activeTab }: { activeTab: TabKey }) {
  const isAllTab = activeTab === "all";

  return (
    <section className="bf-card bf-empty-state" aria-live="polite">
      <div className="bf-empty-icon" aria-hidden="true">🏜️</div>
      <div>
        <h2>目前沒有符合條件的客戶。</h2>
        <p>
          你可以先新增客戶，或建立方案餘額。當客戶剩餘額度 ≤ 3、出現未收款，或進入彈性補款狀態時，這裡會自動顯示提醒。
        </p>
        {isAllTab ? <p className="bf-muted-note">全部客戶目前也沒有資料；新增第一位客戶後，這裡就會變成 CRM 總表。</p> : null}
      </div>
      <div className="bf-empty-actions">
        <Link className="bf-primary bf-link-button" href="/clinic/clients/new">新增客戶</Link>
        <button className="bf-secondary bf-link-button" type="button" disabled title="規劃中">建立方案（規劃中）</button>
        <Link className="bf-secondary bf-link-button" href="/clinic">返回 BodyFix 後台</Link>
      </div>
    </section>
  );
}

function DataStatus({ loading, error }: { loading: boolean; error: string | null }) {
  if (loading) return <div className="bf-notice bf-section-gap">資料讀取中</div>;
  if (error) return <div className="bf-notice bf-section-gap" role="alert">資料讀取失敗，請稍後再試。</div>;
  return null;
}

function CustomerTable({ rows }: { rows: CustomerOverview[] }) {
  return (
    <section className="bf-card bf-section-gap bf-table-wrap" aria-label="全部客戶">
      <table className="bf-admin-table bf-client-balance-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>LINE ID</th>
            <th>目前方案</th>
            <th>剩餘教練課</th>
            <th>剩餘身體整理</th>
            <th>未收款</th>
            <th>最近一次服務</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((customer) => (
            <tr key={customer.customer_id}>
              <td>
                <Link href={`/clinic/clients/${customer.customer_id}`}>
                  {customer.customer_name}{customer.client_code ? `｜${customer.client_code}` : ""}
                </Link>
              </td>
              <td>{customer.line_id ?? "—"}</td>
              <td>{customer.current_plan}</td>
              <td>{formatRemaining(customer.has_training_balance, customer.training_remaining)}</td>
              <td>{formatRemaining(customer.has_bodywork_balance, customer.bodywork_remaining)}</td>
              <td>{money(customer.outstanding_amount)}</td>
              <td>{customer.latest_service_label ?? "—"}<br /><span className="bf-table-muted">{formatDate(customer.latest_service_date)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function UnpaidTable({ rows }: { rows: UnpaidOverview[] }) {
  return (
    <section className="bf-card bf-section-gap bf-table-wrap" aria-label="未收款">
      <table className="bf-admin-table bf-client-balance-table">
        <thead>
          <tr>
            <th>客戶名稱</th>
            <th>方案名稱</th>
            <th>已收金額</th>
            <th>未收金額</th>
            <th>付款模式</th>
            <th>付款狀態</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td><Link href={`/clinic/clients/${row.customer_id}`}>{row.customer_name}</Link></td>
              <td>{row.package_name}</td>
              <td>{money(row.paid_amount)}</td>
              <td>{money(row.outstanding_amount)}</td>
              <td>{row.payment_mode}</td>
              <td>{row.payment_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function FlexibleTable({ rows }: { rows: FlexiblePaymentOverview[] }) {
  return (
    <section className="bf-card bf-section-gap bf-table-wrap" aria-label="彈性補款中">
      <table className="bf-admin-table bf-client-balance-table">
        <thead>
          <tr>
            <th>客戶名稱</th>
            <th>方案名稱</th>
            <th>已收金額</th>
            <th>未收金額</th>
            <th>最近一次補款</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td><Link href={`/clinic/clients/${row.customer_id}`}>{row.customer_name}</Link></td>
              <td>{row.package_name}</td>
              <td>{money(row.paid_amount)}</td>
              <td>{money(row.outstanding_amount)}</td>
              <td>{formatDate(row.latest_payment_at)}</td>
              <td><button className="bf-small-btn" type="button" disabled title="規劃中">新增補款（規劃中）</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function CustomerBalanceOverview() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [payload, setPayload] = useState<CustomersPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadCustomers() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/dashboard/customers", { cache: "no-store" });
        if (!response.ok) throw new Error(`Dashboard customers API failed with status ${response.status}`);
        const json = (await response.json()) as CustomersPayload;
        if (alive) setPayload(json);
      } catch (fetchError) {
        console.error("Failed to load customer balance overview", fetchError);
        if (alive) setError("資料讀取失敗，請稍後再試。");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadCustomers();
    return () => {
      alive = false;
    };
  }, []);

  const lowBalanceRows = useMemo(() => {
    return (payload?.customers ?? []).filter((customer) =>
      (customer.has_training_balance && customer.training_remaining <= 3) ||
      (customer.has_bodywork_balance && customer.bodywork_remaining <= 3)
    );
  }, [payload]);

  const tabCounts: Record<TabKey, number> = {
    all: payload?.customers.length ?? 0,
    low: lowBalanceRows.length,
    unpaid: payload?.unpaid.length ?? 0,
    flexible: payload?.flexiblePayments.length ?? 0
  };
  const activeRowsCount = tabCounts[activeTab];

  return (
    <main className="bf-container bf-os-page bf-client-balance-page">
      <section className="bf-hero">
        <div className="bf-brand"><span className="bf-logo-box">BF</span> BodyFix Operating System</div>
        <p className="bf-kicker">Client balance overview</p>
        <h1>客戶列表 / 方案餘額</h1>
        <p className="bf-subtitle">查看客戶方案、剩餘堂數、未收款與續約提醒。</p>
        <p className="bf-body-copy">此頁已升級為 CRM 總覽；低餘額提醒只是其中一個分頁，不再讓沒有提醒資料時顯示空白。</p>
      </section>

      <DataStatus loading={loading} error={error} />

      {!loading && !error ? (
        <>
          <section className="bf-card bf-section-gap">
            <div className="bf-tabs" role="tablist" aria-label="客戶列表與方案餘額分頁">
              {tabs.map((tab) => (
                <button
                  aria-selected={activeTab === tab.key}
                  className="bf-tab"
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  role="tab"
                  type="button"
                >
                  <span>{tab.label}</span>
                  <span className="bf-tab-count" aria-label={`${tab.label} ${tabCounts[tab.key]} 筆`}>{tabCounts[tab.key]}</span>
                </button>
              ))}
            </div>
            <p className="bf-muted-note">{tabs.find((tab) => tab.key === activeTab)?.description} 目前筆數：{activeRowsCount}</p>
          </section>

          {activeRowsCount === 0 ? <EmptyState activeTab={activeTab} /> : null}
          {activeTab === "all" && activeRowsCount > 0 ? <CustomerTable rows={payload?.customers ?? []} /> : null}
          {activeTab === "low" && activeRowsCount > 0 ? <CustomerTable rows={lowBalanceRows} /> : null}
          {activeTab === "unpaid" && activeRowsCount > 0 ? <UnpaidTable rows={payload?.unpaid ?? []} /> : null}
          {activeTab === "flexible" && activeRowsCount > 0 ? <FlexibleTable rows={payload?.flexiblePayments ?? []} /> : null}
        </>
      ) : null}
    </main>
  );
}
