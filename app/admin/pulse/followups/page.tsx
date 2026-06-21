import { PulseShell } from "@/components/pulse/PulseShell";

export default function Page() {
  return (
    <PulseShell title="今天先找誰" eyebrow="FOLLOW-UP POOL">
      <section className="appointments-card">
        <div>
          <small>EMPTY STATE</small>
          <h2>目前沒有正式回訪資料</h2>
          <p>Pulse v0.9 不使用 demo 名單；等正式資料接上後再顯示回訪池。</p>
        </div>
        <strong>0<small> 位</small></strong>
      </section>
    </PulseShell>
  );
}
