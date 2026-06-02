import { requireClinicAdmin } from "@/lib/clinic-api";
import CalendarBackfillClient from "./CalendarBackfillClient";
import InlineAdminLoginCard from "./InlineAdminLoginCard";

export default async function CalendarBackfillPage() {
  const auth = await requireClinicAdmin();
  if (!auth.ok) {
    return <InlineAdminLoginCard />;
  }
  return <CalendarBackfillClient />;
}
