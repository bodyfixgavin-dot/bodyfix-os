"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { label: "讀體場", href: "/learner/field", activePaths: ["/learner", "/learner/field"] },
  { label: "方法圖譜", href: "/learner/atlas", activePaths: ["/learner/atlas"] },
  { label: "讀體星圖", href: "/learner/passport", activePaths: ["/learner/passport"] },
];

function isActivePath(pathname: string, activePaths: string[]) {
  return activePaths.some((path) => pathname === path || (path !== "/learner" && pathname.startsWith(`${path}/`)));
}

export function LearnerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return <main className="learner-page"><div className="learner-shell"><nav className="learner-nav"><Link className="portal-wordmark" href="/learner"><span>BF</span><strong>BodyFix 讀體場</strong></Link><div>{navItems.map((item) => <Link className={isActivePath(pathname, item.activePaths) ? "is-active" : undefined} href={item.href} key={item.href} aria-current={isActivePath(pathname, item.activePaths) ? "page" : undefined}>{item.label}</Link>)}</div></nav>{children}<footer className="learner-footer"><Link href="/">返回 BodyFix OS</Link><span>原型階段 · 各自成樹，彼此成林；地下共生，向光循環。</span></footer></div></main>;
}

export function LearnerHero({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <section className="learner-hero"><p className="portal-kicker">{eyebrow}</p><h1>{title}</h1>{children}</section>;
}

export function BoundaryNotice({ children = "此為教學用合成文本，不代表真實個案診斷。" }: { children?: ReactNode }) {
  return <div className="learner-notice" role="note">{children}</div>;
}
