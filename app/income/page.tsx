import { EntryForm } from "@/components/pulse/EntryForm";
import { PulseShell } from "@/components/pulse/PulseShell";
import { getPulseClients, taipeiDate } from "@/lib/pulse/data";
export default async function Page(){const clients=await getPulseClients(); return <PulseShell title="記一筆收入" eyebrow="CASH IN"><p className="page-intro">收完就記，月底不必考古。</p><EntryForm kind="income" clients={clients} defaultDate={taipeiDate()}/></PulseShell>}
