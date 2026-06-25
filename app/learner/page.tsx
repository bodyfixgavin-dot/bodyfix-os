import Link from "next/link";
import { LearnerHero, LearnerShell } from "@/components/learner/LearnerShell";

export default function LearnerPage() {
  return (
    <LearnerShell>
      <LearnerHero eyebrow="BODYFIX BODY READING FIELD" title="BodyFix 讀體場">
        <p className="learner-lead">不是完成課程的地方，<br />而是練習如何重新看見身體的現場。</p>
        <p>透過初讀、對讀、重讀與實讀，留下可被查證的研判軌跡，逐步建立能安全負責的實作範圍。</p>
        <p className="learner-material-line">初讀寫在紙上，方法收在冊裡，證據刻進石中。</p>
      </LearnerHero>

      <section className="learner-material-entries" aria-label="讀體場入口">
        <Link className="material-entry material-entry-paper" href="/learner/field">
          <span className="material-entry-eyebrow">CURRENT BODY TEXT</span>
          <div className="paper-entry-header">
            <h2>讀體場</h2>
            <small>初讀 → 對讀 → 重讀 → 實讀</small>
          </div>
          <p>面對目前的身體文本，分開記錄觀察、假設、資訊缺口與安全界線。</p>
          <div className="entry-state" role="note">目前尚無進行中的身體文本。<br />從首個示範案例開始建立初讀紀錄。</div>
          <b className="material-entry-cta">開啟讀體場 <span aria-hidden="true">→</span></b>
          <i aria-hidden="true">TEXT · DRAFT</i>
        </Link>

        <div className="learner-secondary-entries">
          <Link className="material-entry material-entry-book" href="/learner/atlas">
            <span className="book-tab" aria-hidden="true">INDEX</span>
            <span className="material-entry-eyebrow">LENSES · 4R · 12 POSITIONS</span>
            <h2>方法圖譜</h2>
            <p>查閱五大閱讀鏡頭、BodyFix 4R 與十二讀位，為當前案例選擇合適的觀察角度。</p>
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
            <p>查看已累積的研判與實作證據，理解目前穩定能力、引導範圍與守界區域。</p>
            <div className="stone-status" role="note"><strong>原型階段</strong><span>尚未接入真實能力與驗證資料。</span></div>
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
