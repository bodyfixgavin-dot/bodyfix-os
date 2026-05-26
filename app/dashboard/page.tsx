import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">BodyFix OS Dashboard</h1>
      <p className="text-sm text-gray-600">MVP 管理後台，先完成核心流程。</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link className="rounded-xl border p-4 hover:bg-gray-50" href="/dashboard/customers">客戶與餘額</Link>
        <Link className="rounded-xl border p-4 hover:bg-gray-50" href="/dashboard/appointments">預約與扣堂</Link>
        <Link className="rounded-xl border p-4 hover:bg-gray-50" href="/dashboard/readings">紫微/塔羅文字單</Link>
      </div>
    </main>
  );
}
