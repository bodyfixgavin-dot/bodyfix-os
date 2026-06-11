export const SPACE_TYPES = [
  { id: "work", label: "工作與聚焦", note: "整理節奏、界線與完成感" },
  { id: "rest", label: "休息與安定", note: "讓身體知道可以慢下來" },
  { id: "welcome", label: "入口與人氣", note: "建立迎接、交流與存在感" },
  { id: "create", label: "創作與靈感", note: "保留流動、試驗與表達空間" },
] as const;

export const DIRECTIONS = ["北", "東北", "東", "東南", "南", "西南", "西", "西北", "中央"] as const;
export const GRID_LABELS = ["東南｜流動", "南｜顯化", "西南｜安定", "東｜啟動", "中央｜主場", "西｜收斂", "東北｜累積", "北｜沉澱", "西北｜支持"];
export const RISING_SIGNS = ["牡羊", "金牛", "雙子", "巨蟹", "獅子", "處女", "天秤", "天蠍", "射手", "摩羯", "水瓶", "雙魚"];

export const CRYSTAL_TYPES = [
  { id: "stability", name: "穩定系", crystal: "黑碧璽", color: "墨黑與土色", description: "適合需要界線、安定感與降低雜訊的角落。", actions: ["先清空桌面一角", "放在入口或工作區邊界", "搭配低矮、厚葉植物"] },
  { id: "focus", name: "聚焦系", crystal: "拉長石", color: "灰藍與銀色", description: "適合工作、閱讀與需要切換進入狀態的位置。", actions: ["保留單一視覺焦點", "移除不屬於當下任務的物件", "搭配直立葉型"] },
  { id: "social", name: "人氣系", crystal: "粉晶", color: "暖粉與米白", description: "適合入口、接待與希望增加柔和交流感的區域。", actions: ["增加一盞暖光", "放在視線容易停留處", "搭配圓葉植物"] },
  { id: "creative", name: "創作系", crystal: "紫水晶", color: "紫色與透明感", description: "適合創作、企劃與需要保留想像空間的角落。", actions: ["留一塊可變動展示面", "保留未完成作品", "搭配垂墜或線性植物"] },
  { id: "protect", name: "保護系", crystal: "煙水晶", color: "煙棕與深灰", description: "適合靠近門口、多人使用或容易被打斷的位置。", actions: ["明確標出使用邊界", "放在動線交界", "搭配耐受度高的植物"] },
  { id: "clear", name: "清理系", crystal: "白水晶", color: "透明與白色", description: "適合想重新開始、清除堆積感與提升明亮度的空間。", actions: ["先丟棄三件不需要的物品", "清潔反光表面", "搭配清爽淺色盆器"] },
] as const;

export function getBirthElement(date: string) {
  const year = Number(date.slice(0, 4)) || 1990;
  return ["木", "火", "土", "金", "水"][year % 5];
}

export function getElementColor(element: string) {
  return ({ 木: "苔綠", 火: "暖紅", 土: "砂岩", 金: "霧白", 水: "深藍" } as Record<string, string>)[element] || "苔綠";
}

export function getSunSign(date: string) {
  const month = Number(date.slice(5, 7)) || 1;
  return RISING_SIGNS[(month + 8) % 12];
}

export function getRecommendedCrystals(spaceType: string, direction: string) {
  const map: Record<string, string[]> = { work: ["focus", "stability"], rest: ["stability", "clear"], welcome: ["social", "protect"], create: ["creative", "clear"] };
  const ids = map[spaceType] || map.work;
  if (["北", "西北"].includes(direction)) ids.reverse();
  return CRYSTAL_TYPES.filter((item) => ids.includes(item.id));
}

export function getGridHighlights(direction: string) {
  const index = Math.max(0, DIRECTIONS.indexOf(direction as never));
  return [index, (index + 4) % 9, (index + 6) % 9];
}

export function getPlantRec(spaceType: string) {
  return ({ work: "虎尾蘭或直立葉型植物", rest: "圓葉椒草或柔軟葉型植物", welcome: "圓葉、向外生長的植物", create: "垂墜或線性、可自由塑形的植物" } as Record<string, string>)[spaceType] || "容易照顧的綠色植物";
}

export function getAvoidZone(direction: string) {
  return direction === "中央" ? "避免把中央區域堆滿，替日常保留轉身與呼吸的空間。" : `避免在${direction}堆放過多未分類物件，先讓動線清楚。`;
}
