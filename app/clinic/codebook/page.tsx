import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";
import CodebookDashboard from "./CodebookDashboard";

export const metadata: Metadata = {
  title: "Codebook v0.2.1 | BodyFix Clinic",
  description: "BodyFix clinic codebook reference dashboard."
};

export default async function CodebookPage() {
  const cookieStore = await cookies();
  if (!verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) redirect("/admin");
  return <CodebookDashboard />;
}
