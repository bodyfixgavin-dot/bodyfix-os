import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ClinicShell } from "@/components/clinic/ClinicShell";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Chart Navigator｜派別詢問回覆 SOP",
  robots: { index: false, follow: false },
};

export default async function ChartNavigatorSopPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!verifyAdminSessionToken(token)) {
    redirect("/admin");
  }

  return (
    <ClinicShell
      title="Chart Navigator｜派別詢問回覆 SOP"
      subtitle="僅供 Gavin 私訊回覆與內部溝通使用；公開網站不可使用此頁的派別文字。"
    >
      <section className="bf-card bf-section-gap">
        <p className="bf-tag">ADMIN ONLY · INTERNAL SOP</p>
        <h2 className="bf-section-title">情境</h2>
        <p>客人問：「你是哪一派？」</p>
      </section>

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">建議回覆</h2>
        <div className="bf-notice">
          <p>我判盤主要走三合的邏輯，不過跟你互動的時候我不會特別講派別。</p>
          <p>因為對你有用的不是「我是哪一派」，是「你的命盤結構長怎樣、現在走到哪、這步怎麼踩」。</p>
          <p>派別是我後台怎麼算的事，你只要拿到看得懂、用得上的方向就好。</p>
        </div>
      </section>

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">使用邊界</h2>
        <ul>
          <li>這段只作為 Gavin 私訊回覆與內部 SOP 使用，不可放在公開網站。</li>
          <li>公開網站一律使用「紫微斗數」或「紫微命盤」。</li>
          <li>不要主動提「三合派」。</li>
        </ul>
      </section>
    </ClinicShell>
  );
}
