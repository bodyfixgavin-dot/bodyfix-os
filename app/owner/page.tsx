import Link from "next/link";

const ownerFlow = [
  ["SERVICE", "你提供什麼？你的方法、價值與服務邊界是什麼？"],
  ["BOOKING", "客人怎麼進來？他怎麼理解、預約、填問卷、被分流？"],
  ["RECORDS", "服務後留下什麼？不是只做完一次，而是留下可追蹤的狀態紀錄。"],
  ["TOOLS", "之後怎麼判讀？你用什麼工具整理狀態、回訪、追蹤與升級服務？"],
];

export default function OwnerPage() {
  return (
    <main className="portal-page portal-detail-page portal-owner-page">
      <div className="portal-detail-shell">
        <Link className="portal-back-link" href="/">← 返回 BodyFix OS</Link>
        <header className="portal-detail-hero">
          <p className="portal-kicker">Owner Mode</p>
          <h1>BodyFix Owner Mode</h1>
          <p className="portal-detail-lead">想當老闆，先看懂一套服務怎麼成立。</p>
          <div className="portal-owner-note">
            <strong>你點進來了。</strong>
            <p>這代表你可能不只是在找一次服務，也可能在想：如果我也想把 BodyFix 的方法帶進自己的場域，需要先會什麼？</p>
          </div>
        </header>

        <section className="portal-detail-section" aria-labelledby="owner-system-title">
          <div className="portal-detail-heading">
            <span>Before the business</span>
            <h2 id="owner-system-title">想當老闆，先不是急著開店。<br />你要先看懂一套服務怎麼成立。</h2>
          </div>
          <div className="portal-owner-grid">
            {ownerFlow.map(([title, description], index) => (
              <article className="portal-owner-card" key={title}>
                <span>0{index + 1}</span><h3>{title}</h3><p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="portal-detail-closing">
          <p>Owner Mode 目前開發中。</p>
          <h2>如果你對 BodyFix 方法、課程、合作、駐點或未來授權有興趣，可以先透過官方 LINE 或 Instagram 聯絡。</h2>
        </section>
      </div>
    </main>
  );
}
