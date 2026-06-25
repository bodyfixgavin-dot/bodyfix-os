import Link from "next/link";
import { MethodInterestForm } from "@/components/method/MethodInterestForm";

export default function MethodRegisterPage() {
  return <main className="portal-page portal-detail-page method-page"><div className="portal-detail-shell method-shell"><Link className="portal-back-link" href="/method">← 返回 BodyFix Method</Link><header className="portal-detail-hero method-hero"><p className="portal-kicker">PILOT REGISTRATION</p><h1>BodyFix Method Pilot 個別導入</h1><p className="portal-detail-lead">這不是完整課程或認證班，而是能力盤點、方法導入與個人化學習建議。</p><p className="method-emphasis">Pilot 產出包含個人能力回饋、適合的學習路線建議與試行參與紀錄。試行參與紀錄不是完課證明、方法認證或品牌授權。</p></header><section className="portal-detail-section method-form-section"><div className="portal-detail-heading"><span>Interest Registration</span><h2>留下你的背景與學習問題。</h2></div><MethodInterestForm /></section></div></main>;
}
