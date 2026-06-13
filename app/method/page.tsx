import Link from "next/link";

const stages = [
  {
    number: "01",
    title: "BodyFix 身體狀態整理個別導入課",
    description: "適合已經有教練、按摩、美業或身體服務背景，想先了解 BodyFix 判讀邏輯與服務流程的人。",
  },
  {
    number: "02",
    title: "BodyFix 身體狀態整理入門工作坊",
    description: "適合想學習代償、張力、卡住、回接、安全邊界與基礎低痛感手法的人。",
  },
  {
    number: "03",
    title: "BF Fascia Line Reset｜筋膜鏈整理基礎班",
    description: "適合有身體服務或訓練背景，想進一步學習筋膜鏈整理與 60 分鐘流程的人。",
    status: "Coming Soon",
  },
];

export default function MethodPage() {
  return (
    <main className="portal-page portal-detail-page">
      <div className="portal-detail-shell">
        <Link className="portal-back-link" href="/">← 返回 BodyFix OS</Link>
        <header className="portal-detail-hero">
          <p className="portal-kicker">Public Learning Entrance</p>
          <h1>BodyFix Method</h1>
          <p className="portal-detail-lead">從運動按摩，到身體狀態整理系統。</p>
          <p>BodyFix 教學不是一開始教完整高階手法，而是先從判讀、邊界、低痛感手法與服務流程開始。</p>
        </header>

        <section className="portal-detail-section" aria-labelledby="route-title">
          <div className="portal-detail-heading"><span>Learning Route</span><h2 id="route-title">學習路線</h2></div>
          <div className="portal-stage-grid">
            {stages.map((stage) => (
              <article className="portal-stage-card" key={stage.number}>
                <div><span>{stage.number}</span>{stage.status ? <em>{stage.status}</em> : null}</div>
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="portal-boundary">
          <p className="portal-kicker">Safety Boundary</p>
          <h2>先知道不做什麼，才知道方法如何成立。</h2>
          <p>BodyFix Method 不教醫療處置、不教矯正、不處理判讀，也不承諾療效。課程重點是教身體服務者如何建立判讀、整理、回接與追蹤流程。</p>
        </aside>

        <section className="portal-detail-closing">
          <p>目前 BodyFix Method 教學系統整理中。</p>
          <h2>如想了解個別導入課或未來工作坊，可先透過官方 LINE 或 Instagram 聯絡。</h2>
        </section>
      </div>
    </main>
  );
}
