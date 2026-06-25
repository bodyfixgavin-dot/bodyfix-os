import type { Metadata } from "next";
import Link from "next/link";
import { LearnerHero, LearnerShell } from "@/components/learner/LearnerShell";

export const metadata: Metadata = {
  title: "BodyFix 讀體場｜身體閱讀與研判現場",
};

export default function LearnerPage() {
  return (
    <LearnerShell>
      <LearnerHero eyebrow="BODYFIX BODY READING FIELD" title="BodyFix 讀體場">
        <p className="learner-lead">重新看見身體，<br />從一份可以被修訂的初讀開始。</p>
        <p>透過初讀、對讀、重讀與實讀，<br />留下可被查證的研判軌跡。</p>
      </LearnerHero>

      <section className="learner-material-entries" aria-label="讀體場入口">
        <Link className="material-entry material-entry-paper" href="/learner/field">
          <span className="material-entry-eyebrow">CURRENT BODY TEXT</span>
          <div className="paper-entry-header">
            <h2>BodyFix 讀體場</h2>
            <small>初讀 → 對讀 → 重讀 → 實讀</small>
          </div>
          <p>面對目前的身體文本，<br />分開記錄觀察、假設、資訊缺口與安全界線。</p>
          <div className="entry-state" role="note">目前沒有進行中的身體文本。<br />從首個示範案例開始建立初讀紀錄。</div>
          <b className="material-entry-cta material-entry-cta-primary">開啟讀體場 <span aria-hidden="true">→</span></b>
          <i aria-hidden="true">TEXT · DRAFT</i>
        </Link>

        <div className="learner-secondary-entries">
          <Link className="material-entry material-entry-book" href="/learner/atlas">
            <span className="book-tab" aria-hidden="true">INDEX</span>
            <span className="material-entry-eyebrow">LENSES · 4R · 12 POSITIONS</span>
            <h2>方法圖譜</h2>
            <p>查閱閱讀鏡頭、4R 與十二讀位，<br />為當前案例選擇觀察角度。</p>
            <ul className="book-index" aria-label="方法圖譜索引">
              <li><span>01</span>五大閱讀鏡頭</li>
              <li><span>02</span>BodyFix 4R</li>
              <li><span>03</span>十二讀位</li>
            </ul>
            <b className="material-entry-cta">展開方法圖譜 <span aria-hidden="true">→</span></b>
          </Link>

          <Link className="material-entry material-entry-stone" href="/learner/passport">
            <span className="material-entry-eyebrow">EVIDENCE · CAPABILITY · BOUNDARY</span>
            <h2>讀體星圖</h2>
            <p>回看研判證據、能力結構與守界範圍。</p>
            <div className="stone-status" role="note"><strong>原型階段</strong><span>尚未接入真實驗證資料</span></div>
            <ul className="stone-terms" aria-label="讀體星圖結構詞">
              <li>實作證據</li>
              <li>能力結構</li>
              <li>守界範圍</li>
            </ul>
            <div className="stone-glyph" aria-hidden="true"><span /><span /><span /></div>
            <b className="material-entry-cta">查看讀體星圖 <span aria-hidden="true">→</span></b>
          </Link>
        </div>
      </section>

      <section className="learner-statement learner-method-statement">
        <span>METHOD FOUNDATION</span>
        <h2>張力偵查與研判系統</h2>
        <p>觀察不是結論，假設必須留下證據；<br />每一次介入，都要知道自己的安全邊界。</p>
      </section>
    </LearnerShell>
  );
}
