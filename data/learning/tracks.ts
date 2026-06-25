export type LearningTrackStatus = "Pilot 進行中" | "內容規劃中" | "研究整理中" | "內容架構建立中" | "尚未開放";

export type LearningTrack = {
  id: "bodyfix-method" | "tarot-status-reading" | "ziwei-structural-analysis" | "vedic-astrology-foundations";
  brand: "BodyFix" | "Chart Navigator";
  title: string;
  subtitle: string;
  description: string;
  href: string;
  cta: string;
  status: LearningTrackStatus;
  progressLabel: "尚未開始" | "登入後可記錄進度" | "內容規劃中" | "尚未開放";
};

export type LearningModule = { id: string; trackId: LearningTrack["id"]; title: string; summary: string; status: string; items: string[]; aliases?: string[]; sourceNotes?: string[] };
export type LearningLesson = { id: string; moduleId: string; title: string; status: string };
export type LearningProgress = { userId: string; trackId: LearningTrack["id"]; currentModuleId?: string; currentLessonId?: string; completedLessonIds: string[]; updatedAt: string };
export type LearningBookmark = { userId: string; lessonId: string; createdAt: string };
export type LearningAccess = { userId: string; trackId: LearningTrack["id"]; state: "locked" | "pilot" | "enrolled" | "completed"; source: string; updatedAt: string };

export type VedicTerm = { englishIast: string; devanagari?: string; chineseName: string; phoneticZh?: string; definition?: string; aliases: string[]; sources: string[]; verificationStatus: "待查證" | "研究整理中" | "已查證"; examples: string[]; teachingNotes: string[] };

export const learningTracks: LearningTrack[] = [
  { id: "bodyfix-method", brand: "BodyFix", title: "BodyFix Method", subtitle: "身體狀態、張力分工與 4R 服務流程", description: "從 Read、Reset、Reconnect、Return 開始，建立能判讀、能整理、能回測、能記錄的身體服務方法。", href: "/method", cta: "進入 BodyFix Method", status: "Pilot 進行中", progressLabel: "登入後可記錄進度" },
  { id: "tarot-status-reading", brand: "Chart Navigator", title: "Tarot Status Reading", subtitle: "78 張牌的狀態判讀系統", description: "不是把 78 張牌背成 78 個答案，而是理解人在不同情境中可能經歷的狀態、張力與選擇。", href: "/learning/tarot", cta: "查看塔羅學習路徑", status: "內容規劃中", progressLabel: "內容規劃中" },
  { id: "ziwei-structural-analysis", brand: "Chart Navigator", title: "Zi Wei Structural Analysis", subtitle: "十四主星與命盤結構", description: "十四主星不是十四種固定人格，而是十四種分配資源、處理問題與面對世界的核心力量。", href: "/learning/ziwei", cta: "查看紫微學習路徑", status: "內容規劃中", progressLabel: "內容規劃中" },
  { id: "vedic-astrology-foundations", brand: "Chart Navigator", title: "Vedic Astrology Foundations", subtitle: "九曜、宮位與命盤結構", description: "從印度占星概論、九曜與命盤格式開始，逐步進入星曜力量、宮位、格局、分盤與時間判讀。", href: "/learning/vedic", cta: "查看吠陀學習路徑", status: "研究整理中", progressLabel: "尚未開始" },
];

export const vedicChapters: LearningModule[] = [
  { id: "vedic-01", trackId: "vedic-astrology-foundations", title: "Chapter 01｜印度占星概論與命盤格式", summary: "建立印度占星的背景、符號與命盤格式入口。", status: "研究整理中", items: ["占星概說與簡史", "西洋占星與印度占星的比較", "吠陀占星及其印度文化背景", "星曜符號", "北印度盤", "南印度盤"] },
  { id: "vedic-02", trackId: "vedic-astrology-foundations", title: "Chapter 02｜九曜的類型與核心徵象", summary: "以九曜 Navagraha 理解星曜類型與象徵範圍。", status: "研究整理中", items: ["發光體", "五行星", "影子星曜 Chāyā Graha", "九曜的核心象徵", "九曜所代表的人、事與領域"] },
  { id: "vedic-03", trackId: "vedic-astrology-foundations", title: "Chapter 03｜九曜力量、尊貴與互動", summary: "預留星曜力量與互動的查證欄位，不自行補完未查證規則。", status: "待查證", items: ["旺、廟、友、中立、仇、陷", "自然吉曜與自然凶曜", "功能性吉凶概念", "相位", "星座交換", "灼傷", "星戰", "逆行", "同位", "結點", "夾輔與夾剋", "原始綱要中「夾輔」重複出現：待查證"] },
  { id: "vedic-04", trackId: "vedic-astrology-foundations", title: "Chapter 04｜十二星座 Rāśi", summary: "把星座視為九曜表現的環境，而非太陽星座人格測驗。", status: "研究整理中", items: ["二分性", "三分性", "四分性", "十二星座的徵象", "星座作為九曜表現的環境"] },
  { id: "vedic-05", trackId: "vedic-astrology-foundations", title: "Chapter 05｜十二宮位 Bhāva", summary: "宮位譯名可能隨教材不同，資料結構保留別名與來源差異。", status: "研究整理中", aliases: ["Bhāva", "宮位"], sourceNotes: ["不同中文教材可能使用不同譯名，需逐條記錄來源。"], items: ["三方宮", "四正宮", "困難宮", "成長宮", "殺手宮", "法宮", "利宮", "欲宮", "道宮", "各宮位的核心意涵與象徵事物"] },
  { id: "vedic-06", trackId: "vedic-astrology-foundations", title: "Chapter 06｜常見 Yoga 格局", summary: "只建立格局清單與未來欄位，不生成未查證判定規則。", status: "架構建立中", items: ["Raja Yoga", "Dhana Yoga", "Arishta Yoga", "Gaja Kesari Yoga", "Sakata Yoga", "Kemadruma Yoga", "Yama Yoga", "Pancha Maha Purusha Yoga", "Adhi Yoga", "日月輔弼格", "未來欄位：成立條件、強弱條件、常見誤判、不可單獨判斷的原因"] },
  { id: "vedic-07", trackId: "vedic-astrology-foundations", title: "Chapter 07｜分盤 Varga", summary: "分盤不是取代本命盤，而是放大檢視特定人生主題。", status: "研究整理中", items: ["各種分盤簡介", "Navāṃśa 九分盤", "Daśāṃśa 十分盤", "切分原理", "本命盤與分盤的基本交叉閱讀"] },
  { id: "vedic-08", trackId: "vedic-astrology-foundations", title: "Chapter 08｜大運與行運", summary: "本命盤：原始結構；大運：目前被啟動的章節；行運：外部時間與事件觸發。", status: "研究整理中", items: ["Vimśottarī Daśā 百二十年大運", "主運與副運", "Gocara 行運", "本命盤、大運與行運的關係"] },
];

export const vedicSupplementaryModules = ["Lagna 上升與宮主星", "恆星黃道、回歸黃道與 Ayanāṃśa", "Nakṣatra 二十七宿概論", "綜合判讀流程與倫理界線"].map((title) => ({ title, status: "Supplementary Module｜研究整理中" }));
