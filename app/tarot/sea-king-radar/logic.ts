export type QuestionId =
  | "relationship_ambiguity"
  | "social_phone_secrecy"
  | "hot_cold_interaction"
  | "multi_line_flirting"
  | "emotional_manipulation"
  | "gaslighting_confusion"
  | "future_avoidance"
  | "lack_of_reciprocity";

export type SeaKingQuestion = {
  id: QuestionId;
  title: string;
  axisLabel: string;
  question: string;
  riskLabel: string;
  weight: number;
  scaleDescriptions: Record<number, string>;
};

export type RiskLevel = {
  label: string;
  range: string;
  copy: string;
  action: string;
};

export type ZodiacName =
  | "牡羊座"
  | "金牛座"
  | "雙子座"
  | "巨蟹座"
  | "獅子座"
  | "處女座"
  | "天秤座"
  | "天蠍座"
  | "射手座"
  | "摩羯座"
  | "水瓶座"
  | "雙魚座";

export const questions: SeaKingQuestion[] = [
  {
    id: "relationship_ambiguity",
    title: "關係不明確",
    axisLabel: "關係不明確",
    question: "他讓這段關係一直停在模糊狀態嗎？",
    riskLabel: "關係定位模糊",
    weight: 1.0,
    scaleDescriptions: {
      1: "關係很清楚，彼此知道定位",
      2: "大多清楚，偶爾有小模糊",
      3: "有時清楚有時模糊，開始讓我有點不安",
      4: "模糊次數增加，我常需要確認定位",
      5: "有時清楚，有時又模糊",
      6: "模糊狀態已經是常態，我常猜測他的想法",
      7: "幾乎不願確認關係，讓我反覆懷疑",
      8: "長期停在模糊，讓我情緒不穩",
      9: "完全不給定位，我已經很疲憊",
      10: "一直不確認、不承認、不給定位，讓我反覆猜測"
    }
  },
  {
    id: "social_phone_secrecy",
    title: "社交與手機神秘",
    axisLabel: "社交神秘",
    question: "他在手機、社群或生活圈上，讓你覺得很多事情被藏起來嗎？",
    riskLabel: "關係透明度不足",
    weight: 1.0,
    scaleDescriptions: {
      1: "很自然，不會刻意隱藏",
      2: "大多開放，偶爾有小隱私",
      3: "有些地方怪怪的，但我還能接受",
      4: "開始有迴避跡象，讓我有點在意",
      5: "有些地方怪怪的，但還不確定",
      6: "明顯迴避特定話題或社群",
      7: "經常不讓我看手機或朋友圈",
      8: "很多事情被刻意藏起來",
      9: "幾乎不公開我們關係",
      10: "明顯迴避、不讓看、不敢公開你，讓你覺得自己像不能被看見的人"
    }
  },
  {
    id: "hot_cold_interaction",
    title: "忽冷忽熱",
    axisLabel: "忽冷忽熱",
    question: "他的互動節奏會讓你一直被吊著嗎？",
    riskLabel: "不確定性上癮",
    weight: 1.2,
    scaleDescriptions: {
      1: "回應穩定，互動節奏清楚",
      2: "回應偶爾延遲，但整體還算穩定",
      3: "有時熱有時冷，開始影響心情",
      4: "忽冷忽熱頻率增加，讓我常猜測他的狀態",
      5: "偶爾忽冷忽熱，會影響心情",
      6: "時好時壞已經是常態，我常需要確認他是否在乎",
      7: "互動節奏很不穩定，嚴重影響我的情緒",
      8: "常常讓我陷入「他在不在乎」的循環",
      9: "幾乎每次互動都充滿不確定性",
      10: "常常時好時壞，讓我一直想確認他到底在不在乎"
    }
  },
  {
    id: "multi_line_flirting",
    title: "同時曖昧多人",
    axisLabel: "多線曖昧",
    question: "你感覺他同時保留很多曖昧可能嗎？",
    riskLabel: "多線互動風險",
    weight: 1.3,
    scaleDescriptions: {
      1: "沒有這種感覺",
      2: "感覺很專注，只有我一個",
      3: "偶爾提到別人，但我還能接受",
      4: "開始有跡象讓我懷疑",
      5: "有些跡象，但還不明確",
      6: "明顯同時和多人保持曖昧",
      7: "讓我覺得自己只是其中一個選項",
      8: "經常讓我比較自己和其他人",
      9: "幾乎不隱藏多線互動",
      10: "很明顯同時和多人曖昧，讓我覺得自己只是其中一個選項"
    }
  },
  {
    id: "emotional_manipulation",
    title: "情緒操控",
    axisLabel: "情緒操控",
    question: "他會讓你覺得很多事情最後都變成你的錯嗎？",
    riskLabel: "情緒操控",
    weight: 1.5,
    scaleDescriptions: {
      1: "可以好好溝通，不會一直怪我",
      2: "偶爾會推責，但我能處理",
      3: "有時讓我覺得是我的問題",
      4: "開始常把責任推給我",
      5: "有時會讓我內疚",
      6: "經常讓我覺得自己做錯了",
      7: "常常情緒勒索，讓我很疲憊",
      8: "幾乎每次爭執都變成我的錯",
      9: "讓我開始懷疑自己是不是太敏感",
      10: "常常情緒勒索、推責，讓我覺得自己怎麼做都不對"
    }
  },
  {
    id: "gaslighting_confusion",
    title: "煤氣燈效應",
    axisLabel: "煤氣燈效應",
    question: "他會讓你開始懷疑自己的記憶、感受或判斷嗎？",
    riskLabel: "現實感混亂",
    weight: 1.5,
    scaleDescriptions: {
      1: "不會，我的感受會被尊重",
      2: "偶爾否認，但我還能堅持",
      3: "有時讓我開始懷疑自己",
      4: "開始淡化我的感受",
      5: "有時他會否認或淡化我的感受",
      6: "經常讓我覺得自己記錯了",
      7: "讓我很常懷疑自己的判斷",
      8: "常常讓我覺得是不是我太敏感",
      9: "幾乎不承認我的感受",
      10: "常常讓我懷疑是不是我太敏感、記錯、想太多"
    }
  },
  {
    id: "future_avoidance",
    title: "不規劃未來",
    axisLabel: "不規劃未來",
    question: "他會迴避未來、承諾或下一步嗎？",
    riskLabel: "承諾迴避",
    weight: 1.0,
    scaleDescriptions: {
      1: "願意討論未來與安排",
      2: "偶爾會談未來，但不多",
      3: "有時願意討論，但不具體",
      4: "開始閃避未來話題",
      5: "有時會閃避，但不是完全不談",
      6: "一談未來就轉移話題",
      7: "長期不願規劃任何下一步",
      8: "讓我覺得關係沒有未來",
      9: "完全拒絕談未來",
      10: "一談未來就消失、轉移話題，讓關係永遠停在原地"
    }
  },
  {
    id: "lack_of_reciprocity",
    title: "只談自己",
    axisLabel: "只談自己",
    question: "這段關係是不是大多都圍著他的需求轉？",
    riskLabel: "互惠不足",
    weight: 1.0,
    scaleDescriptions: {
      1: "他也會關心我的生活與感受",
      2: "大多平衡，偶爾他比較多",
      3: "有時覺得不太對等",
      4: "開始覺得我付出比較多",
      5: "有時我覺得不太平衡",
      6: "經常圍著他的需求轉",
      7: "我幾乎都在配合他",
      8: "他很少真正關心我的感受",
      9: "幾乎都是我聽他說",
      10: "幾乎都是我配合他，他很少真正關心我"
    }
  }
];

export const initialScores = questions.reduce(
  (scores, question) => ({ ...scores, [question.id]: 1 }),
  {} as Record<QuestionId, number>
);

export function calculateRiskIndex(scores: Record<QuestionId, number>) {
  const totalWeight = questions.reduce((total, question) => total + question.weight, 0);
  const weightedScore = questions.reduce((total, question) => {
    const normalized = (scores[question.id] - 1) / 9;
    return total + normalized * question.weight;
  }, 0);

  return Math.round((weightedScore / totalWeight) * 100);
}

export function getRiskLevel(riskIndex: number): RiskLevel {
  if (riskIndex <= 24) {
    return {
      label: "低風險",
      range: "0～24",
      copy:
        "目前沒有明顯的高風險互動訊號。這不代表關係一定完美，而是目前看起來，對方沒有明顯讓你反覆不安、懷疑或被消耗的模式。可以繼續觀察互動是否穩定、尊重與互惠。",
      action: "維持觀察，持續確認這段關係是否讓你感到穩定、被尊重與被看見。"
    };
  }

  if (riskIndex <= 49) {
    return {
      label: "觀察區",
      range: "25～49",
      copy:
        "這段關係裡已經有一些模糊與不舒服。你不一定要立刻離開，但需要開始觀察：你是不是常常在猜、等、配合，或說服自己不要想太多。建議先降低單方面投入，觀察對方是否願意更穩定地回應你。",
      action: "先把自己的界線說清楚，觀察對方是否願意用行動回應，而不是只用甜言蜜語安撫你。"
    };
  }

  if (riskIndex <= 74) {
    return {
      label: "高風險區",
      range: "50～74",
      copy:
        "這段關係已經開始明顯消耗你。對方不一定是故意傷害你，但他的互動模式正在讓你付出過高的情緒成本。建議先降低投入，設定界線，不要再用更多付出去換一個不穩定的回應。",
      action: "暫停主動追逐與過度解釋，先把注意力拉回自己，並設定明確停損點。"
    };
  }

  return {
    label: "高消耗區",
    range: "75～100",
    copy:
      "這段關係的消耗程度很高。如果你同時經歷忽冷忽熱、情緒操控、關係不明確或自我懷疑，這已經不只是單純曖昧問題，而是正在影響你的自尊與判斷。建議先暫停投入，找可信任的人討論，必要時尋求專業支持。",
    action: "先停止加碼投入，不急著說服自己再等等。優先保護情緒穩定、現實感與自尊。"
  };
}

export function hasRedFlag(scores: Record<QuestionId, number>) {
  return (
    scores.emotional_manipulation >= 8 ||
    scores.gaslighting_confusion >= 8 ||
    scores.multi_line_flirting >= 8
  );
}

export function getTopRisks(scores: Record<QuestionId, number>, limit = 3) {
  return [...questions]
    .sort((left, right) => scores[right.id] - scores[left.id] || right.weight - left.weight)
    .slice(0, limit);
}

export function getZodiac(dateValue: string): ZodiacName | null {
  if (!dateValue) return null;

  const [, monthText, dayText] = dateValue.split("-");
  const month = Number(monthText);
  const day = Number(dayText);

  if (!month || !day) return null;

  const marker = month * 100 + day;
  if (marker >= 321 && marker <= 419) return "牡羊座";
  if (marker >= 420 && marker <= 520) return "金牛座";
  if (marker >= 521 && marker <= 621) return "雙子座";
  if (marker >= 622 && marker <= 722) return "巨蟹座";
  if (marker >= 723 && marker <= 822) return "獅子座";
  if (marker >= 823 && marker <= 922) return "處女座";
  if (marker >= 923 && marker <= 1023) return "天秤座";
  if (marker >= 1024 && marker <= 1122) return "天蠍座";
  if (marker >= 1123 && marker <= 1221) return "射手座";
  if (marker >= 1222 || marker <= 119) return "摩羯座";
  if (marker >= 120 && marker <= 218) return "水瓶座";
  return "雙魚座";
}
