import type { CustomerBalance } from "@/types/bodyfix";

type Props = {
  balance: CustomerBalance;
};

export function CustomerBalanceCard({ balance }: Props) {
  const isLow = balance.remaining_units <= 3;
  const displayRemaining =
    balance.unit_minutes && balance.unit_minutes > 0
      ? `${balance.remaining_units} 個 ${balance.unit_minutes} 分鐘單位`
      : `${balance.remaining_units} ${balance.unit_name}`;
  const displayTotal =
    balance.unit_minutes && balance.unit_minutes > 0
      ? `${balance.total_units} 個 ${balance.unit_minutes} 分鐘單位`
      : `${balance.total_units} ${balance.unit_name}`;
  const hourText =
    balance.unit_minutes && balance.unit_minutes > 0
      ? `約 ${(balance.remaining_units * balance.unit_minutes) / 60} 小時`
      : null;

  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{balance.customer_name}</p>
          <h3 className="text-lg font-semibold">{balance.service_name}</h3>
        </div>
        {isLow ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">續約提醒</span>
        ) : null}
      </div>
      <div className="mt-4 space-y-1">
        <p>剩餘：{displayRemaining}</p>
        <p className="text-sm text-gray-500">總額度：{displayTotal}</p>
        {hourText ? <p className="text-sm text-gray-500">換算：{hourText}</p> : null}
      </div>
    </div>
  );
}
