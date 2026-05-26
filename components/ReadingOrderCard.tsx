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
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{order.service_id}</p>
          <h3 className="text-lg font-semibold">紫微 / 塔羅文字訂單</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">{order.reading_status}</span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-gray-700">{order.question_text}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <p>金額：NT${order.price}</p>
        <p>付款：{order.payment_status}</p>
      </div>
    </div>
  );
}
