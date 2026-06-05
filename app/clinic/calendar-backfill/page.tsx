import { requireClinicAdmin } from "@/lib/clinic-api";
import CalendarBackfillClient from "./CalendarBackfillClient";
import InlineAdminLoginCard from "./InlineAdminLoginCard";

export default async function CalendarBackfillPage() {
  const auth = await requireClinicAdmin("/api/clinic/calendar-backfill");
  if (!auth.ok) {
    if (auth.response.status === 401) {
      return <InlineAdminLoginCard />;
    }

    return <CalendarBackfillClient initialError="後台已登入，但資料庫環境變數尚未正確設定。請確認 Vercel env 後重新部署。" />;
  }
  return <CalendarBackfillClient />;
}
