import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "BodyFix Pulse", template: "%s · BodyFix Pulse" },
  description: "BodyFix 老闆每日營運脈搏",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Pulse", statusBarStyle: "black-translucent" },
  icons: { icon: "/icons/pulse-icon.svg", apple: "/icons/pulse-icon.svg" },
};

export const viewport: Viewport = { themeColor: "#142235", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
