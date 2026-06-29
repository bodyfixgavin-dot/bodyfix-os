import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "BodyFix OS｜身體服務作業系統", template: "%s｜BodyFix OS" },
  description: "BodyFix Service Operating System",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "BodyFix OS", statusBarStyle: "black-translucent" },
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
