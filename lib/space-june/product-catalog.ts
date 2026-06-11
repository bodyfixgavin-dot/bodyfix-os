import { comboProducts, consultPackages, customPackages, productCategoryGuides, readyProducts, type Product } from "@/lib/product-catalog";

const additionalReadyProducts: Product[] = [
  { ...readyProducts[0], id: "ready-creative", slug: "amethyst-creative-corner", name: "紫水晶創作角落組", headline: "替靈感留一個可以試驗、可以改變的位置。", description: "適合創作桌、企劃牆或拍攝角落，用單一紫色焦點提醒自己進入表達狀態。", price: "NT$1,380", shortTag: "創作系", sceneTags: ["創作區", "企劃桌"], bestFor: ["需要靈感入口", "想保留可變動配置"], sortOrder: 4, featured: false },
  { ...readyProducts[0], id: "ready-protect", slug: "smoky-quartz-boundary-set", name: "煙水晶邊界安定組", headline: "在容易被打斷的位置，建立清楚而不僵硬的邊界。", description: "適合入口、共享工作區與動線交界，先把使用範圍說清楚。", price: "NT$1,420", shortTag: "保護系", sceneTags: ["入口", "共享空間"], bestFor: ["容易被打斷", "需要空間界線"], sortOrder: 5, featured: false },
  { ...readyProducts[0], id: "ready-clear", slug: "clear-quartz-reset-set", name: "白水晶清理重啟組", headline: "先清掉堆積感，再讓一個角落重新開始。", description: "適合準備重新整理的桌面與入口，用透明、淺色配置保留明亮與呼吸感。", price: "NT$1,180", shortTag: "清理系", sceneTags: ["桌面", "入口"], bestFor: ["想重新開始", "需要降低堆積感"], sortOrder: 6, featured: false },
];

export const READY_PRODUCTS = [...readyProducts, ...additionalReadyProducts];
export const COMBO_PRODUCTS = comboProducts;
export const CUSTOM_PACKAGES = customPackages.slice(0, 2);
export const CONSULT_PACKAGES = consultPackages.slice(0, 2);
export const PRODUCT_CATEGORY_GUIDES = productCategoryGuides;
export type { Product, ProductCategoryKey } from "@/lib/product-catalog";
