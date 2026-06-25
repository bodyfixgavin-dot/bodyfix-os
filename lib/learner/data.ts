import type { BodyTextCase, CapabilityNode, CrossReadPrompt, ReadingLens, ReadPosition } from "./types";

export const bodyTextCases: BodyTextCase[] = [
  { id: "text-001", title: "骨盆高度與承重差異", summary: "站姿中可見骨盆高度差，動態任務中出現軀幹偏移，但目前不足以判定主要來源。", status: "可進入", href: "/learner/field/text-001" },
  { id: "text-002", title: "深蹲偏移與任務變異", summary: "偏移並非每次出現，且會隨速度、深度與站距改變。", status: "示範文本" },
  { id: "text-003", title: "肩頸不適與守界訊號", summary: "表面看似一般肩頸不適，但追加資訊可能要求讀體者停止實作流程。", status: "示範文本" },
];

export const initialCaseObservations = [
  "站姿中，依目前拍攝角度與參照點，右側骨盆視覺高度高於左側",
  "深蹲時軀幹有時略向左偏",
  "個案自述右側腰部較容易出現痠緊感",
  "左右腳的主觀承重感受不同",
];

export const crossReadPrompts: CrossReadPrompt[] = [
  { text: "請把目前可直接觀察的現象，與你對它的解釋分開記錄。" },
  { text: "除了局部張力之外，還有哪些支撐、呼吸、任務條件或生活脈絡，也可能解釋目前現象？" },
  { text: "哪一項追加資訊，最可能支持或削弱你目前的假設？" },
];

export const readingLenses: ReadingLens[] = [
  { name: "支撐鏡頭", question: "身體現在靠哪裡撐住自己？" },
  { name: "呼吸與壓力鏡頭", question: "壓力能否在身體內流動、擴張並支持動作？" },
  { name: "張力傳遞鏡頭", question: "張力從哪裡進來，又被送往哪裡？" },
  { name: "動作策略鏡頭", question: "身體用什麼方法完成眼前任務，又付出了什麼代價？" },
  { name: "生長脈絡鏡頭", question: "這個張力是在什麼生活、訓練與歷史中長出來的？" },
];

const questions: Record<ReadPosition["stage"], string[]> = {
  READ: ["目前能被直接看見或描述的現象是什麼？", "哪些線索值得被重複確認？", "目前假設如何與已觀察現象分開？"],
  RESET: ["接觸前需要確認哪些界線？", "什麼劑量仍屬低風險探索？", "身體回應如何改變下一步判斷？"],
  RECONNECT: ["哪些部位需要重新分工？", "張力或支撐如何被傳遞？", "整合後能否回到任務脈絡？"],
  RETURN: ["回到日常使用時要觀察什麼？", "哪些證據支持目前判斷？", "哪裡仍應保留守界？"],
};

export const readPositions: ReadPosition[] = ["READ", "RESET", "RECONNECT", "RETURN"].flatMap((stage, groupIndex) =>
  ["現象位", "線索位", "假設位", "接觸位", "劑量位", "回應位", "分工位", "傳遞位", "整合位", "使用位", "證據位", "守界位"]
    .slice(groupIndex * 3, groupIndex * 3 + 3)
    .map((name, offset) => ({ index: groupIndex * 3 + offset + 1, name, question: questions[stage as ReadPosition["stage"]][offset], stage: stage as ReadPosition["stage"] }))
);

export const capabilityNodes: CapabilityNode[] = [
  { name: "站姿觀察", status: "observing", note: "Demo：已有初步閱讀紀錄，尚未接入資料。" },
  { name: "低風險動作任務", status: "guided", note: "Demo：僅適合在明確框架下練習。" },
  { name: "證據整理", status: "observing", note: "Demo：等待更多實作紀錄。" },
  { name: "界外轉介判斷", status: "unexplored", note: "Demo：尚未接觸，不代表不具備。" },
];
