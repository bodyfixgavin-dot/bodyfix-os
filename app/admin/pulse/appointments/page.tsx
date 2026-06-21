import { PulseShell } from "@/components/pulse/PulseShell";

export default function Page() {
  return (
    <PulseShell title="預約池" eyebrow="BOOKING PULSE">
      <section className="appointments-card">
        <div>
          <small>V0.9 READ ONLY</small>
          <h2>預約池暫不新增功能</h2>
          <p>本版只在 Dashboard 顯示未來 7 天預約數；正式預約資料仍維持既有 Admin 模組處理。</p>
        </div>
        <strong>—</strong>
      </section>
    </PulseShell>
  );
}
