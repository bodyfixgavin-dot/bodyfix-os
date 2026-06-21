import { PulseShell } from "@/components/pulse/PulseShell";
import { PULSE_CLIENT_SELECT, PulseClient, pulseClientLabel } from "@/lib/pulse/clients";
import { demoFollowups } from "@/lib/pulse/data";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

async function loadClients() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [] as PulseClient[];
  const { data } = await supabase
    .from("clients")
    .select(PULSE_CLIENT_SELECT)
    .order("last_visit_date", { ascending: true, nullsFirst: false })
    .limit(30);
  return (data ?? []) as PulseClient[];
}

export default async function Page() {
  const clients = await loadClients();
  const fallback = demoFollowups.map((x) => ({ id: x[0], display_name: x[0], main_issue: x[2], last_visit_date: x[1], contact_method: x[3], nickname: null }));
  const rows = clients.length ? clients : fallback;

  return (
    <PulseShell title="今天先找誰" eyebrow="FOLLOW-UP POOL">
      <p className="page-intro">不是廣撒訊息，是把值得照顧的人找回來。</p>
      <section className="followup-list full">
        {rows.map((client) => (
          <article key={client.id}>
            <span className="priority p-高">高</span>
            <div>
              <b>{pulseClientLabel(client)}</b>
              <p>{client.main_issue ?? "尚未記錄主要問題"} · 最近來訪 {client.last_visit_date ?? "—"}</p>
              <small>建議：嗨 {client.display_name}，最近身體狀況還好嗎？上次提到的{client.main_issue ?? "狀態"}有沒有比較穩？</small>
            </div>
            <button>{client.contact_method ?? "LINE"} 聯絡</button>
          </article>
        ))}
      </section>
    </PulseShell>
  );
}
