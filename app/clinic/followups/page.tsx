import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FollowupDashboard from "./FollowupDashboard";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";

export default async function FollowupsPage() {
  const cookieStore = await cookies();
  if (!verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) redirect("/admin");
  return <FollowupDashboard />;
}
