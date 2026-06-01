import { SupabaseNotConnectedState } from "@/components/SupabaseNotConnectedState";
import { ReadingOrderCard } from "@/components/ReadingOrderCard";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const quickServices = [
  { name: "紫微文字解析", price: 888, serviceId: "BF-SR-ZW-TXT-001", note: "適合小題文字整理與狀態判讀。" },
  { name: "塔羅文字解析", price: 888, serviceId: "BF-SR-TR-TXT-001", note: "適合牌面整理、提問回覆與方向建議。" },
  { name: "SADM 關係決策整理", price: 1280, serviceId: "BF-SR-SADM-TXT-001", note: "適合關係決策、風險訊號與行動建議。" },
  { name: "延長諮詢", price: 1000, serviceId: "BF-SR-CONSULT-ADDON-030", note: "文字單後續補充與延伸討論。" },
];

export default async function ReadingsPage() {
  if (!hasSupabaseEnv()) {
    return <SupabaseNotConnectedState />;
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const { data: unpaidOrders } = await supabase
    .from("digital_reading_orders")
    .select("reading_order_id,service_id,question_text,price,payment_status,reading_status,created_at")
    .in("payment_status", ["unpaid", "pending"])
    .order("created_at", { ascending: false });

  const { data: campaigns } = await supabase
    .from("campaign_entitlements")
    .select("campaign_name,reward_service_id,reward_note,is_active")
    .eq("is_active", true);

  const hasUnpaidOrders = (unpaidOrders ?? []).length > 0;
  const hasCampaigns = (campaigns ?? []).length > 0;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 overflow-x-hidden px-5 py-6 text-[#172333] sm:px-6">
      <section className="rounded-[28px] border border-[rgba(23,35,51,.16)] bg-[rgba(251,250,246,.92)] p-5 shadow-[0_24px_60px_rgba(23,35,51,.08)] sm:p-7">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#9b7550]">
          <span>BodyFix OS</span>
          <span className="rounded-full border border-[#c6aa87] px-3 py-1">Order desk</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">紫微 / 塔羅文字單管理頁</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6f6a63] sm:text-base">
          用這一頁快速建立文字單、記錄收款、追蹤未收款，並管理活動贈送權益。沒有資料的區塊會顯示明確空白狀態，不再留下大片空白。
        </p>
      </section>

      <section className="rounded-3xl border border-[rgba(23,35,51,.14)] bg-[#fbfaf6] p-4 shadow-sm sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9b7550]">Quick create</p>
        <h2 className="mt-1 text-xl font-semibold">快速建立新單</h2>
        <p className="mt-2 text-sm leading-6 text-[#6f6a63]">先選服務預設卡，再到「新建文字單」填客戶與收款狀態。</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickServices.map((service) => (
            <article key={service.serviceId} className="flex min-h-[190px] flex-col rounded-2xl border border-[rgba(23,35,51,.12)] bg-white p-4 shadow-sm">
              <div className="flex-1">
                <h3 className="text-lg font-bold leading-tight">{service.name}</h3>
                <p className="mt-2 text-2xl font-black text-[#9b7550]">NT${service.price.toLocaleString("zh-TW")}</p>
                <p className="mt-2 break-words rounded-xl bg-[#f5f2ec] p-2 text-xs font-semibold text-[#172333]">{service.serviceId}</p>
                <p className="mt-2 text-sm leading-6 text-[#6f6a63]">{service.note}</p>
              </div>
              <a href="#new-reading-order" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#172333] px-4 py-2 text-sm font-bold text-white">
                建立新單
              </a>
            </article>
          ))}
        </div>
      </section>

      <nav className="flex gap-3 overflow-x-auto rounded-3xl border border-[rgba(23,35,51,.14)] bg-[#fbfaf6] p-3 shadow-sm sm:flex-wrap" aria-label="文字單管理 tabs">
        {["新建文字單", "未收款列表", "活動贈送", "歷史紀錄"].map((tab, index) => (
          <a key={tab} href={["#new-reading-order", "#unpaid-reading-orders", "#campaign-entitlements", "#reading-history"][index]} className="shrink-0 rounded-full border border-[rgba(23,35,51,.14)] bg-white px-4 py-2 text-sm font-bold text-[#172333] hover:border-[#9b7550]">
            {tab}
          </a>
        ))}
      </nav>

      <section id="new-reading-order" className="rounded-3xl border border-[rgba(23,35,51,.14)] bg-[#fbfaf6] p-4 shadow-sm sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9b7550]">Tab 1</p>
        <h2 className="mt-1 text-xl font-semibold">新建文字單</h2>
        <p className="mt-2 text-sm leading-6 text-[#6f6a63]">目前先整理營運表單版面；送出串接可沿用既有 createDigitalReadingOrder action。</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextField label="客戶名稱 / 暱稱" placeholder="例如：小安 / A 客" />
          <TextField label="LINE / IG / 聯絡方式" placeholder="例如：@lineid / IG 帳號" />
          <label className="grid gap-2 text-sm text-[#6f6a63]">
            選擇服務
            <select className="min-h-12 w-full rounded-2xl border border-[rgba(23,35,51,.16)] bg-white p-3 text-base text-[#172333]" defaultValue="BF-SR-ZW-TXT-001">
              {quickServices.map((service) => (
                <option key={service.serviceId} value={service.serviceId}>{service.name}｜{service.serviceId}</option>
              ))}
            </select>
          </label>
          <TextField label="價格" placeholder="NT$888" type="number" />
          <label className="grid gap-2 text-sm text-[#6f6a63]">
            收款狀態
            <select className="min-h-12 w-full rounded-2xl border border-[rgba(23,35,51,.16)] bg-white p-3 text-base text-[#172333]" defaultValue="unpaid">
              <option value="paid">已收款</option>
              <option value="unpaid">未收款，先記帳</option>
              <option value="pending">分次補款 / 待確認</option>
              <option value="campaign_reward">活動贈送</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm text-[#6f6a63]">
            付款方式
            <select className="min-h-12 w-full rounded-2xl border border-[rgba(23,35,51,.16)] bg-white p-3 text-base text-[#172333]" defaultValue="transfer">
              <option value="transfer">轉帳</option>
              <option value="cash">現金</option>
              <option value="linepay">Line Pay</option>
              <option value="other">其他</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm text-[#6f6a63] md:col-span-2">
            備註
            <textarea className="min-h-28 w-full rounded-2xl border border-[rgba(23,35,51,.16)] bg-white p-3 text-base text-[#172333]" placeholder="問題摘要、交付方式、補款提醒或特殊狀態。" />
          </label>
          <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-[rgba(23,35,51,.16)] bg-white p-3 text-sm text-[#172333] md:col-span-2">
            <input type="checkbox" />
            是否建立追蹤提醒
          </label>
        </div>
      </section>

      <section id="unpaid-reading-orders" className="rounded-3xl border border-[rgba(23,35,51,.14)] bg-[#fbfaf6] p-4 shadow-sm sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9b7550]">Tab 2</p>
        <h2 className="mt-1 text-xl font-semibold">未收款列表</h2>
        {hasUnpaidOrders ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(unpaidOrders ?? []).map((order: any) => (
              <ReadingOrderCard key={order.reading_order_id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState title="目前沒有未收款文字單" description="建立新文字單後，若選擇未收款或分次補款，這裡會自動顯示。" />
        )}
      </section>

      <section id="campaign-entitlements" className="rounded-3xl border border-[rgba(23,35,51,.14)] bg-[#fbfaf6] p-4 shadow-sm sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9b7550]">Tab 3</p>
        <h2 className="mt-1 text-xl font-semibold">活動贈送</h2>
        {hasCampaigns ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(campaigns ?? []).map((campaign: any, index: number) => (
              <article key={index} className="rounded-2xl border border-[rgba(23,35,51,.12)] bg-white p-4 text-sm leading-7 shadow-sm">
                <h3 className="font-bold">{campaign.campaign_name}</h3>
                <p>贈送：{campaign.reward_service_id}</p>
                <p className="text-[#6f6a63]">{campaign.reward_note}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="目前沒有活動贈送紀錄" description="啟用活動或贈送權益後，這裡會顯示活動名稱、贈送服務與備註。" />
        )}
      </section>

      <section id="reading-history" className="rounded-3xl border border-[rgba(23,35,51,.14)] bg-[#fbfaf6] p-4 shadow-sm sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9b7550]">Tab 4</p>
        <h2 className="mt-1 text-xl font-semibold">歷史紀錄</h2>
        <EmptyState title="歷史紀錄規劃中" description="下一階段會加入全部文字單、交付狀態、補款紀錄與搜尋篩選。" />
      </section>
    </main>
  );
}

function TextField({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="grid gap-2 text-sm text-[#6f6a63]">
      {label}
      <input type={type} className="min-h-12 w-full rounded-2xl border border-[rgba(23,35,51,.16)] bg-white p-3 text-base text-[#172333]" placeholder={placeholder} />
    </label>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-[rgba(155,117,80,.34)] bg-white/70 p-4 text-sm leading-7 text-[#6f6a63]">
      <strong className="block text-[#172333]">{title}</strong>
      <span>{description}</span>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href="#new-reading-order" className="rounded-full bg-[#172333] px-4 py-2 text-xs font-bold text-white">建立新文字單</a>
        <a href="#reading-history" className="rounded-full border border-[rgba(23,35,51,.16)] bg-white px-4 py-2 text-xs font-bold text-[#172333]">查看全部文字單</a>
      </div>
    </div>
  );
}
