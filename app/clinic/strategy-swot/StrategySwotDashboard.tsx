"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClinicShell } from "@/components/clinic/ClinicShell";

type QuadrantKey = "strengths" | "opportunities" | "weaknesses" | "threats";
type TabKey = "swot" | "unseen";

type StrategyPoint = {
  title: string;
  summary: string;
  details: string[];
};

type Quadrant = {
  key: QuadrantKey;
  label: string;
  english: string;
  note: string;
  points: StrategyPoint[];
};

const quadrantOrder = ["strengths", "opportunities", "weaknesses", "threats"] as const;

const quadrants: Record<QuadrantKey, Quadrant> = {
  strengths: {
    key: "strengths",
    label: "優勢",
    english: "Strengths",
    note: "已經沉澱成 BodyFix OS 資產的能力。",
    points: [
      {
        title: "服務不是單次手技，而是可累積的判讀系統",
        summary: "從 intake、service records、follow-up 到 conversion，已經有完整狀態流。",
        details: ["客戶資料能被回顧、比較與轉換，不只依靠當下記憶。", "每次服務後都能沉澱成案例、方案候選與後續追蹤節奏。"],
      },
      {
        title: "BodyFix OS 能把老闆腦內決策顯性化",
        summary: "商業規則、Staff Permission、拆帳與城市場次可以逐步產品化。",
        details: ["這讓未來訓練員工或合作夥伴時，不必每件事都靠口頭傳承。", "內部規則先整理成儀表板，再決定哪些部分能自動化。"],
      },
      {
        title: "品牌氣質清楚",
        summary: "深海軍藍、米白、暖金與留白感，能承載高級、安定、專業的定位。",
        details: ["不是廉價促銷型健康產業視覺，也不是一般 SaaS dashboard。", "可把身體服務、關係工具與策略中樞收束在同一套 OS 語言裡。"],
      },
    ],
  },
  opportunities: {
    key: "opportunities",
    label: "機會",
    english: "Opportunities",
    note: "讓 BodyFix 從個人服務走向平台化的入口。",
    points: [
      {
        title: "會員制與續航方案",
        summary: "把回訪、維護與訓練整合成長期身體狀態管理。",
        details: ["會員制不只是折扣，而是穩定現金流與關係深度。", "可從 3 次短週期、12 次完整計畫，再延伸到月訂閱或年度維護。"],
      },
      {
        title: "城市擴張與地區需求分析",
        summary: "台北不同區域與外縣市場可先用需求資料驗證，不靠直覺硬開點。",
        details: ["城市場次可測試客群密度、價格接受度與場地合作品質。", "需求儀表板能幫助判斷何時從快閃場次進入固定據點。"],
      },
      {
        title: "平台化與教練整合",
        summary: "未來可把評估、整理、訓練、追蹤拆成不同角色權限。",
        details: ["Staff Permission 會是從個人品牌走向團隊化的核心骨架。", "BodyFix OS 可成為合作教練與助理的作業系統，而不只是內部筆記。"],
      },
    ],
  },
  weaknesses: {
    key: "weaknesses",
    label: "弱點",
    english: "Weaknesses",
    note: "若不處理，會限制成長速度與穩定度。",
    points: [
      {
        title: "45 場次天花板",
        summary: "若收入主要綁在 Gavin 個人服務時數，月收上限會很快碰到。",
        details: ["單月可服務場次有限，身體負荷與品質控管都會形成天花板。", "必須讓方案、會員、內容、合作角色分攤營收來源。"],
      },
      {
        title: "現金流仍可能受淡旺季影響",
        summary: "若續約與預收機制不足，營收會隨預約波動。",
        details: ["會員制與計畫型方案需要明確節奏，否則只是單次服務重新命名。", "財務儀表板應追蹤客單價、續約率、預收比與月固定成本。"],
      },
      {
        title: "模組複雜度增加",
        summary: "Clinic、Conversion、AI Copilot、城市需求與商業規則若不同步，會變成維護成本。",
        details: ["每個新模組都要先問：它是否讓決策更清楚，或只是多一頁資料。", "需要定期清理欄位、狀態與權限，避免 OS 變成資料迷宮。"],
      },
    ],
  },
  threats: {
    key: "threats",
    label: "威脅",
    english: "Threats",
    note: "外部或系統性風險，不能放在公開官網。",
    points: [
      {
        title: "品牌被誤讀成不穩定或太複雜",
        summary: "弱點、威脅、現金流與 localStorage 隱患等字句若公開，會造成錯誤解讀。",
        details: ["這頁必須保持 admin-only，只作為內部策略檢查。", "對客戶端只呈現清楚服務價值，不呈現老闆腦內戰略與營運風險。"],
      },
      {
        title: "localStorage 與前端狀態不適合承載敏感策略",
        summary: "內部策略頁先用靜態內容可以，但登入與權限必須由後端 session 控制。",
        details: ["策略內容不可依賴純前端隱藏或 localStorage 判斷。", "未登入 admin 時，伺服器端就應 redirect，避免頁面內容被載入。"],
      },
      {
        title: "競品可以複製外觀，但不容易複製決策系統",
        summary: "真正護城河不是頁面，而是服務紀錄、方案判斷與持續迭代的營運語言。",
        details: ["若只做漂亮 dashboard，價值很薄；若每週用它修正方向，才會變資產。", "策略頁要協助判斷 BodyFix OS 是否往資產化走，而不是只看今天有沒有客人。"],
      },
    ],
  },
};

const unseenViews: StrategyPoint[] = [
  {
    title: "不要只看本週有沒有客人，要看資產是否變厚",
    summary: "每週檢查：新增了哪些可重複使用的紀錄、規則、案例、方案或權限設計？",
    details: ["如果一週很忙但沒有沉澱任何資料，BodyFix 還是停在個人勞務。", "如果一週服務量普通但新增了可複用規則，OS 的長期價值反而可能上升。"],
  },
  {
    title: "月收目標要拆成可控槓桿",
    summary: "不要只設定總額，應拆成場次、客單價、方案比例、續約率、會員收入與城市場次。",
    details: ["45 場次天花板提醒我們，成長不能只靠塞滿行事曆。", "每個槓桿都要有對應模組或固定檢查節奏。"],
  },
  {
    title: "Staff Permission 是平台化前的安全閥",
    summary: "先定義誰可以做什麼，再談擴張速度。",
    details: ["員工、助理、合作教練、實習生不應看到同樣資料或操作同樣服務。", "權限系統能保護客戶體驗，也保護 BodyFix 的方法論。"],
  },
];

function pointKey(group: string, title: string) {
  return `${group}:${title}`;
}

export function StrategySwotDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("swot");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const totals = useMemo(() => ({
    swot: quadrantOrder.reduce((sum, key) => sum + quadrants[key].points.length, 0),
    unseen: unseenViews.length,
  }), []);

  function toggle(key: string) {
    setExpanded((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <ClinicShell title="BodyFix OS 策略全局分析" subtitle="內部 admin-only 決策支援頁：檢視 BodyFix OS 的優勢、弱點、機會與風險。">
      <section className="bf-notice bf-section-gap">
        此頁為內部策略儀表板，不是公開官網內容。用來每週檢查 BodyFix OS 是否往資產化、會員制、城市擴張與平台化前進。
      </section>

      <section className="strategy-tabs bf-section-gap" role="tablist" aria-label="策略分析切換">
        <button type="button" role="tab" aria-selected={activeTab === "swot"} onClick={() => setActiveTab("swot")}>SWOT 四象限 <span>{totals.swot}</span></button>
        <button type="button" role="tab" aria-selected={activeTab === "unseen"} onClick={() => setActiveTab("unseen")}>未被意識到的觀點 <span>{totals.unseen}</span></button>
      </section>

      {activeTab === "swot" ? (
        <section className="strategy-swot-grid bf-section-gap" aria-label="SWOT 四象限">
          {quadrantOrder.map((key) => {
            const quadrant = quadrants[key];
            return (
              <article className={`strategy-quadrant strategy-quadrant-${quadrant.key}`} key={quadrant.key}>
                <div className="strategy-quadrant-heading">
                  <p>{quadrant.english}</p>
                  <h2>{quadrant.label}</h2>
                  <span>{quadrant.note}</span>
                </div>
                <div className="strategy-point-list">
                  {quadrant.points.map((point) => {
                    const itemKey = pointKey(quadrant.key, point.title);
                    const isExpanded = Boolean(expanded[itemKey]);
                    return (
                      <button className="strategy-point" type="button" aria-expanded={isExpanded} onClick={() => toggle(itemKey)} key={itemKey}>
                        <span className="strategy-point-label">{point.title}</span>
                        <span className="strategy-point-summary">{point.summary}</span>
                        {isExpanded ? <ul>{point.details.map((detail) => <li key={detail}>{detail}</li>)}</ul> : null}
                        <span className="strategy-point-action">{isExpanded ? "收合" : "展開檢視"}</span>
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="bf-card bf-section-gap strategy-unseen" aria-label="未被意識到的觀點">
          <p className="bf-kicker">Decision Support</p>
          <h2 className="bf-section-title">未被意識到的觀點</h2>
          <p className="bf-body-copy">這些不是要放給客人看的銷售話術，而是幫助內部判斷下一步是否正在累積可複製資產。</p>
          <div className="strategy-point-list">
            {unseenViews.map((point) => {
              const itemKey = pointKey("unseen", point.title);
              const isExpanded = Boolean(expanded[itemKey]);
              return (
                <button className="strategy-point" type="button" aria-expanded={isExpanded} onClick={() => toggle(itemKey)} key={itemKey}>
                  <span className="strategy-point-label">{point.title}</span>
                  <span className="strategy-point-summary">{point.summary}</span>
                  {isExpanded ? <ul>{point.details.map((detail) => <li key={detail}>{detail}</li>)}</ul> : null}
                  <span className="strategy-point-action">{isExpanded ? "收合" : "展開檢視"}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <footer className="strategy-footer bf-section-gap">
        <Link href="/clinic" aria-label="回到 BodyFix OS Hub"><span className="bf-logo-box">BF</span></Link>
        <span>BodyFix OS Strategy · Internal Use Only</span>
      </footer>
    </ClinicShell>
  );
}
