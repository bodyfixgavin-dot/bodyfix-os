import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";
import { BusinessFoundationDashboard } from "./BusinessFoundationDashboard";

export default async function BusinessFoundationPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!verifyAdminSessionToken(token)) {
    redirect("/admin");
  }

  return <BusinessFoundationDashboard />;
}
