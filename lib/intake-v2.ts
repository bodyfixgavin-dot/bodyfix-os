import { z } from "zod";
import { intakeService, serviceQuote, formatPrice, LINE_URL } from "./bodyfix-services";
export const WORK = ["長時間坐著", "長時間站立", "經常走動", "經常搬運重物", "長時間使用電腦或手機", "經常開車或騎車", "經常維持固定姿勢", "工作型態不固定", "其他"];
export const FREQUENCY = ["很少運動", "偶爾運動", "每週 1–2 次", "每週 3–4 次", "每週 5 次以上"];
export const SPORTS = ["重量訓練", "跑步", "球類運動", "游泳", "自行車", "瑜伽／皮拉提斯", "格鬥／拳擊", "有氧運動", "其他"];
export const NEEDS = ["肌肉容易緊繃", "身體容易疲勞", "久坐或久站後不舒服", "運動後恢復", "動作卡卡、不順暢", "希望增加活動空間", "想整理平常容易累積張力的區域", "單純想放鬆", "沒有特別問題，想做全身整理", "其他"];
export const REGIONS = ["頭部", "肩頸", "胸部", "上背", "下背／腰部", "手臂", "手腕／手掌", "腹部", "骨盆／髖部", "臀部", "大腿前側", "大腿後側", "小腿", "足部", "全身"];
export const FEELINGS = ["緊", "硬", "痠", "疼痛", "沉重", "容易疲勞", "活動時卡住", "左右感覺不一樣", "沒有明顯不舒服"];
export const DURATIONS = ["最近幾天", "一週至一個月", "一至三個月", "三至六個月", "半年以上", "長期反覆出現"];
export const GOALS = ["增加肌肉量", "減少體脂", "改善體態", "增加肌力", "提升動作品質", "建立運動習慣", "提升運動表現", "其他"];
export const EXPERIENCE = ["完全沒有經驗", "有一些運動經驗", "已有固定訓練習慣", "有多年重量訓練經驗"];
export const SAFETY_FLAGS = ["近期受傷、手術或骨折", "急性疼痛或不明原因的嚴重不適", "發燒、感染或急性發炎", "影響服務安全的疾病、用藥或身體狀況", "醫師建議避免的運動或按摩方式", "其他需要事前告知的注意事項"];
export const SAFETY = ["沒有上述需要告知的狀況", "有需要事前告知的狀況", "不確定，希望先討論"];
export const TIMES = ["14:00", "17:00", "19:00", "22:00", "其他時間，想另外討論"];
const str = () => z.string().trim().max(2000, "請縮短至 2,000 字內").default("");
const choices = (values: string[]) => z.array(z.string().refine(v => values.includes(v), "請選擇有效選項")).max(values.length).default([]);
const one = (values: string[]) => z.string().refine(v => v === "" || values.includes(v), "請選擇有效選項").default("");
export const intakeSchema = z.object({
  version: z.literal("2.0").default("2.0"),
  visit: one(["第一次預約", "我之前來過"]), name: z.string().trim().max(80).default(""),
  contact: z.string().trim().max(120).default(""), contactMethod: one(["LINE", "電話", "Instagram"]),
  updateProfile: z.boolean().default(false), birthMode: one(["不提供", "生日", "年齡"]), birthday: str(), age: str(), height: str(), weight: str(), occupation: z.string().trim().max(120).default(""),
  work: choices(WORK), exerciseFrequency: one(FREQUENCY), sports: choices(SPORTS),
  service: str(), extended: z.boolean().default(false), needs: choices(NEEDS), regions: choices(REGIONS), feelings: choices(FEELINGS), duration: one(DURATIONS), notes: str(),
  trainingGoals: choices(GOALS), experience: one(EXPERIENCE), pelvicRegions: choices(["腹部", "骨盆／髖部", "臀部", "大腿內側", "現場討論"]), pelvicProcess: one(["希望事前了解", "現場說明即可"]), pelvicConsent: z.boolean().default(false), adultMale: z.boolean().default(false),
  safety: one(SAFETY), safetyFlags: choices(SAFETY_FLAGS), safetyNote: str(), noTouch: str(),
  date: str(), time: one(TIMES), place: str(), privacyConsent: z.boolean().default(false), serviceConsent: z.boolean().default(false),
});
export type IntakeAnswers = z.infer<typeof intakeSchema>;
export const emptyIntake = () => intakeSchema.parse({});
export function taipeiToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
export function birthProfile(birthday: string, now = new Date()) {
  if (!validDate(birthday) || birthday > taipeiToday(now)) return null;
  const [y, m, d] = birthday.split("-").map(Number);
  const [cy, cm, cd] = taipeiToday(now).split("-").map(Number);
  const signs = ["摩羯座", "水瓶座", "雙魚座", "牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座", "天秤座", "天蠍座", "射手座", "摩羯座"];
  const edges = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
  return { age: cy - y - (cm < m || (cm === m && cd < d) ? 1 : 0), sunSign: signs[d < edges[m - 1] ? m - 1 : m], annualBirthday: birthday.slice(5) };
}
export function showsDuration(a: IntakeAnswers) {
  return a.service !== "movement" && a.feelings.some(f => f !== "沒有明顯不舒服");
}
// Inactive fields remain in browser memory for editing, but never in the submitted record.
export function normalizeIntake(a: IntakeAnswers): IntakeAnswers {
  const n = { ...a };
  if (n.visit === "我之前來過" && !n.updateProfile) Object.assign(n, { birthMode: "", birthday: "", age: "", height: "", weight: "", occupation: "", work: [], exerciseFrequency: "", sports: [] });
  if (n.birthMode !== "生日") n.birthday = "";
  if (n.birthMode !== "年齡") n.age = "";
  if (!n.exerciseFrequency || n.exerciseFrequency === "很少運動") n.sports = [];
  if (n.service === "movement") Object.assign(n, { needs: [], regions: [], feelings: [], duration: "" });
  else Object.assign(n, { trainingGoals: [], experience: "" });
  if (n.service !== "pelvic-core") Object.assign(n, { pelvicRegions: [], pelvicProcess: "", pelvicConsent: false, adultMale: false });
  if (n.safety === SAFETY[0]) Object.assign(n, { safetyFlags: [], safetyNote: "" });
  if (!showsDuration(n)) n.duration = "";
  if (!intakeService(n.service)?.extension) n.extended = false;
  return n;
}
export function validateIntake(a: IntakeAnswers, now = new Date()): Record<string, string> {
  const e: Record<string, string> = {};
  const required: [keyof IntakeAnswers, string][] = [["visit", "請選擇第一次或回訪"], ["name", "請填寫稱呼"], ["contact", "請留下一種可辨識你的聯絡資訊"], ["contactMethod", "請選擇聯絡方式"], ["service", "請選擇本次服務"], ["date", "請選擇希望日期"], ["time", "請選擇希望時間"], ["place", "請選擇希望地點"], ["safety", "請確認近期健康狀況"], ["privacyConsent", "請同意資料使用說明"], ["serviceConsent", "請確認非醫療服務與服務前安全說明"]];
  required.forEach(([k, msg]) => { if (!a[k]) e[k] = msg; });
  if (a.service && !intakeService(a.service)) e.service = "請重新選擇目前開放的服務";
  if (a.date && (!validDate(a.date) || a.date < taipeiToday(now))) e.date = "請選擇台北時間今天或之後的日期";
  if (a.birthday && (!birthProfile(a.birthday, now) || birthProfile(a.birthday, now)!.age > 120)) e.birthday = "請選擇有效的出生年月日";
  if (a.birthMode === "生日" && !a.birthday) e.birthday = "請選完整生日，或改選不提供";
  for (const [k, min, max] of [["height", 50, 260], ["weight", 15, 400], ["age", 1, 120]] as const) {
    if (a[k] && (!Number.isFinite(Number(a[k])) || Number(a[k]) < min || Number(a[k]) > max || (k === "age" && !Number.isInteger(Number(a[k]))))) e[k] = `請輸入 ${min}–${max} 的${k === "age" ? "整數" : "數字"}`;
  }
  if (a.service === "pelvic-core") {
    if (!a.adultMale) e.adultMale = "此服務目前限年滿 18 歲男性，請確認或改選其他服務";
    if (!a.pelvicConsent) e.pelvicConsent = "請確認外部徒手方式與逐項現場同意";
    if (a.birthday && (birthProfile(a.birthday, now)?.age ?? 0) < 18 || a.age && Number(a.age) < 18) e.adultMale = "未滿 18 歲請改選其他服務或先聯絡 Gavin";
  }
  return e;
}
export type IntakeRecord = { version: "2.0"; answers: IntakeAnswers; quote: ReturnType<typeof serviceQuote>; profile: ReturnType<typeof birthProfile>; placeName: string; createdAt: string; ageAsOf: string; consentVersion: string };
export function bookingSummary(a: IntakeAnswers, placeName: string, reference?: string) {
  a = normalizeIntake(a);
  const q = serviceQuote(a.service, a.extended);
  const birth = birthProfile(a.birthday);
  const optional = (label: string, value: string | undefined) => value ? `${label}：${value}` : "";
  // Explicit allowlist. Never copy contact, DOB, health history, safety flags,
  // free-text notes, private touch boundaries or pelvic-specific details.
  return ["【BodyFix 預約需求】", `稱呼：${a.name}`, `身分：${a.visit}`,
    optional("年齡", birth ? `${birth.age} 歲` : a.age ? `${a.age} 歲` : ""), optional("星座", birth?.sunSign),
    optional("身高", a.height ? `${a.height} cm` : ""), optional("體重", a.weight ? `${a.weight} kg` : ""),
    optional("職業", a.occupation), optional("工作型態", a.work.join("、")), optional("運動習慣", a.exerciseFrequency), optional("運動類型", a.sports.join("、")),
    `服務：${q.name}`, `時長：${q.duration}`, `預估價格：${formatPrice(q.amount)}`,
    optional("主要身體需求", (a.service === "movement" ? a.trainingGoals : a.needs).join("、")), optional("希望整理部位", a.regions.join("、")),
    `希望日期：${a.date}`, `希望時間：${a.time}`, `希望地點：${placeName}`,
    reference ? `資料編號：${reference}` : "同步狀態：尚未確認同步，請以此摘要聯繫 Gavin。",
    "請 Gavin 協助確認實際服務時間；尚未確認預約，服務前仍須安全確認。"].filter(Boolean).join("\n");
}
export function lineBookingUrl() {
  // Copy then open the existing official account. No personal data in URLs.
  return LINE_URL;
}
