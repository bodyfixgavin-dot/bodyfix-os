import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SADM 關係決策整理系統｜BF Tarot",
  description: "透過 7 個關係元素、7 張塔羅牌與一個 SVS 分數，整理關係價值與成本。"
};

export default function SadmLayout({ children }: { children: ReactNode }) {
  return children;
}
