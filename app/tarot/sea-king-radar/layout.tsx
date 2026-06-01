import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "BF Tarot｜海王雷達 v2 關係風險檢測器",
  description: "用 8 題行為訊號檢測關係中的模糊、消耗、操控與不確定性，並導向 SADM 關係決策整理系統。"
};

export default function SeaKingRadarLayout({ children }: { children: ReactNode }) {
  return children;
}
