import {PulseShell} from "@/components/pulse/PulseShell"; import {EntryForm} from "@/components/pulse/EntryForm";
export default function Page(){return <PulseShell title="記一筆收入" eyebrow="CASH IN"><p className="page-intro">收完就記，月底不必考古。</p><EntryForm kind="income"/></PulseShell>}
