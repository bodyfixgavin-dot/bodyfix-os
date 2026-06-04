import Link from "next/link";

const ruleSections = [
  {
    title: "教材版規則",
    description: "用於 Word / PDF 手冊內頁，必須像同一本教材中的固定圖版。",
    rules: ["80% 為解剖主圖，20% 為標籤與少量功能說明", "背景使用乾淨米白或透明", "右下角保留乾淨 Logo 安全區，但不要生成 BF Logo、BodyFix 文字或任何品牌標記", "避免海報感、社群圖卡感與材質拼貼感"],
  },
  {
    title: "標籤規則",
    description: "標籤要服務教學辨識，不要變成裝飾。",
    rules: ["標籤以中文為主，可補英文結構名稱", "用細線清楚指向骨頭、肌肉、筋膜線或功能結構", "每張圖只標必要結構，避免過度密集", "功能短句最多 3–5 點，保持手冊內頁可讀性"],
  },
  {
    title: "BodyFix 色彩規則",
    description: "建立乾淨、高級、穩定的品牌教材語言。",
    rules: ["米白 / Ivory：背景與留白", "深藍 / Navy：主要文字、線條與後製 BF Logo", "暖米 / Warm Beige：區塊底色與輔助面", "石灰灰 / Lime Gray：次要線條與低對比提示", "青銅金 / Bronze Gold：重點標籤與章節識別"],
  },
  {
    title: "Logo 規則",
    description: "BodyFix Logo 不由 AI 圖像生成，統一由固定資產後製疊加。",
    rules: ["AI 只負責產生解剖主圖、標籤與空白安全區", "Logo 一律使用固定 SVG / PNG 後製疊加", "確保 BF 字形一致，避免 AI 產生錯字或變形 Logo", "未來更換 Logo 時，只需替換固定資產"],
  },
  {
    title: "敏感區安全規則",
    description: "骨盆相關題材要保持醫學教材與動作教育語境。",
    rules: ["不畫私密細節", "不做情色、不做挑逗姿勢", "不做內診感或臨床侵入畫面", "以骨性結構、肌肉、筋膜與力線示意為主"],
  },
  {
    title: "品牌版 / IG 版保留規則",
    description: "MVP 先鎖教材版，其他版型留作未來擴充。",
    rules: ["品牌版可用於章節開場、簡報與提案，可加入更多品牌留白與材質", "IG 版可放大標題、減少標籤、強化單一教育訊息", "流程圖可用 SOP、分流、服務流程與呼吸腹壓教學", "案例圖可放前後差異或個案說明，但需另設審核規則"],
  },
];

export default function AnatomyImageRulesPage() {
  return (
    <main className="anatomy-page">
      <section className="anatomy-hero anatomy-hero-compact">
        <div>
          <p className="anatomy-kicker">Template Rule Library</p>
          <h1>BodyFix 圖版規則庫</h1>
          <p>
            這裡固定教材版、標籤、色彩與敏感區安全規則。未來若串 OpenAI API，這些規則可升級為 structured outputs 與後端產圖 guardrails。
          </p>
        </div>
        <div className="anatomy-hero-actions">
          <Link className="anatomy-secondary-link" href="/anatomy-images">返回圖像總表</Link>
          <Link className="anatomy-primary-link" href="/anatomy-images/editor">開啟編輯器</Link>
        </div>
      </section>

      <section className="anatomy-rule-grid">
        {ruleSections.map((section) => (
          <article className="anatomy-rule-card" key={section.title}>
            <p>{section.title}</p>
            <h2>{section.description}</h2>
            <ul>
              {section.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
