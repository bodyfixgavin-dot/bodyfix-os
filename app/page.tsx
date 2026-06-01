import Link from "next/link";

type HubModule = {
  title: string;
  eyebrow?: string;
  description: string;
  status: "已啟用" | "MVP" | "工具" | "Coming Soon" | "Future" | "Internal";
  cta: string;
  href?: string;
};

type HubSection = {
  kicker: string;
  title: string;
  description: string;
  modules: HubModule[];
};

const currentModules: HubModule[] = [
  {
    title: "Dashboard",
    eyebrow: "Operations Overview",
    description: "查看整體系統狀態與營運總覽",
    status: "已啟用",
    cta: "前往 Dashboard",
    href: "/dashboard",
  },
  {
    title: "Booking",
    eyebrow: "Public Booking Flow",
    description: "管理前台預約入口與服務流程",
    status: "已啟用",
    cta: "前往 Booking",
    href: "/booking",
  },
  {
    title: "Booking Admin",
    eyebrow: "Schedule Management",
    description: "處理預約後台、時段與管理操作",
    status: "已啟用",
    cta: "前往 Booking Admin",
    href: "/admin",
  },
  {
    title: "SADM 關係決策整理",
    eyebrow: "Relationship Decision System",
    description: "整理關係中的價值、成本與停損點",
    status: "工具",
    cta: "前往 SADM",
    href: "/tarot/sadm",
  },
  {
    title: "海王雷達 v2",
    eyebrow: "Risk Signal Radar",
    description: "快速檢測關係中的高風險互動訊號",
    status: "工具",
    cta: "前往海王雷達 v2",
    href: "/tarot/sea-king-radar",
  },
];

const roadmapSections: HubSection[] = [
  {
    kicker: "Clinic System",
    title: "個案管理系統",
    description:
      "用來沉澱客戶資料、服務紀錄、追蹤提醒與案例資產，讓 BodyFix 的服務不只停在單次接案。",
    modules: [
      {
        title: "Client Records 個案檔案",
        eyebrow: "Client Records",
        description: "建立客戶主檔，整合基本資料、服務歷程與狀態標籤",
        status: "MVP",
        cta: "前往模組",
        href: "/clinic/clients",
      },
      {
        title: "Quick Record 快速記錄",
        eyebrow: "Quick Record",
        description: "服務後快速補上重點紀錄，降低現場紀錄負擔",
        status: "MVP",
        cta: "前往模組",
        href: "/clinic/records/new",
      },
      {
        title: "Service Records 服務紀錄",
        eyebrow: "Service Records",
        description: "記錄每次整理重點、觀察結果、處理區域與下次方向",
        status: "Coming Soon",
        cta: "規劃中",
      },
      {
        title: "Follow-up 追蹤提醒",
        eyebrow: "Follow-up",
        description: "安排回訪、續約提醒與客戶狀態追蹤",
        status: "MVP",
        cta: "前往模組",
        href: "/clinic/followups",
      },
      {
        title: "Plan Candidates 方案候選",
        eyebrow: "Plan Candidates",
        description: "根據客戶狀態，標記適合進入 3 次、12 次或長期方案的人",
        status: "MVP",
        cta: "前往模組",
        href: "/clinic/plan-candidates",
      },
      {
        title: "Case Assets 案例資產",
        eyebrow: "Case Assets",
        description: "把服務紀錄整理成可回顧、可教學、可轉換的品牌資產",
        status: "MVP",
        cta: "前往模組",
        href: "/clinic/cases",
      },
    ],
  },
  {
    kicker: "Business Growth",
    title: "營運成長系統",
    description: "協助 BodyFix 管理轉換、方案、拆帳、權限與未來團隊化營運。",
    modules: [
      {
        title: "Conversion Offer System 轉換提案系統",
        eyebrow: "Conversion Offer System",
        description: "從服務紀錄延伸出續約提案、方案建議與追蹤節奏",
        status: "MVP",
        cta: "前往模組",
        href: "/clinic/conversion",
      },
      {
        title: "Business Foundation Engine 商業基礎引擎",
        eyebrow: "Business Foundation Engine",
        description: "整理服務權限、拆帳規則、員工等級與商業邏輯",
        status: "MVP",
        cta: "前往模組",
        href: "/clinic/business-foundation",
      },
      {
        title: "Commission Calculator 拆帳計算",
        eyebrow: "Commission Calculator",
        description: "計算不同服務、員工等級與成交來源下的分潤規則",
        status: "Future",
        cta: "規劃中",
      },
      {
        title: "Staff Permission 員工權限",
        eyebrow: "Staff Permission",
        description: "管理未來合作教練、助理、實習生可操作的服務範圍",
        status: "Future",
        cta: "規劃中",
      },
      {
        title: "Finance Dashboard 財務儀表板",
        eyebrow: "Finance Dashboard",
        description: "追蹤營收、服務類型、客單價、續約率與月營運狀態",
        status: "Future",
        cta: "規劃中",
      },
      {
        title: "Membership System 會員制系統",
        eyebrow: "Membership System",
        description: "建立月訂閱、年度維護與長期身體狀態管理方案",
        status: "Future",
        cta: "規劃中",
      },
    ],
  },
  {
    kicker: "Public Tools",
    title: "公開工具與導流入口",
    description:
      "這些工具負責教育市場、收集需求、建立信任，並將使用者導向預約或進一步整理服務。",
    modules: [
      {
        title: "BF Knowledge 知識補給站",
        eyebrow: "BF Knowledge",
        description: "身體狀態、筋膜、神經系統、關係與自我覺察的內容入口",
        status: "Future",
        cta: "規劃中",
      },
      {
        title: "BF Tarot 工具集",
        eyebrow: "BF Tarot",
        description: "整合 SADM、海王雷達、特殊牌陣與關係狀態整理工具",
        status: "Future",
        cta: "規劃中",
      },
      {
        title: "Zi Wei Structural Analysis 紫微結構解析",
        eyebrow: "ZI WEI STRUCTURAL ANALYSIS",
        description:
          "收集出生資料與提問主題，使用文墨天機作為外部排盤工具，由 Gavin 進行命盤結構、四化流動、時間節奏與當前課題整理。",
        status: "Future",
        cta: "規劃中",
      },
      {
        title: "City Sessions 城市場次",
        eyebrow: "City Sessions",
        description: "管理台中、高雄、台南、新竹等城市出差與需求登記",
        status: "MVP",
        cta: "前往模組",
        href: "/clinic/city-sessions",
      },
      {
        title: "Location Demand 地點需求分析",
        eyebrow: "Location Demand",
        description: "收集台北不同區域與外縣市需求，協助決定未來服務據點",
        status: "MVP",
        cta: "前往模組",
        href: "/clinic/location-dashboard",
      },
      {
        title: "Client Portal 客戶入口",
        eyebrow: "Client Portal",
        description: "讓客戶查看預約、紀錄摘要、居家建議與追蹤提醒",
        status: "Future",
        cta: "規劃中",
      },
    ],
  },
];

const phases = [
  {
    label: "Phase 1",
    title: "Current MVP",
    items: ["Booking", "Booking Admin", "Dashboard", "SADM", "海王雷達 v2"],
  },
  {
    label: "Phase 2",
    title: "Clinic System",
    items: ["個案檔案", "快速記錄", "服務紀錄", "追蹤提醒", "方案候選", "案例資產"],
  },
  {
    label: "Phase 3",
    title: "Business Engine",
    items: ["轉換提案", "拆帳計算", "員工權限", "財務儀表板", "會員制"],
  },
  {
    label: "Phase 4",
    title: "AI Copilot",
    items: ["客戶摘要", "追蹤建議", "提案文案", "地點需求分析", "內容轉換建議"],
  },
  {
    label: "Phase 5",
    title: "Public Growth",
    items: ["BF Knowledge", "BF Tarot 工具集", "Zi Wei Structural Analysis Intake", "城市場次", "客戶入口", "App Prototype"],
  },
];

const ziWeiSteps = [
  "使用者填寫出生資料與想問主題",
  "Gavin 使用文墨天機等外部工具排盤",
  "Gavin 手動補入命盤重點與解析方向",
  "BodyFix OS 保存紫微個案紀錄",
  "導向預約、私訊或付費解析",
];

const ziWeiFieldPlan = [
  "稱呼",
  "出生年月日",
  "出生時間",
  "出生地",
  "性別",
  "是否知道真太陽時",
  "想問主題",
  "目前卡住的問題",
  "是否已有文墨天機命盤截圖",
  "命盤截圖上傳，可選",
  "命盤來源：文墨天機 / 其他 / 尚未排盤",
  "排盤狀態：待排盤 / 已排盤 / 已解析 / 已完成",
  "命盤重點，Gavin 手動輸入",
  "解析主題：職涯 / 關係 / 財務 / 流年 / 個人品牌 / 重大選擇",
];

function isCosmicModule(module: HubModule) {
  const cosmicKeywords = ["SADM", "Tarot", "Sea King", "Radar", "ZI WEI", "Zi Wei", "紫微", "海王", "星圖", "Cosmic"];
  return cosmicKeywords.some((keyword) =>
    [module.title, module.eyebrow, module.description].some((value) => value?.includes(keyword))
  );
}

function ModuleCard({ module }: { module: HubModule }) {
  const isCosmic = isCosmicModule(module);
  const cardClassName = `hub-module-card${isCosmic ? " cosmic-module-card" : ""}${module.href ? " hub-module-card-link" : " hub-module-card-disabled"}`;
  const cardContent = (
    <>
      <div className="hub-card-topline">
        <span className={`hub-status hub-status-${module.status.toLowerCase().replaceAll(" ", "-")}`}>
          {module.status}
        </span>
      </div>
      {module.eyebrow ? <p className={`hub-card-eyebrow${isCosmic ? " cosmic-meta" : ""}`}>{module.eyebrow}</p> : null}
      <h3>{module.title}</h3>
      <p>{module.description}</p>
      <span className={module.href ? "hub-card-cta" : "hub-card-cta hub-card-cta-disabled"}>
        {module.href ? module.cta : "規劃中"}
      </span>
    </>
  );

  if (module.href) {
    return (
      <Link className={cardClassName} href={module.href}>
        {cardContent}
      </Link>
    );
  }

  return (
    <article className={cardClassName}>
      {cardContent}
    </article>
  );
}

function HubSectionBlock({ section }: { section: HubSection }) {
  return (
    <section className="hub-section" aria-labelledby={`${section.kicker}-title`}>
      <div className="hub-section-heading">
        <p>{section.kicker}</p>
        <h2 id={`${section.kicker}-title`}>{section.title}</h2>
        <span />
      </div>
      <p className="hub-section-copy">{section.description}</p>
      <div className="hub-module-grid">
        {section.modules.map((module) => (
          <ModuleCard key={module.title} module={module} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="hub-page">
      <div className="hub-shell">
        <section className="hub-hero" aria-labelledby="hub-title">
          <div className="hub-hero-copy">
            <div className="hub-brand-row">
              <span className="bf-logo-box">BF</span>
              <span>BodyFix Operating System</span>
            </div>
            <div className="hub-badge-row" aria-label="Hub status">
              <span>MVP</span>
              <span>Internal Hub</span>
              <span>System Map</span>
            </div>
            <h1 id="hub-title">BodyFix OS MVP</h1>
            <p className="hub-lead">你的身體服務、預約管理、關係工具與營運系統中樞</p>
            <p className="hub-hero-note">
              目前已串接 Dashboard、Booking、Booking Admin、SADM 與海王雷達 v2。
            </p>
          </div>
          <div className="hub-hero-panel" aria-hidden="true">
            <span className="hub-node hub-node-active">Service</span>
            <span className="hub-node">Booking</span>
            <span className="hub-node">Clinic</span>
            <span className="hub-node hub-node-gold">Tools</span>
            <div className="hub-orbit" />
          </div>
        </section>

        <section className="hub-section hub-current" aria-labelledby="current-modules-title">
          <div className="hub-section-heading">
            <p>Current Modules</p>
            <h2 id="current-modules-title">目前已啟用</h2>
            <span />
          </div>
          <p className="hub-section-copy">
            這些模組目前已可進入使用，是 BodyFix OS 的第一批核心入口。
          </p>
          <div className="hub-module-grid hub-current-grid">
            {currentModules.map((module) => (
              <ModuleCard key={module.title} module={module} />
            ))}
          </div>
        </section>

        {roadmapSections.map((section) => (
          <HubSectionBlock key={section.kicker} section={section} />
        ))}

        <section className="hub-roadmap" aria-labelledby="future-roadmap-title">
          <div className="hub-section-heading">
            <p>Future Roadmap</p>
            <h2 id="future-roadmap-title">未來擴張方向</h2>
            <span />
          </div>
          <p className="hub-section-copy">
            以下模組不一定立即開發，但會作為 BodyFix OS 長期產品化的方向。
          </p>
          <div className="hub-phase-list">
            {phases.map((phase) => (
              <article className="hub-phase" key={phase.label}>
                <div>
                  <span>{phase.label}</span>
                  <h3>{phase.title}</h3>
                </div>
                <ul>
                  {phase.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="hub-ziwei-plan" aria-labelledby="ziwei-part-9-title">
            <div>
              <p className="hub-card-eyebrow cosmic-meta">Part 9 Planned</p>
              <h3 id="ziwei-part-9-title">Part 9｜Zi Wei Structural Analysis Intake</h3>
              <p>
                紫微結構解析的第一版不會製作完整自動排盤引擎。系統會先負責收集出生資料、提問主題與命盤截圖，Gavin 使用文墨天機等外部工具完成排盤後，再將命盤重點與解析紀錄整理回 BodyFix OS。
              </p>
              <div className="bf-notice">
                目前不串接文墨天機 API。若未來有正式 API 或授權方式，再評估是否進行自動化整合。
              </div>
            </div>
            <ol className="hub-step-list">
              {ziWeiSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="hub-field-plan">
              <p className="hub-card-eyebrow cosmic-meta">Future intake fields</p>
              <div>
                {ziWeiFieldPlan.map((field) => (
                  <span key={field}>{field}</span>
                ))}
              </div>
            </div>
          </div>

        </section>

        <footer className="hub-footer">
          <p>
            BodyFix OS 正在把服務、預約、資料、工具與內容入口，整理成一套可擴張的品牌系統。
          </p>
        </footer>
      </div>
    </main>
  );
}
