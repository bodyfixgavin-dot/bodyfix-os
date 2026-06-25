import Link from "next/link";
import { LearnerHero, LearnerShell } from "@/components/learner/LearnerShell";
import { bodyTextCases } from "@/lib/learner/data";

export default function FieldPage() {
  return <LearnerShell><LearnerHero eyebrow="BODY TEXTS" title="讀體場｜身體文本"><p className="learner-lead">目前可閱讀的身體文本。這裡不是課程列表，而是留下研判軌跡的工作現場。</p></LearnerHero><section className="learner-grid">{bodyTextCases.map((item) => { const body = <><span>{item.status}</span><h2>{item.id.toUpperCase()}｜{item.title}</h2><p>{item.summary}</p><b>{item.href ? "進入文本" : "原型階段"}</b></>; return item.href ? <Link className="learner-card" href={item.href} key={item.id}>{body}</Link> : <article className="learner-card learner-card-muted" key={item.id}>{body}</article>; })}</section></LearnerShell>;
}
