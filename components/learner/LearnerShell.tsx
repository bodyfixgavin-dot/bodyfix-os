import Link from "next/link";
import type { ReactNode } from "react";

export function LearnerShell({ children }: { children: ReactNode }) {
  return <main className="learner-page"><div className="learner-shell"><nav className="learner-nav"><Link className="portal-wordmark" href="/learner"><span>BF</span><strong>BodyFix 讀體場</strong></Link><div><Link href="/learner/field">讀體場</Link><Link href="/learner/atlas">方法圖譜</Link><Link href="/learner/passport">讀體星圖</Link></div></nav>{children}<footer className="learner-footer"><Link href="/">返回 BodyFix OS</Link><span>原型階段 · 各自成樹，彼此成林；地下共生，向光循環。</span></footer></div></main>;
}

export function LearnerHero({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <section className="learner-hero"><p className="portal-kicker">{eyebrow}</p><h1>{title}</h1>{children}</section>;
}

export function BoundaryNotice({ children = "此為教學用合成文本，不代表真實個案診斷。" }: { children?: ReactNode }) {
  return <div className="learner-notice" role="note">{children}</div>;
}
