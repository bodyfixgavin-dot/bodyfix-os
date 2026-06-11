export const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export const BRANCH_INDEX = Object.fromEntries(EARTHLY_BRANCHES.map((branch, index) => [branch, index]));
export const BRANCH_TO_PALACE: Record<string, string> = { 子: "沉澱宮", 丑: "累積宮", 寅: "啟動宮", 卯: "生長宮", 辰: "整合宮", 巳: "顯化宮", 午: "主場宮", 未: "安定宮", 申: "轉化宮", 酉: "收斂宮", 戌: "邊界宮", 亥: "流動宮" };
export const BRANCH_TO_STARS: Record<string, string[]> = { 子: ["天機", "太陰"], 丑: ["天府", "天相"], 寅: ["七殺", "破軍"], 卯: ["太陽", "天梁"], 辰: ["紫微", "天府"], 巳: ["廉貞", "貪狼"], 午: ["紫微", "太陽"], 未: ["天同", "太陰"], 申: ["武曲", "破軍"], 酉: ["武曲", "天相"], 戌: ["七殺", "天梁"], 亥: ["天機", "天同"] };

export function getDajunBranch(date: string) {
  const year = Number(date.slice(0, 4)) || 1990;
  return EARTHLY_BRANCHES[(year + new Date().getUTCFullYear()) % 12];
}
export function getSanFang(branch: string) {
  const start = BRANCH_INDEX[branch] ?? 0;
  return [0, 4, 8].map((step) => EARTHLY_BRANCHES[(start + step) % 12]);
}
export function getCurrentPhase(date: string) {
  const year = Number(date.slice(0, 4)) || 1990;
  const step = (new Date().getUTCFullYear() - year) % 10;
  return step < 3 ? "前 3 年｜開場" : step < 7 ? "中 4 年｜建立" : "後 3 年｜整合";
}
export function getPhaseStrategy(index: number) {
  return [
    { phase: "前 3 年", action: "清出入口、建立一個明確起點", plant: "直立葉型", crystal: "白水晶" },
    { phase: "中 4 年", action: "固定日常配置，讓空間支持長期節奏", plant: "厚葉常綠型", crystal: "拉長石" },
    { phase: "後 3 年", action: "收斂物件、留下真正代表你的配置", plant: "線性或雕塑型", crystal: "煙水晶" },
  ][index];
}
