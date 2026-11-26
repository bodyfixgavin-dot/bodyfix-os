import { birthProfile, type IntakeRecord } from "@/lib/intake-v2";
import { formatPrice } from "@/lib/bodyfix-services";
const join = (v?: string[]) => v?.length ? v.join("、") : "未提供";
export function IntakeSummaryCard({ record }: { record: IntakeRecord }) {
  const a = record.answers;
  const birth = birthProfile(a.birthday);
  return <details className="bf-card" style={{ marginTop: 12, minWidth: 240 }}>
    <summary style={{ minHeight: 44, cursor: "pointer", fontWeight: 700 }}>服務前客戶摘要 · {a.name} · {a.visit}</summary>
    <h3>基本輪廓</h3>
    <p>{a.birthday ? `${a.birthday} · ${birth?.age ?? "—"} 歲 · ${birth?.sunSign ?? "—"}` : a.age ? `${a.age} 歲（填寫時自述）` : "生日／年齡未提供"}<br />身高：{a.height ? `${a.height} cm` : "未提供"} · 體重：{a.weight ? `${a.weight} kg` : "未提供"}<br />職業：{a.occupation || "未提供"}</p>
    <p>生活型態：{join(a.work)}<br />運動頻率：{a.exerciseFrequency || "未提供"}<br />運動項目：{join(a.sports)}</p>
    <h3>本次服務</h3>
    <p>{record.quote.name} · {record.quote.duration} · {formatPrice(record.quote.amount)}<br />希望安排：{a.date} {a.time}（台北時間）<br />地點：{record.placeName}</p>
    <p>主要需求：{join(a.needs)}<br />身體區域：{join(a.regions)}<br />身體感受：{join(a.feelings)}<br />持續時間：{a.duration || "未提供"}<br />補充：{a.notes || "未提供"}</p>
    {a.service === "movement" && <p>訓練目標：{join(a.trainingGoals)}<br />訓練經驗：{a.experience || "未提供"}</p>}
    {a.service === "pelvic-core" && <p>骨盆核心區域：{join(a.pelvicRegions)}<br />流程說明：{a.pelvicProcess || "現場再確認"}<br />外部徒手及成年男性條件：{a.pelvicConsent && a.adultMale ? "已確認" : "需確認"}；仍需現場逐項取得同意。</p>}
    <h3>安全資訊 · 僅限授權人員</h3>
    <p>{a.safety}<br />注意項目：{join(a.safetyFlags)}<br />安全補充：{a.safetyNote || "未提供"}<br />碰觸界線：{a.noTouch || "未填寫，服務前再次確認"}</p>
    <p>服務前再次確認：近期健康變化、醫囑／用藥限制、實際服務範圍與碰觸同意。填寫問卷不代表通過安全評估。</p>
    <h3>READ 現場了解方向</h3>
    <ul>{a.regions.length > 0 && <li>了解 {join(a.regions)} 在日常與動作中的實際感受。</li>}{a.work.includes("長時間坐著") && <li>詢問久坐期間的身體感受與休息安排，現場觀察胸椎活動及肩帶使用方式。</li>}{a.sports.length > 0 && <li>詢問近期 {join(a.sports)} 的安排、負荷與恢復情況。</li>}<li>依現場 READ 決定服務方向，不從職業或問卷推斷疾病或筋膜狀況。</li></ul>
    <h3>自然聊天參考</h3><p>{[a.occupation, a.exerciseFrequency, ...a.sports, a.birthday ? `生日 ${a.birthday.slice(5)} · ${birth?.sunSign || ""}` : ""].filter(Boolean).join(" · ") || "客戶未提供選填背景，可自然從本次需求聊起。"}</p>
    <small>資料版本 {record.version} · 填寫時間 {record.createdAt}；生日與星座不作為身體判讀依據。</small>
  </details>;
}
