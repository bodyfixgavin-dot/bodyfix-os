import { ReadingOrderCard } from "@/components/ReadingOrderCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ReadingsPage() {
  const supabase = createSupabaseServerClient();

  const { data: unpaidOrders } = await supabase
    .from("digital_reading_orders")
    .select("reading_order_id,service_id,question_text,price,payment_status,reading_status,created_at")
    .in("payment_status", ["unpaid", "pending"])
    .order("created_at", { ascending: false });

  const { data: campaigns } = await supabase
    .from("campaign_entitlements")
    .select("campaign_name,reward_service_id,reward_note,is_active")
    .eq("is_active", true);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">紫微 / 塔羅文字訂單</h1>
      <p className="text-sm text-gray-600">預設紫微小題文字整理 service_id: BF-SR-ZW-TXT-001，價格 NT$888。</p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">未收款列表</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(unpaidOrders ?? []).map((order: any) => (
            <ReadingOrderCard key={order.reading_order_id} order={order} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">活動贈送權益</h2>
        <div className="space-y-2">
          {(campaigns ?? []).map((campaign: any, index: number) => (
            <div key={index} className="rounded-xl border p-3 text-sm">
              <p className="font-medium">{campaign.campaign_name}</p>
              <p>贈送：{campaign.reward_service_id}</p>
              <p className="text-gray-600">{campaign.reward_note}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
