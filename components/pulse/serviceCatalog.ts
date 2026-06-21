export type BillingType = "session" | "addon" | "package" | "installment" | "monthly" | "fixed_scope" | "coming_soon" | "subsidy" | "other";
export type ServiceStatus = "active" | "trial" | "draft" | "coming_soon" | "retired";

export type ServiceCatalogItem = {
  service_code: string;
  service_line: string;
  service_name: string;
  service_variant: string | null;
  price: number | null;
  billing_type: BillingType;
  status: ServiceStatus;
  note?: string;
};

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  { service_code: "BF-BR-001", service_line: "Body Reset", service_name: "筋膜鏈整理", service_variant: "60 分鐘", price: 2200, billing_type: "session", status: "active" },
  { service_code: "BF-BR-002", service_line: "Body Reset", service_name: "筋膜線指定整理", service_variant: "60 分鐘", price: 2300, billing_type: "session", status: "active" },
  { service_code: "BF-BR-EXT-001", service_line: "Body Reset", service_name: "筋膜鏈延長整理", service_variant: "+30 分鐘", price: 1000, billing_type: "addon", status: "active" },
  { service_code: "BF-BR-003", service_line: "Body Reset", service_name: "多線整合整理", service_variant: "90 分鐘", price: 3600, billing_type: "session", status: "active" },
  { service_code: "BF-PC-001", service_line: "Pelvic Core", service_name: "骨盆核心整理", service_variant: "60 分鐘", price: 2500, billing_type: "session", status: "active" },
  { service_code: "BF-PC-EXT-001", service_line: "Pelvic Core", service_name: "骨盆核心延長整理", service_variant: "+30 分鐘", price: 1200, billing_type: "addon", status: "active" },
  { service_code: "BF-PC-VIP-001", service_line: "Pelvic Core", service_name: "骨盆核心深度完整方案", service_variant: "120 分鐘", price: 6800, billing_type: "session", status: "active", note: "不是單純延長時間，而是高階權限服務。" },
  { service_code: "BF-MI-001", service_line: "Movement Integration", service_name: "單堂評估訓練", service_variant: "60 分鐘", price: 1800, billing_type: "session", status: "active" },
  { service_code: "BF-MI-PKG-001", service_line: "Movement Integration", service_name: "12 堂基礎建立", service_variant: "12 堂", price: 20400, billing_type: "package", status: "active" },
  { service_code: "BF-MI-PKG-002", service_line: "Movement Integration", service_name: "24 堂三個月整合", service_variant: "24 堂", price: 38400, billing_type: "package", status: "active" },
  { service_code: "BF-MI-PKG-003", service_line: "Movement Integration", service_name: "36 堂長期進階", service_variant: "36 堂", price: 54000, billing_type: "package", status: "active" },
  { service_code: "BF-MI-PKG-004", service_line: "Movement Integration", service_name: "24+12 深度整合方案", service_variant: "24 堂訓練 + 12 堂筋膜鏈整理", price: 62400, billing_type: "package", status: "active", note: "不可寫成 36 堂，必須拆成 24 堂訓練 + 12 堂筋膜鏈整理。" },
  { service_code: "BF-MI-PKG-004-PAYFULL", service_line: "Movement Integration", service_name: "24+12 深度整合方案一次付清優惠", service_variant: "一次付清", price: 60000, billing_type: "package", status: "active" },
  { service_code: "BF-MI-PKG-004-INST2", service_line: "Movement Integration", service_name: "24+12 深度整合方案分 2 期", service_variant: "每期 NT$31,200，總額 NT$62,400", price: 31200, billing_type: "installment", status: "active" },
  { service_code: "BF-MI-PKG-004-INST3", service_line: "Movement Integration", service_name: "24+12 深度整合方案分 3 期", service_variant: "每期 NT$20,800，總額 NT$62,400", price: 20800, billing_type: "installment", status: "active" },
  { service_code: "BF-SR-TR-001", service_line: "Status Reading", service_name: "塔羅單題整理", service_variant: "fixed_scope", price: 333, billing_type: "fixed_scope", status: "active" },
  { service_code: "BF-SR-TR-002", service_line: "Status Reading", service_name: "塔羅狀態整理", service_variant: "fixed_scope", price: 666, billing_type: "fixed_scope", status: "active" },
  { service_code: "BF-SR-TR-003", service_line: "Status Reading", service_name: "塔羅深度整理", service_variant: "fixed_scope", price: 1200, billing_type: "fixed_scope", status: "active" },
  { service_code: "BF-SR-ZW-TXT-001", service_line: "Status Reading", service_name: "紫微小題文字整理", service_variant: "fixed_scope", price: 888, billing_type: "fixed_scope", status: "active" },
  { service_code: "BF-SR-ZW-001", service_line: "Status Reading", service_name: "紫微結構解析", service_variant: "fixed_scope", price: 3600, billing_type: "fixed_scope", status: "active" },
  { service_code: "BF-SR-PKG-001", service_line: "Status Reading", service_name: "紫微 + 塔羅整合諮詢", service_variant: "fixed_scope", price: 4800, billing_type: "fixed_scope", status: "active" },
  { service_code: "BF-SR-EXT-001", service_line: "Status Reading", service_name: "延伸狀態整理", service_variant: "+30 分鐘", price: 1000, billing_type: "addon", status: "active", note: "紫微不是按分鐘計價，而是固定範圍計價 fixed_scope。" },
  { service_code: "BF-CORP-001", service_line: "Corporate Extension", service_name: "BodyFix 初次完整評估整理", service_variant: "60 分鐘標準價", price: 2200, billing_type: "session", status: "active" },
  { service_code: "BF-CORP-002", service_line: "Corporate Extension", service_name: "企業活動參與者單人預約", service_variant: "60 分鐘", price: 2100, billing_type: "session", status: "active" },
  { service_code: "BF-CORP-003", service_line: "Corporate Extension", service_name: "企業活動兩人同行", service_variant: "每人", price: 2000, billing_type: "session", status: "active" },
  { service_code: "BF-MEM-BODY-001", service_line: "Membership", service_name: "BodyFix 身體狀態吃到飽", service_variant: "試營運，每月最多 8 次，每週最多 2 次，每次 60 分鐘", price: 16800, billing_type: "monthly", status: "trial" },
  { service_code: "BF-MEM-BODY-002", service_line: "Membership", service_name: "BodyFix 身體狀態吃到飽", service_variant: "正式價，每月最多 8 次，每週最多 2 次，每次 60 分鐘", price: 19800, billing_type: "monthly", status: "draft" },
  { service_code: "BF-MEM-CHART-001", service_line: "Membership", service_name: "Chart Navigator 命盤導航問到飽", service_variant: "試營運，每週 1 個主題，每月 1 次整理", price: 4800, billing_type: "monthly", status: "trial" },
  { service_code: "BF-MEM-CHART-002", service_line: "Membership", service_name: "Chart Navigator 命盤導航問到飽", service_variant: "正式價，每週 1 個主題，每月 1 次整理", price: 6800, billing_type: "monthly", status: "draft" },
  { service_code: "BF-FANS-001", service_line: "Other Revenue", service_name: "FansOne", service_variant: "月費", price: 599, billing_type: "monthly", status: "active" },
  { service_code: "BF-SPACE-001", service_line: "Space Guide", service_name: "Space Guide", service_variant: "尚未正式定價", price: null, billing_type: "coming_soon", status: "coming_soon" },
  { service_code: "BF-GROOM-001", service_line: "Grooming", service_name: "Grooming／除毛", service_variant: "Coming Soon", price: null, billing_type: "coming_soon", status: "coming_soon" },
  { service_code: "BF-TOUR-001", service_line: "City Tour", service_name: "城市巡迴", service_variant: "尚未獨立定價", price: null, billing_type: "coming_soon", status: "draft" },
  { service_code: "BF-HOME-001", service_line: "Home Visit", service_name: "到府服務", service_variant: "到府加價尚未正式定價", price: null, billing_type: "coming_soon", status: "draft" },
  { service_code: "BF-EQUIP-001", service_line: "Equipment Subsidy", service_name: "居家腳踏車補助版", service_variant: "補助 NT$1,500，是否納入正式方案待定", price: 1500, billing_type: "subsidy", status: "draft" }
];

export const SELECTABLE_SERVICE_CATALOG = SERVICE_CATALOG.filter((service) => ["active", "trial"].includes(service.status));
