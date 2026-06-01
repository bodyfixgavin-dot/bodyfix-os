type ReadingOrder = {
  reading_order_id: string;
  service_id: string;
  question_text: string;
  price: number;
  payment_status: string;
  reading_status: string;
  created_at: string;
};

type Props = {
  order: ReadingOrder;
};

export function ReadingOrderCard({ order }: Props) {
  const paidAmount = order.payment_status === "paid" ? order.price : 0;
  const unpaidAmount = Math.max(order.price - paidAmount, 0);

  return (
    <article className="rounded-2xl border border-[rgba(23,35,51,.12)] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-xs font-bold uppercase tracking-[.12em] text-[#9b7550]">{order.service_id}</p>
          <h3 className="mt-1 text-lg font-bold text-[#172333]">紫微 / 塔羅文字訂單</h3>
        </div>
        <span className="rounded-full bg-[#f5f2ec] px-3 py-1 text-sm font-semibold text-[#172333]">{order.reading_status}</span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#6f6a63]">{order.question_text || "尚未填寫問題摘要"}</p>
      <div className="mt-4 grid gap-2 text-sm text-[#172333] sm:grid-cols-2">
        <p><span className="font-semibold text-[#6f6a63]">客戶：</span>尚未串接</p>
        <p><span className="font-semibold text-[#6f6a63]">服務：</span>{order.service_id}</p>
        <p><span className="font-semibold text-[#6f6a63]">應收：</span>NT${Number(order.price ?? 0).toLocaleString("zh-TW")}</p>
        <p><span className="font-semibold text-[#6f6a63]">已收：</span>NT${paidAmount.toLocaleString("zh-TW")}</p>
        <p><span className="font-semibold text-[#6f6a63]">未收：</span>NT${unpaidAmount.toLocaleString("zh-TW")}</p>
        <p><span className="font-semibold text-[#6f6a63]">狀態：</span>{order.payment_status}</p>
      </div>
      <button type="button" className="mt-4 min-h-11 rounded-2xl bg-[#172333] px-4 py-2 text-sm font-bold text-white">
        補款按鈕
      </button>
    </article>
  );
}
