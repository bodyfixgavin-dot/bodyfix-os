import { LearnerHero, LearnerShell } from "@/components/learner/LearnerShell";
import { readingLenses, readPositions } from "@/lib/learner/data";

export default function AtlasPage() {
  const groups = ["READ", "RESET", "RECONNECT", "RETURN"];
  return <LearnerShell><LearnerHero eyebrow="METHOD ATLAS" title="方法圖譜"><p className="learner-lead">BodyFix 讀體術的認知工具地圖：五大閱讀鏡頭、BodyFix 4R 與十二讀位。</p></LearnerHero><section className="learner-stack"><h2>五大閱讀鏡頭</h2>{readingLenses.map((lens) => <details className="learner-detail" key={lens.name}><summary>{lens.name}</summary><p>{lens.question}</p></details>)}</section><section className="learner-stack"><h2>BodyFix 十二讀位</h2>{groups.map((stage) => <div className="position-group" key={stage}><h3>{stage}</h3><div className="position-grid">{readPositions.filter((item) => item.stage === stage).map((item) => <article className="position-card" key={item.index}><span>{item.index.toString().padStart(2, "0")} · {item.stage}</span><h4>{item.name}</h4><p>{item.question}</p></article>)}</div></div>)}</section></LearnerShell>;
}
