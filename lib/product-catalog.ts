export type ProductCategoryKey = "ready" | "custom" | "combo" | "consult";
export type ProductStatus = "active" | "draft";

export type Product = {
  id: string;
  slug: string;
  name: string;
  headline: string;
  description: string;
  price: string;
  cta: string;
  image: string;
  category: string;
  categoryKey: ProductCategoryKey;
  sceneTags: string[];
  shortTag: string;
  featured: boolean;
  status: ProductStatus;
  sortOrder: number;
  bestFor: string[];
  intent: string;
  includesConsult: boolean;
  includesProduct: boolean;
  deliveryType: string;
  featuredOrder?: number;
};

export type ProductCategoryGuide = {
  categoryKey: ProductCategoryKey;
  title: string;
  subtitle: string;
  buyerIntent: string;
};

export const readyProducts: Product[] = [
  {
    id: "ready-001",
    slug: "black-tourmaline-desk-grounding-set",
    name: "黑碧璽桌面穩定組",
    headline: "讓桌面先安定下來，工作狀態也比較容易回來。",
    description: "適合放在每天會坐下來的桌面、櫃台或工作區。先把空間穩下來，人也比較容易進入狀態。",
    price: "NT$1,280",
    cta: "直接帶走這組",
    image: "/images/products/ready-001.jpg",
    category: "現成空間組",
    categoryKey: "ready",
    sceneTags: ["書桌", "辦公桌", "櫃台"],
    shortTag: "桌面穩定",
    featured: true,
    featuredOrder: 1,
    status: "active",
    sortOrder: 1,
    bestFor: ["桌面容易雜亂", "想讓工作區更穩", "需要簡單入門組合"],
    intent: "直接購買",
    includesConsult: false,
    includesProduct: true,
    deliveryType: "現成組合",
  },
  {
    id: "ready-002",
    slug: "labradorite-focus-desk-set",
    name: "拉長石聚焦桌面組",
    headline: "替書桌留一個更清楚、更能收心的位置。",
    description: "適合想讓書桌更有聚焦感、創作區更清楚、工作節奏更穩的人。放在視線容易看見的地方，提醒自己慢慢回到當下。",
    price: "NT$1,480",
    cta: "選這組聚焦桌面",
    image: "/images/products/ready-002.jpg",
    category: "現成空間組",
    categoryKey: "ready",
    sceneTags: ["書桌", "創作區", "工作室"],
    shortTag: "聚焦桌面",
    featured: true,
    featuredOrder: 2,
    status: "active",
    sortOrder: 2,
    bestFor: ["想整理工作節奏", "希望桌面更有聚焦感", "創作區需要清楚邊界"],
    intent: "直接購買",
    includesConsult: false,
    includesProduct: true,
    deliveryType: "現成組合",
  },
  {
    id: "ready-003",
    slug: "welcome-entry-space-set",
    name: "入口迎接空間組",
    headline: "讓回家的第一眼，有一點被接住的感覺。",
    description: "適合玄關、入口櫃或接待桌。用小而明確的配置，讓空間在進門那一刻多一點溫度。",
    price: "NT$1,360",
    cta: "整理入口氛圍",
    image: "/images/products/ready-003.jpg",
    category: "現成空間組",
    categoryKey: "ready",
    sceneTags: ["玄關", "入口", "接待桌"],
    shortTag: "入口迎接",
    featured: false,
    status: "active",
    sortOrder: 3,
    bestFor: ["想讓入口更有迎接感", "玄關需要一個視覺重點", "接待區想增加溫度"],
    intent: "直接購買",
    includesConsult: false,
    includesProduct: true,
    deliveryType: "現成組合",
  },
];

export const customPackages: Product[] = [
  {
    id: "custom-001",
    slug: "personal-corner-custom-package",
    name: "個人角落客製版",
    headline: "依照你的使用位置，調整一組更貼近日常的配置。",
    description: "適合已經知道想整理哪一區，但希望顏色、植物與水晶能更貼近自己狀態的人。",
    price: "NT$2,680 起",
    cta: "開始客製角落",
    image: "/images/products/custom-001.jpg",
    category: "客製空間搭配",
    categoryKey: "custom",
    sceneTags: ["書桌", "床邊", "個人角落"],
    shortTag: "個人客製",
    featured: false,
    status: "active",
    sortOrder: 1,
    bestFor: ["想保留個人偏好", "需要依照位置調整", "現成組合差一點剛好"],
    intent: "客製規劃",
    includesConsult: true,
    includesProduct: true,
    deliveryType: "客製搭配",
  },
  {
    id: "custom-002",
    slug: "home-rhythm-custom-package",
    name: "居家節奏客製版",
    headline: "替家裡常用的角落，做一組更順手的日常配置。",
    description: "適合客廳、餐桌旁、閱讀區等每天會經過的位置。重點不是把家變滿，而是讓動線與感受更清楚。",
    price: "NT$3,280 起",
    cta: "客製居家節奏",
    image: "/images/products/custom-002.jpg",
    category: "客製空間搭配",
    categoryKey: "custom",
    sceneTags: ["客廳", "閱讀區", "餐桌旁"],
    shortTag: "居家節奏",
    featured: false,
    status: "active",
    sortOrder: 2,
    bestFor: ["想調整居家動線感", "需要溫和的空間重點", "希望配置融入日常"],
    intent: "客製規劃",
    includesConsult: true,
    includesProduct: true,
    deliveryType: "客製搭配",
  },
  {
    id: "custom-003",
    slug: "brand-space-custom-package",
    name: "品牌空間客製版",
    headline: "把品牌想給人的感受，整理成能被看見的空間角落。",
    description: "適合工作室、櫃台、接待區或拍攝角落。從品牌調性、空間用途與第一眼感受出發，做出更貼近現場的配置。",
    price: "NT$6,800 起",
    cta: "規劃品牌空間",
    image: "/images/products/custom-003.jpg",
    category: "客製空間搭配",
    categoryKey: "custom",
    sceneTags: ["品牌空間", "工作室", "接待區"],
    shortTag: "品牌客製",
    featured: true,
    featuredOrder: 6,
    status: "active",
    sortOrder: 3,
    bestFor: ["品牌空間需要一致感", "接待區想更有記憶點", "拍攝角落需要完整畫面"],
    intent: "品牌空間規劃",
    includesConsult: true,
    includesProduct: true,
    deliveryType: "品牌空間規劃",
  },
];

export const comboProducts: Product[] = [
  {
    id: "combo-001",
    slug: "bedside-calm-plant-crystal-set",
    name: "床邊安定組",
    headline: "替床邊留一個安靜、柔軟、比較好收尾的位置。",
    description: "適合放在床頭櫃或睡前會看見的地方。用植物與水晶一起建立一個溫柔的視覺停靠點。",
    price: "NT$2,280",
    cta: "配置床邊安定感",
    image: "/images/products/combo-001.jpg",
    category: "植物水晶配置組",
    categoryKey: "combo",
    sceneTags: ["床邊", "臥室", "睡前角落"],
    shortTag: "床邊安定",
    featured: true,
    featuredOrder: 3,
    status: "active",
    sortOrder: 1,
    bestFor: ["床邊想更柔和", "睡前需要收心角落", "臥室想降低凌亂感"],
    intent: "完整角落配置",
    includesConsult: false,
    includesProduct: true,
    deliveryType: "植物水晶配置",
  },
  {
    id: "combo-002",
    slug: "desk-focus-plant-crystal-set",
    name: "書桌聚焦組",
    headline: "讓書桌不只是放東西，也成為進入狀態的提示。",
    description: "適合工作、讀書、寫企劃或創作的桌面。透過植物的生命感與水晶的視覺焦點，讓桌面更有秩序感。",
    price: "NT$2,480",
    cta: "配置書桌聚焦感",
    image: "/images/products/combo-002.jpg",
    category: "植物水晶配置組",
    categoryKey: "combo",
    sceneTags: ["書桌", "工作區", "創作區"],
    shortTag: "書桌聚焦",
    featured: true,
    featuredOrder: 4,
    status: "active",
    sortOrder: 2,
    bestFor: ["書桌需要完整畫面", "想建立工作儀式感", "創作區需要聚焦提示"],
    intent: "完整角落配置",
    includesConsult: false,
    includesProduct: true,
    deliveryType: "植物水晶配置",
  },
  {
    id: "combo-003",
    slug: "this-is-my-place-plant-crystal-set",
    name: "這裡就是主場組",
    headline: "讓一個角落看起來更像你，也更像你正在經營的生活。",
    description: "適合入口、工作室、拍攝背景或任何你希望更有存在感的位置。不是做得很滿，而是把主場感放出來。",
    price: "NT$2,880",
    cta: "配置主場角落",
    image: "/images/products/combo-003.jpg",
    category: "植物水晶配置組",
    categoryKey: "combo",
    sceneTags: ["入口", "工作室", "拍攝角落"],
    shortTag: "主場角落",
    featured: true,
    featuredOrder: 5,
    status: "active",
    sortOrder: 3,
    bestFor: ["想讓空間更有存在感", "需要迎接與展示感", "品牌角落想先有雛形"],
    intent: "完整角落配置",
    includesConsult: false,
    includesProduct: true,
    deliveryType: "植物水晶配置",
  },
];

export const consultPackages: Product[] = [
  {
    id: "consult-001",
    slug: "quick-space-reading",
    name: "30 分快速配置判讀",
    headline: "先釐清一個角落，知道自己可以從哪裡開始。",
    description: "適合還不確定要買哪一組、或想先確認桌面與床邊方向的人。以照片與需求為基礎，整理出簡單可執行的建議。",
    price: "NT$880",
    cta: "預約快速判讀",
    image: "/images/products/consult-001.jpg",
    category: "空間配置諮詢",
    categoryKey: "consult",
    sceneTags: ["線上諮詢", "單一角落", "入門判讀"],
    shortTag: "快速判讀",
    featured: false,
    status: "active",
    sortOrder: 1,
    bestFor: ["不知道從哪一區開始", "想先確認方向", "只需要一個角落建議"],
    intent: "想被推薦",
    includesConsult: true,
    includesProduct: false,
    deliveryType: "線上諮詢",
  },
  {
    id: "consult-002",
    slug: "complete-space-configuration-consult",
    name: "60 分完整配置",
    headline: "把空間狀態、使用習慣和適合的配置方向一次整理清楚。",
    description: "適合想被推薦、也想理解為什麼這樣配置的人。會依照照片、動線與使用情境，整理出一到三個可落地的空間方向。",
    price: "NT$1,680",
    cta: "預約完整配置",
    image: "/images/products/consult-002.jpg",
    category: "空間配置諮詢",
    categoryKey: "consult",
    sceneTags: ["線上諮詢", "完整配置", "多角落"],
    shortTag: "完整配置",
    featured: true,
    featuredOrder: 7,
    status: "active",
    sortOrder: 2,
    bestFor: ["想被完整推薦", "有多個角落需要釐清", "希望知道配置原因"],
    intent: "想被推薦",
    includesConsult: true,
    includesProduct: false,
    deliveryType: "線上諮詢",
  },
  {
    id: "consult-003",
    slug: "brand-studio-space-planning",
    name: "品牌工作室規劃",
    headline: "把品牌接待、拍攝與日常使用的空間感，一起整理成方向。",
    description: "適合工作室、品牌櫃台、接待區與拍攝場景。從想傳達的感受出發，協助你整理出更一致、也更容易執行的配置方向。",
    price: "NT$3,800 起",
    cta: "預約品牌規劃",
    image: "/images/products/consult-003.jpg",
    category: "空間配置諮詢",
    categoryKey: "consult",
    sceneTags: ["品牌空間", "工作室", "接待區"],
    shortTag: "品牌規劃",
    featured: true,
    featuredOrder: 8,
    status: "active",
    sortOrder: 3,
    bestFor: ["品牌空間需要方向", "想整理接待與拍攝感", "需要先規劃再採購"],
    intent: "品牌空間規劃",
    includesConsult: true,
    includesProduct: false,
    deliveryType: "品牌空間規劃",
  },
];

export const allProducts: Product[] = [
  ...readyProducts,
  ...customPackages,
  ...comboProducts,
  ...consultPackages,
];

export const featuredProducts = allProducts
  .filter((item) => item.featured && item.status === "active")
  .sort((a, b) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999));

export const activeProducts = allProducts.filter((item) => item.status === "active");

export const productRecommendationMap: Record<string, string[]> = {
  focus: ["ready-002", "combo-002", "consult-002"],
  calm: ["combo-001", "ready-001", "consult-001"],
  welcome: ["ready-003", "combo-003", "custom-003"],
  brand: ["custom-003", "consult-003", "combo-003"],
  desk: ["ready-002", "combo-002", "custom-001"],
  bedside: ["combo-001", "ready-001", "custom-001"],
};

export const getProductsByIds = (ids: string[]): Product[] =>
  ids
    .map((id) => allProducts.find((item) => item.id === id))
    .filter((item): item is Product => Boolean(item));

export const productCategoryGuides: ProductCategoryGuide[] = [
  {
    categoryKey: "ready",
    title: "現成空間組",
    subtitle: "已經知道想處理哪一區，可以直接從這裡開始。",
    buyerIntent: "直接購買",
  },
  {
    categoryKey: "combo",
    title: "植物水晶配置組",
    subtitle: "想讓一個角落更完整、有畫面感，可以選這一類。",
    buyerIntent: "完整角落配置",
  },
  {
    categoryKey: "consult",
    title: "空間配置諮詢",
    subtitle: "還不知道怎麼選，先透過判讀釐清方向。",
    buyerIntent: "想被推薦",
  },
  {
    categoryKey: "custom",
    title: "客製空間搭配",
    subtitle: "想做出更貼近自己或品牌風格的版本，適合選這一類。",
    buyerIntent: "客製規劃",
  },
];
