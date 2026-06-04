import Link from "next/link";
import { ManualPromptEditor } from "./ManualPromptEditor";

export default async function AnatomyImageEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <main className="anatomy-page">
      <section className="anatomy-hero anatomy-hero-compact">
        <div>
          <p className="anatomy-kicker">Template Editor</p>
          <h1>教材版模板編輯器</h1>
          <p>
            輸入圖名、章節、視角、標籤與功能短句後，系統會自動組成固定格式的 BodyFix 解剖教材 prompt。
          </p>
        </div>
        <div className="anatomy-hero-actions">
          <Link className="anatomy-secondary-link" href="/anatomy-images">返回圖像總表</Link>
          <Link className="anatomy-secondary-link" href="/anatomy-images/rules">規則庫</Link>
        </div>
      </section>
      <ManualPromptEditor initialId={id} />
    </main>
  );
}
