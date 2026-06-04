export type AnatomyImageStatus = "待做" | "已出圖" | "待重做" | "已定稿" | "已保留";
export type AnatomyImagePriority = "A" | "B" | "C";

export type AnatomyImageItem = {
  id: string;
  number: string;
  titleZh: string;
  titleEn: string;
  chapter: string;
  usage: string;
  imageType: string;
  ratio: string;
  view: string[];
  bones: string[];
  muscles: string[];
  fasciaLines: string[];
  labels: string[];
  functionNotes: string[];
  avoid: string[];
  status: AnatomyImageStatus;
  priority: AnatomyImagePriority;
  thumbnailNote?: string;
};

export const defaultManualAvoidRules = [
  "海報感",
  "社群圖卡感",
  "品牌風格板感",
  "過多材質拼貼",
  "大面積品牌排版",
  "私密細節或情色暗示",
];

export const anatomyImages: AnatomyImageItem[] = [
  {
    id: "pelvic-001",
    number: "01",
    titleZh: "骨盆骨性結構總覽",
    titleEn: "Pelvic Bony Structure Overview",
    chapter: "CH02",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["anterior", "posterior"],
    bones: ["Ilium", "Ischium", "Pubis", "Sacrum", "Femur"],
    muscles: [],
    fasciaLines: [],
    labels: ["髂骨", "坐骨", "恥骨", "薦骨", "髖臼", "股骨頭"],
    functionNotes: ["建立骨盆環基本定位", "說明髖關節與軀幹承重關係", "作為後續肌肉與筋膜圖的共同底圖"],
    avoid: defaultManualAvoidRules,
    status: "已保留",
    priority: "A",
  },
  {
    id: "pelvic-002",
    number: "02",
    titleZh: "薦骨、尾骨與深層中軸定位",
    titleEn: "Sacrum, Coccyx & Deep Central Axis",
    chapter: "CH02",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["posterior", "side"],
    bones: ["Sacrum", "Coccyx", "L5-S1", "SI Joint"],
    muscles: [],
    fasciaLines: [],
    labels: ["薦骨", "尾骨", "L5-S1", "薦髂關節", "中軸線"],
    functionNotes: ["承接上半身重量", "連接骨盆環", "影響深層穩定與壓力傳遞"],
    avoid: defaultManualAvoidRules,
    status: "待重做",
    priority: "A",
  },
  {
    id: "pelvic-003",
    number: "03",
    titleZh: "髂腰肌與下腹核心關係",
    titleEn: "Psoas, Iliacus & Lower Core Integration",
    chapter: "CH03",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["anterior", "side"],
    bones: ["Lumbar Spine", "Pelvis", "Lesser Trochanter"],
    muscles: ["Psoas Major", "Iliacus", "Iliopsoas"],
    fasciaLines: ["DFL"],
    labels: ["Psoas Major", "Iliacus", "Lumbar Spine", "Lesser Trochanter", "下腹核心協調區"],
    functionNotes: ["連接腰椎與髖", "影響骨盆前側張力", "與下腹核心協調穩定"],
    avoid: defaultManualAvoidRules,
    status: "待重做",
    priority: "A",
  },
  {
    id: "pelvic-004",
    number: "04",
    titleZh: "腹橫肌與骨盆環壓力管理",
    titleEn: "Transversus Abdominis & Pelvic Ring Pressure",
    chapter: "CH03",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["front cutaway", "side"],
    bones: ["Pelvis", "Lumbar Spine", "Lower Ribs"],
    muscles: ["Transversus Abdominis", "Internal Oblique"],
    fasciaLines: ["Thoracolumbar Fascia"],
    labels: ["腹橫肌", "胸腰筋膜", "骨盆環", "腹內壓", "腰椎"],
    functionNotes: ["建立核心筒側向張力", "協助骨盆環穩定", "支援呼吸與動作中的壓力管理"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "A",
  },
  {
    id: "pelvic-005",
    number: "05",
    titleZh: "骨盆底與橫膈的上下核心筒",
    titleEn: "Pelvic Floor & Diaphragm Core Cylinder",
    chapter: "CH03",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["side", "top simplified"],
    bones: ["Pelvis", "Rib Cage", "Lumbar Spine"],
    muscles: ["Diaphragm", "Pelvic Floor", "Transversus Abdominis"],
    fasciaLines: ["Deep Front Line"],
    labels: ["橫膈", "骨盆底", "腹橫肌", "核心筒", "壓力方向"],
    functionNotes: ["說明呼吸與骨盆底的連動", "建立上下壓力平衡", "避免把核心訓練只理解為腹肌用力"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "A",
  },
  {
    id: "pelvic-006",
    number: "06",
    titleZh: "臀大肌與骨盆後側推進線",
    titleEn: "Gluteus Maximus & Posterior Propulsion Line",
    chapter: "CH04",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["posterior", "side"],
    bones: ["Sacrum", "Ilium", "Femur"],
    muscles: ["Gluteus Maximus", "Hamstrings"],
    fasciaLines: ["Posterior Chain"],
    labels: ["臀大肌", "薦骨", "股骨", "後側推進線", "髂脛束連結"],
    functionNotes: ["提供髖伸展力量", "協助骨盆後側穩定", "連接下肢推進與軀幹控制"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "A",
  },
  {
    id: "pelvic-007",
    number: "07",
    titleZh: "臀中肌與單腳站立穩定",
    titleEn: "Gluteus Medius & Single-leg Stability",
    chapter: "CH04",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["lateral", "front"],
    bones: ["Ilium", "Femur", "Greater Trochanter"],
    muscles: ["Gluteus Medius", "Gluteus Minimus"],
    fasciaLines: ["Lateral Line"],
    labels: ["臀中肌", "臀小肌", "大轉子", "骨盆水平線", "單腳支撐"],
    functionNotes: ["控制骨盆側向下墜", "支援步態中的單腳承重", "連結髖外側與核心穩定"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "A",
  },
  {
    id: "pelvic-008",
    number: "08",
    titleZh: "內收肌群與骨盆前內側張力",
    titleEn: "Adductors & Anterior-medial Pelvic Tension",
    chapter: "CH04",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["anterior", "medial"],
    bones: ["Pubis", "Femur", "Ischium"],
    muscles: ["Adductor Longus", "Adductor Magnus", "Pectineus"],
    fasciaLines: ["Deep Front Line"],
    labels: ["內收長肌", "內收大肌", "恥骨", "坐骨支", "內側穩定線"],
    functionNotes: ["連接骨盆前側與大腿內側", "參與髖內收與骨盆控制", "影響深前線張力"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "B",
  },
  {
    id: "pelvic-009",
    number: "09",
    titleZh: "梨狀肌與深層髖外旋群",
    titleEn: "Piriformis & Deep Hip External Rotators",
    chapter: "CH04",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["posterior deep", "side"],
    bones: ["Sacrum", "Femur", "Greater Trochanter"],
    muscles: ["Piriformis", "Obturator Internus", "Gemelli", "Quadratus Femoris"],
    fasciaLines: ["Deep Posterior Hip"],
    labels: ["梨狀肌", "閉孔內肌", "大轉子", "薦骨", "深層外旋群"],
    functionNotes: ["協助髖關節深層定位", "影響坐骨神經周邊張力", "提供小範圍精細穩定"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "B",
  },
  {
    id: "pelvic-010",
    number: "10",
    titleZh: "闊筋膜張肌、髂脛束與外側線",
    titleEn: "TFL, IT Band & Lateral Line",
    chapter: "CH04",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["lateral"],
    bones: ["Ilium", "Femur", "Tibia"],
    muscles: ["Tensor Fasciae Latae", "Gluteus Medius"],
    fasciaLines: ["IT Band", "Lateral Line"],
    labels: ["闊筋膜張肌", "髂脛束", "髂嵴", "外側線", "膝外側連結"],
    functionNotes: ["連接骨盆外側到膝外側", "影響站姿與步態側向穩定", "常與臀中肌代償關係相關"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "B",
  },
  {
    id: "pelvic-011",
    number: "11",
    titleZh: "Layer 1 後側穩定層",
    titleEn: "Layer 1 Posterior Stabilizing Layer",
    chapter: "CH05",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["posterior layered"],
    bones: ["Pelvis", "Lumbar Spine", "Femur"],
    muscles: ["Gluteus Maximus", "Thoracolumbar Fascia", "Hamstrings"],
    fasciaLines: ["Posterior Functional Line"],
    labels: ["臀大肌", "胸腰筋膜", "腿後側", "薦骨", "後側穩定層"],
    functionNotes: ["建立後側承重與推進", "把腰背張力傳遞到下肢", "適合說明第一層穩定策略"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "A",
  },
  {
    id: "pelvic-012",
    number: "12",
    titleZh: "Layer 2 深前核心層",
    titleEn: "Layer 2 Deep Anterior Core Layer",
    chapter: "CH05",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["anterior deep", "side"],
    bones: ["Lumbar Spine", "Pelvis", "Femur"],
    muscles: ["Psoas Major", "Iliacus", "Pelvic Floor", "Diaphragm"],
    fasciaLines: ["Deep Front Line"],
    labels: ["腰大肌", "髂肌", "骨盆底", "橫膈", "深前核心層"],
    functionNotes: ["串連呼吸、腰椎與髖", "說明深層核心不是表層出力", "支援姿勢中的內在穩定"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "A",
  },
  {
    id: "pelvic-013",
    number: "13",
    titleZh: "Layer 3 側向穩定層",
    titleEn: "Layer 3 Lateral Stabilizing Layer",
    chapter: "CH05",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["lateral", "front"],
    bones: ["Ilium", "Femur", "Tibia"],
    muscles: ["Gluteus Medius", "TFL", "Quadratus Lumborum"],
    fasciaLines: ["Lateral Line"],
    labels: ["臀中肌", "腰方肌", "闊筋膜張肌", "外側線", "骨盆水平控制"],
    functionNotes: ["控制左右重心轉移", "支援單腳站與走路", "整合腰側、髖側與膝外側"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "A",
  },
  {
    id: "pelvic-014",
    number: "14",
    titleZh: "薦髂關節與力傳遞方向",
    titleEn: "Sacroiliac Joint & Force Transmission",
    chapter: "CH06",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["posterior", "schematic arrows"],
    bones: ["Sacrum", "Ilium", "SI Joint", "Lumbar Spine"],
    muscles: ["Multifidus", "Gluteus Maximus"],
    fasciaLines: ["Thoracolumbar Fascia"],
    labels: ["薦髂關節", "薦骨", "髂骨", "壓力傳遞", "剪力方向"],
    functionNotes: ["說明上半身重量如何進入骨盆環", "區分壓縮與剪力概念", "作為評估疼痛位置的教學底圖"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "A",
  },
  {
    id: "pelvic-015",
    number: "15",
    titleZh: "骨盆前傾與肌肉張力地圖",
    titleEn: "Anterior Pelvic Tilt Tension Map",
    chapter: "CH06",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["side comparison"],
    bones: ["Pelvis", "Lumbar Spine", "Femur"],
    muscles: ["Hip Flexors", "Erector Spinae", "Abdominals", "Glutes"],
    fasciaLines: ["Anterior Chain", "Posterior Chain"],
    labels: ["骨盆前傾", "髖屈肌", "腰背伸肌", "腹肌控制", "臀肌抑制"],
    functionNotes: ["視覺化前傾不是單一肌肉問題", "說明前後張力失衡", "連接評估與訓練方向"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "A",
  },
  {
    id: "pelvic-016",
    number: "16",
    titleZh: "骨盆後傾與後側鏈限制",
    titleEn: "Posterior Pelvic Tilt & Posterior Chain Restriction",
    chapter: "CH06",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["side comparison"],
    bones: ["Pelvis", "Sacrum", "Lumbar Spine", "Femur"],
    muscles: ["Hamstrings", "Gluteus Maximus", "Abdominals"],
    fasciaLines: ["Posterior Chain"],
    labels: ["骨盆後傾", "腿後側", "薦骨角度", "腰椎曲線", "後側鏈限制"],
    functionNotes: ["說明後傾與腰椎曲線變化", "連接腿後側張力與坐姿型態", "提供伸展與控制訓練參考"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "B",
  },
  {
    id: "pelvic-017",
    number: "17",
    titleZh: "步態中的骨盆旋轉",
    titleEn: "Pelvic Rotation During Gait",
    chapter: "CH07",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["top", "front sequence"],
    bones: ["Pelvis", "Femur", "Lumbar Spine"],
    muscles: ["Obliques", "Gluteus Medius", "Adductors"],
    fasciaLines: ["Spiral Line", "Functional Lines"],
    labels: ["骨盆旋轉", "軀幹反向旋轉", "支撐腳", "擺盪腳", "螺旋線"],
    functionNotes: ["說明走路不是只靠腿前後擺", "建立骨盆與胸廓反向協調", "連接步態觀察與訓練提示"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "B",
  },
  {
    id: "pelvic-018",
    number: "18",
    titleZh: "深蹲中的骨盆與髖控制",
    titleEn: "Pelvis & Hip Control in Squat",
    chapter: "CH07",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "4:3",
    view: ["front", "side"],
    bones: ["Pelvis", "Femur", "Tibia", "Lumbar Spine"],
    muscles: ["Gluteus Maximus", "Adductors", "Deep Core"],
    fasciaLines: ["Anterior Chain", "Posterior Chain"],
    labels: ["髖折疊", "膝蓋方向", "骨盆中立", "臀肌出力", "核心控制"],
    functionNotes: ["說明深蹲時骨盆與髖同步控制", "避免只看膝蓋或腰椎", "作為動作整合教學圖"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "B",
  },
  {
    id: "pelvic-019",
    number: "19",
    titleZh: "呼吸、腹壓與骨盆穩定流程圖",
    titleEn: "Breathing, IAP & Pelvic Stability Flow",
    chapter: "CH08",
    usage: "manual-inner-page",
    imageType: "流程圖",
    ratio: "4:3",
    view: ["flowchart", "side schematic"],
    bones: ["Rib Cage", "Pelvis", "Lumbar Spine"],
    muscles: ["Diaphragm", "Pelvic Floor", "Transversus Abdominis"],
    fasciaLines: ["Core Cylinder"],
    labels: ["吸氣下降", "吐氣回彈", "腹壓", "骨盆底反應", "穩定輸出"],
    functionNotes: ["把呼吸、腹壓與穩定拆成可教學流程", "適合手冊練習頁前的觀念圖", "降低抽象核心概念的理解門檻"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "A",
  },
  {
    id: "pelvic-020",
    number: "20",
    titleZh: "BF Pelvic Core Reset 圖版總覽",
    titleEn: "BF Pelvic Core Reset Visual Map",
    chapter: "CH08",
    usage: "manual-inner-page",
    imageType: "教材版",
    ratio: "A4 橫式",
    view: ["overview map"],
    bones: ["Pelvis", "Lumbar Spine", "Femur", "Rib Cage"],
    muscles: ["Psoas", "Glutes", "Adductors", "Diaphragm", "Pelvic Floor"],
    fasciaLines: ["DFL", "Lateral Line", "Posterior Chain", "Spiral Line"],
    labels: ["骨性定位", "深前核心", "後側穩定", "側向穩定", "動作整合"],
    functionNotes: ["作為第一批二十張圖的索引總覽", "讓讀者理解各圖之間的系統關係", "可放在章節總結或課程講義開頭"],
    avoid: defaultManualAvoidRules,
    status: "待做",
    priority: "A",
  },
];

export function buildManualAnatomyPrompt(item: AnatomyImageItem) {
  return `請製作「BodyFix 手冊內頁用解剖教材插圖」。
用途為 Word / PDF 手冊內頁，不是海報、不是社群圖卡、不是品牌風格板。

圖號：${item.number}
圖名：${item.titleZh}
英文副標：${item.titleEn}
對應章節：${item.chapter}
圖像用途：${item.usage}
圖像類型：${item.imageType}
圖像比例：${item.ratio}
主視角：${item.view.join("＋")}

固定規格：
1. 畫面 80% 為解剖主圖，20% 為必要標籤與少量說明。
2. 背景乾淨米白或透明。
3. 使用 BodyFix 視覺語言：米白、深藍、暖米、石灰灰、青銅金；乾淨、高級、像同一本手冊內頁。
4. 只保留小型 BF 標記，不要大面積品牌排版。
5. 標籤請用細線清楚指向骨頭、肌肉、筋膜線或功能結構。
6. 標籤格式以中文為主，可補英文；避免過多文字造成畫面擁擠。
7. 骨盆相關圖像請保持醫學教材感，不畫私密細節、不做情色暗示、不做內診感。

主要骨頭：
${formatPromptList(item.bones)}

主要肌肉：
${formatPromptList(item.muscles)}

筋膜線 / 功能線：
${formatPromptList(item.fasciaLines)}

請清楚標示：
${item.labels.join("、")}

功能短句：
${item.functionNotes.map((note) => `- ${note}`).join("\n")}

避免：
${item.avoid.map((rule) => `- ${rule}`).join("\n")}
`;
}

function formatPromptList(items: string[]) {
  if (items.length === 0) {
    return "- 無；不需要額外強調";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

export function getAnatomyImageById(id: string) {
  return anatomyImages.find((item) => item.id === id);
}
