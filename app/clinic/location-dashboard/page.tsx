"use client";
import Link from "next/link";
import { ClinicNotice, ClinicShell, useClinicFetch } from "@/components/clinic/ClinicShell";

type Dashboard = { city_market_dashboard:any[]; taipei_zone_demand_dashboard:any[]; taipei_demand_area_dashboard:any[]; studio_block_dashboard:any[]; lead_nurturing_queue:any[] };
export default function LocationDashboardPage() {
  const { data, loading, error } = useClinicFetch<Dashboard>("/api/clinic/location-dashboard");
  return <ClinicShell title="地區需求與資源配置中樞" subtitle="先驗證需求密度，再評估時間成本、體力消耗、工作室成本與預估淨利。">
    <ClinicNotice loading={loading} error={error} />
    {data && <>
      <section className="clinic-quick bf-section-gap">
        <Link className="bf-small-btn" href="/clinic/city-markets">跨城市市場</Link><Link className="bf-small-btn" href="/clinic/city-sessions">城市場次</Link><Link className="bf-small-btn" href="/clinic/location-leads">地區需求登記</Link><Link className="bf-small-btn" href="/clinic/taipei-zones">台北服務據點</Link><Link className="bf-small-btn" href="/clinic/taipei-demand-areas">台北來源區</Link><Link className="bf-small-btn" href="/clinic/taipei-studio-blocks">工作室區塊</Link>
      </section>
      <section className="bf-notice bf-section-gap">宜蘭是 Pilot City：已收到 NT$6,000 高意願需求，先作試點觀察，不代表固定開場。以上數字為內部估算範例，請以最新實際報價與個人體力評估為準。</section>
      <section className="bf-notice bf-section-gap">西門與國父紀念館建議採集中時段，不建議單一客戶單獨開房。同一天跨區過多會增加體力消耗；客戶取消時，需同時考量工作室費、移動時間與空檔損失。六張犁不是不能去，但對西區與新北客群來說，心理距離會降低預約意願。</section>
      <section className="clinic-grid bf-section-gap">
        <div className="bf-card"><h2 className="bf-section-title">跨城市需求摘要</h2>{data.city_market_dashboard.map((c)=><div className="clinic-item" key={c.city_code}><strong>{c.display_name_zh}｜{c.recommended_status}</strong><span>登記 {c.registered_count}｜高意願 {c.high_intent_count}｜預估收入 NT${c.estimated_revenue}</span><small>{c.top_service_interest}</small></div>)}</div>
        <div className="bf-card"><h2 className="bf-section-title">台北據點需求摘要</h2>{data.taipei_zone_demand_dashboard.map((z)=><div className="clinic-item" key={z.zone_code}><strong>{z.display_name_zh}｜{z.recommended_action}</strong><span>需求 {z.request_count}｜高意願 {z.high_intent_count}｜距離疑慮 {z.distance_objection_count}</span><small>{z.top_service_interest}</small></div>)}</div>
        <div className="bf-card"><h2 className="bf-section-title">工作室區塊摘要</h2>{data.studio_block_dashboard.map((b)=><div className="clinic-item" key={b.studio_block_id}><strong>{b.zone_code}｜{b.block_date}</strong><span>Booked {b.booked_slots}｜Profit NT${b.expected_profit}</span><small>{b.single_client_risk ? "此區塊目前未滿 2 位，可能不符合工作室與移動成本效益。" : "集中時段較符合成本效益"}</small></div>)}</div>
        <div className="bf-card"><h2 className="bf-section-title">高意願 / 需追蹤 leads</h2>{data.lead_nurturing_queue.map((l)=><div className="clinic-item" key={l.lead_id}><strong>{l.display_name ?? "未命名"}｜{l.lead_type}</strong><span>{l.city_code ?? l.client_area_code} → {l.preferred_zone_code ?? ""}</span><small>{l.service_interest}｜{l.nurture_status}</small></div>)}</div>
      </section>
    </>}
  </ClinicShell>;
}
