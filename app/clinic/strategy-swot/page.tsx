import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";
import { StrategySwotDashboard } from "./StrategySwotDashboard";

export const metadata: Metadata = {
  title: "BodyFix OS 策略全局分析",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StrategySwotPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!verifyAdminSessionToken(token)) {
    redirect("/admin");
  }

  return <StrategySwotDashboard />;
}
