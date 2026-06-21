import { PulseShell } from "@/components/pulse/PulseShell";
import { EntryForm } from "@/components/pulse/EntryForm";

export default function Page(){return <PulseShell title="預約池" eyebrow="BOOKING PULSE"><section className="appointments-card"><div><small>NEXT APPOINTMENT</small><h2>從 Supabase 讀取預約</h2><p>新增預約請使用正式客戶與 service_catalog 服務。</p></div><strong>LIVE</strong></section><h2 className="section-label">新增預約</h2><EntryForm kind="appointment"/></PulseShell>}
