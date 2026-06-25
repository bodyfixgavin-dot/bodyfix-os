import { BoundaryNotice, LearnerHero, LearnerShell } from "@/components/learner/LearnerShell";
import { capabilityNodes } from "@/lib/learner/data";

const statuses = [
  ["未探索", "尚未接觸，不代表不具備。"],
  ["觀察中", "已建立初步閱讀紀錄，但證據仍不足。"],
  ["引導實作", "目前僅適合在導師對讀或明確框架下進行。"],
  ["已驗證", "已有足夠的多元實作證據，納入目前安全實作範圍。"],
  ["界外區域", "尚未驗證，或不屬於 BodyFix 可執行與授權範圍。"],
];

export default function PassportPage() {
  return <LearnerShell><LearnerHero eyebrow="BODYFIX READING CONSTELLATION" title="BodyFix 讀體星圖"><p className="learner-lead">已驗證能力、實作證據與當前安全邊界。</p><BoundaryNotice>Demo 資料 · 尚未接入資料，不顯示虛構認證、授權或完成狀態。</BoundaryNotice></LearnerHero><section className="passport-layout"><div className="ring-card"><svg viewBox="0 0 320 320" role="img" aria-label="守界環"><circle cx="160" cy="160" r="62"/><circle cx="160" cy="160" r="108"/><circle cx="160" cy="160" r="146"/><text x="160" y="154">環內：證據支持</text><text x="160" y="178">環上：引導監督</text><text x="160" y="34">環外：尚未驗證</text></svg></div><div className="learner-stack">{statuses.map(([title, text]) => <article className="status-row" key={title}><h2>{title}</h2><p>{text}</p></article>)}</div></section><section className="learner-grid">{capabilityNodes.map((node) => <article className="learner-card" key={node.name}><span>{node.status}</span><h2>{node.name}</h2><p>{node.note}</p></article>)}</section></LearnerShell>;
}
