import { requireClinicAdmin } from "@/lib/clinic-api";
import CalendarBackfillClient from "./CalendarBackfillClient";

export default async function CalendarBackfillPage() {
  const auth = await requireClinicAdmin();
  if (!auth.ok) {
    return (
      <main className="bf-container clinic-page">
        <section className="bf-card bf-section-gap">
          <h1>行事曆 / 客戶總表回填</h1>
          <p>此工具只能由已登入的 BodyFix admin 使用。請先到 /admin 登入後再返回本頁。</p>
        </section>
      </main>
    );
  }
  return <CalendarBackfillClient />;
}
