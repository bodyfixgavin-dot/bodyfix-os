export type BodyFixService = {
  id: string;
  name: string;
  duration: string;
  price?: string;
  description: string;
  badge?: string;
};

export type IntakeService = BodyFixService & { english: string; minutes: number | null; amount: number | null; extension?: number; legacyCode?: string };

// Stable IDs remain valid for historical references; only active services enter public intake.
export const INTAKE_SERVICES: IntakeService[] = [
  { id: "body-reset", name: "肌筋膜整理按摩", english: "Myofascial Reset", duration: "60 分鐘", minutes: 60, amount: 2200, price: "NT$2,200", extension: 1000, legacyCode: "fascia_chain_reset_60", badge: "BodyFix 核心服務", description: "透過筋膜線判讀與張力分工整理，讓肌肉與外層筋膜回到更穩定、有韌性與彈性的狀態。" },
  { id: "relaxation", name: "放鬆按摩", english: "Relaxation Massage", duration: "60 分鐘", minutes: 60, amount: 1600, price: "NT$1,600", extension: 700, description: "適合日常疲勞、工作後放鬆，以及想舒緩身體緊繃的人。" },
  { id: "multi-line", name: "多條筋膜線整合", english: "Multi-Line Integration", duration: "90 分鐘", minutes: 90, amount: 3600, price: "NT$3,600", legacyCode: "multi_line_reset_90", description: "適合需要同時整理多個身體區域或兩條以上筋膜線的需求。" },
  { id: "pelvic-core", name: "骨盆核心整理按摩", english: "Pelvic Core Reset", duration: "60 分鐘", minutes: 60, amount: 2500, price: "NT$2,500", extension: 1000, legacyCode: "pelvic_core_reset_60", badge: "目前限男性預約", description: "著重骨盆、髖部與核心周邊張力整理，採外部徒手方式，服務範圍將事前說明並取得同意。" },
  { id: "movement", name: "私人教練課", english: "Personal Training", duration: "單堂", minutes: null, amount: 1800, price: "NT$1,800", description: "依照個人訓練目標、動作品質、運動經驗與身體使用方式安排訓練。" },
  { id: "unsure", name: "還不確定，想先聽 Gavin 的建議", english: "Let’s discuss", duration: "討論後確認", minutes: null, amount: null, description: "先告訴我這次的需求，我們透過 LINE 一起確認適合的服務。" },
];
export const BODYFIX_SERVICES: BodyFixService[] = INTAKE_SERVICES.filter(s => !["movement", "unsure"].includes(s.id));
export const LEGACY_BODYFIX_SERVICES: BodyFixService[] = [
  { id: "fascia-line", name: "指定筋膜線", duration: "60 分鐘", price: "NT$2,300", description: "歷史方案，已停止公開預約。" },
  { id: "pelvic-vip", name: "Pelvic Core VIP", duration: "120 分鐘", price: "NT$6,800", description: "歷史方案，暫停公開預約。" },
];
export function intakeService(id: string) { return INTAKE_SERVICES.find(s => s.id === id); }
export function serviceQuote(id: string, extend: boolean) {
  const s = intakeService(id);
  const extended = !!(extend && s?.extension);
  return { name: s?.name ?? "尚未選擇", english: s?.english ?? "", duration: s?.minutes ? `${s.minutes + (extended ? 30 : 0)} 分鐘` : s?.duration ?? "待確認", minutes: s?.minutes ? s.minutes + (extended ? 30 : 0) : null, amount: s?.amount == null ? null : s.amount + (extended ? s.extension! : 0), extended };
}
export function formatPrice(amount: number | null) { return amount == null ? "討論後確認" : `NT$${amount.toLocaleString("en-US")}`; }

export const MOVEMENT_TRAINING = {
  id: "movement",
  name: "私人教練課",
  planName: "1 對 1 教練方案",
  duration: "60 分鐘",
  singlePrice: "NT$1,800",
  packages: [
    { sessions: "12 堂", price: "NT$20,400" },
    { sessions: "24 堂", price: "NT$38,400" },
    { sessions: "36 堂", price: "NT$54,000" },
    { sessions: "24 堂訓練＋12 次筋膜整理", price: "一次付清 NT$60,000" },
  ],
} as const;

export const LINE_URL = "https://line.me/R/ti/p/@359gzxzi";

export function serviceById(id: string) {
  return [...BODYFIX_SERVICES, ...LEGACY_BODYFIX_SERVICES].find((service) => service.id === id);
}
