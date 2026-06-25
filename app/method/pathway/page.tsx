import Link from "next/link";
const prerequisites = [
["01｜基礎解剖與定位", "能辨認主要骨性標記、大型肌群、表層安全接觸區域與需謹慎處理的結構。"],
["02｜基礎運動按摩操作", "能穩定控制接觸面、壓力方向、速度、節奏、身體重心與由淺入深的流程。"],
["03｜安全與服務邊界", "理解何時停止、何時降低強度、何時建議就醫，以及同意、隱私與停止權。"],
["04｜溝通與主觀回報", "能詢問並記錄主訴、可接受強度、呼吸狀態與麻、刺、電、暈等異常反應。"],
["05｜基礎動作觀察", "能進行站姿、呼吸、活動度與簡單操作前後回測。"],
["06｜基本服務紀錄", "能留下主訴、進場觀察、整理區域、客戶反應、前後回測與後續建議。"],
];
const levels = [
["參與／完課紀錄", "代表參與或完成指定內容。", "不可宣稱：BodyFix 認證"],
["實作能力合格", "代表通過指定模組的實作評量。", "可宣稱：完成 BodyFix 指定模組實作評量；不可宣稱：BodyFix 認證師"],
["BodyFix 方法認證", "代表通過未來正式公布的案例、實作、口述、安全與紀錄標準。", "制度建置中，尚未開放"],
["BodyFix 品牌授權", "代表在另外簽訂合約與品質管理條件下，取得名稱、教材或系統的限定使用權。", "認證不等於授權，目前尚未開放"],
];
export default function MethodPathwayPage(){return <main className="portal-page portal-detail-page method-page"><div className="portal-detail-shell method-shell"><Link className="portal-back-link" href="/method">← 返回 BodyFix Method</Link><header className="portal-detail-hero method-hero"><p className="portal-kicker">PATHWAY｜制度建置中</p><h1>BodyFix Method 學習路徑</h1><p className="portal-detail-lead">BodyFix 強調可驗證的先備能力，而不是只用職稱或證書作為唯一門檻。</p><p className="method-emphasis">認證不是一堂課，而是通過一組條件後取得的狀態。</p></header><section className="portal-detail-section method-section"><div className="portal-detail-heading"><span>Prerequisites</span><h2>六大先備能力</h2></div><div className="learning-track-grid">{prerequisites.map(([title,copy])=><article className="method-card" key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></section><section className="portal-detail-section method-section"><div className="portal-detail-heading"><span>Records, Assessment, Certification, License</span><h2>完課、合格、認證與授權不能混用。</h2></div><div className="method-route-grid">{levels.map(([title,copy,note])=><article className="method-route-card" key={title}><h3>{title}</h3><p>{copy}</p><p className="method-note">{note}</p></article>)}</div></section></div></main>}
