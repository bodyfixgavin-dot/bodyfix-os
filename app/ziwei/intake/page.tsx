import type { Metadata } from "next";
import ZiweiIntakeForm from "./ZiweiIntakeForm";

export const metadata: Metadata = {
  title: "紫微分析 × 身體判讀｜定盤資料表",
  description: "紫微分析與身體判讀前使用的定盤資料整理表；資料只暫存於填寫者的瀏覽器。",
};

export default function Page() { return <ZiweiIntakeForm />; }
