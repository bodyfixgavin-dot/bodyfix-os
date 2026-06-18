import { EntryForm } from "@/components/pulse/EntryForm";
import { PulseShell } from "@/components/pulse/PulseShell";
import { getPulseClients, taipeiDate } from "@/lib/pulse/data";
export default async function Page(){const clients=await getPulseClients(); return <PulseShell title="預約池" eyebrow="BOOKING PULSE"><section className="appointments-card"><div><small>NEXT APPOINTMENT</small><h2>新增預約</h2><p>預約會連到 clients，不再只手打名字。</p></div><strong>已排</strong></section><h2 className="section-label">新增預約</h2><EntryForm kind="appointment" clients={clients} defaultDate={taipeiDate()}/></PulseShell>}
