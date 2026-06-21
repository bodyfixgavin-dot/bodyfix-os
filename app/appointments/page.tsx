import { PulseShell } from "@/components/pulse/PulseShell";
import { EntryForm } from "@/components/pulse/EntryForm";

export default function Page(){return <PulseShell title="預約池" eyebrow="BOOKING PULSE"><section className="appointments-card"><div><small>NEW APPOINTMENT</small><h2>新增預約</h2><p>請選擇 clients 表中的既有客戶，或先新增客戶後建立預約。</p></div><strong>客戶連動</strong></section><h2 className="section-label">新增預約</h2><EntryForm kind="appointment"/></PulseShell>}
