export type Currency = "TWD";
export type CustomerSource =
  | "BODYFIX_OFFICIAL"
  | "EMPLOYEE_OWN"
  | "PARTNER_REFERRAL"
  | "STUDENT_OWN"
  | "UNKNOWN";
export type CustomerOwnership =
  | "BODYFIX"
  | "SHARED"
  | "EMPLOYEE"
  | "STUDENT"
  | "CASE_BY_CASE";
export type RevenueModel =
  | "service_commission"
  | "fixed_referral_bonus"
  | "case_by_case"
  | "training_fee"
  | "license_fee"
  | "not_open";
export type ServiceCategory =
  | "GROOMING"
  | "FASCIA_LINE"
  | "MULTI_LINE"
  | "PELVIC_CORE"
  | "TWELVE_SESSION_PROGRAM"
  | "VIP_INTEGRATION"
  | "TRAINING"
  | "STATUS_READING";
export type StaffLevelId =
  | "L0_FOUNDATION_ASSISTANT"
  | "L1_GROOMING_SPECIALIST"
  | "L2_OBSERVATION_ASSISTANT"
  | "L3_FASCIA_INTERN"
  | "L4_FASCIA_PRACTITIONER"
  | "L5_MULTI_LINE_PRACTITIONER"
  | "L6_PELVIC_CORE_PRACTITIONER"
  | "L7_ADVANCED_INTEGRATION_PRACTITIONER"
  | "INSTRUCTOR";
export type ServiceId =
  | "GROOMING_MALE_CARE"
  | "FASCIA_LINE_RESET_SINGLE"
  | "MULTI_LINE_RESET"
  | "PELVIC_CORE_RESET"
  | "TWELVE_SESSION_PROGRAM"
  | "VIP_DEEP_INTEGRATION_120"
  | "BODYFIX_TRAINING_SYSTEM"
  | "STATUS_READING_SESSION";
export interface MoneyAmount {
  amount: number;
  currency: Currency;
}
export interface StaffLevel {
  id: StaffLevelId;
  nameZh: string;
  nameEn: string;
  rank: number;
  description: string;
  canOperateServiceIds: ServiceId[];
  cannotOperateNotes: string[];
  upgradeRequirements: string[];
}
export interface ServiceProduct {
  id: ServiceId;
  category: ServiceCategory;
  nameZh: string;
  nameEn: string;
  role: string;
  externalOneLiner: string;
  internalPositioning: string;
  recommendedPriceTwd: number | null;
  durationMinutes: number | null;
  minimumStaffLevelId: StaffLevelId | "GAVIN_ONLY" | "CASE_BY_CASE";
  revenueModel: RevenueModel;
  defaultVariableCostTwd: number;
  defaultAdminCostTwd: number;
  isHighRiskOrHighTrust: boolean;
  nextProductIds: ServiceId[];
}
export interface CommissionRule {
  id: string;
  serviceId: ServiceId;
  customerSource: CustomerSource;
  staffLevelId?: StaffLevelId;
  employeeRate: number | null;
  bodyfixRate: number | null;
  fixedEmployeeBonusTwd?: number;
  fixedBodyfixFeeTwd?: number;
  note: string;
}
export interface ReferralBonusRule {
  id: string;
  targetServiceId: ServiceId;
  label: string;
  bonusMinTwd: number;
  bonusMaxTwd: number;
  recommendedBonusTwd: number;
  note: string;
}
export interface CustomerOwnershipRule {
  id: string;
  customerSource: CustomerSource;
  ownership: CustomerOwnership;
  crmRequired: boolean;
  officialPaymentRequired: boolean;
  note: string;
}
export interface ServiceCalculationInput {
  serviceId: ServiceId;
  customerSource: CustomerSource;
  grossRevenueTwd: number;
  staffLevelId?: StaffLevelId;
  materialCostTwd?: number;
  adminCostTwd?: number;
  locationCostTwd?: number;
  referralBonusTwd?: number;
}
export interface ServiceCalculationResult {
  serviceId: ServiceId;
  customerSource: CustomerSource;
  grossRevenueTwd: number;
  employeePayoutTwd: number;
  bodyfixGrossShareTwd: number;
  materialCostTwd: number;
  adminCostTwd: number;
  locationCostTwd: number;
  referralBonusTwd: number;
  bodyfixNetProfitTwd: number;
  appliedRuleId: string | null;
  notes: string[];
}
export interface MonthlyProjectionInput {
  serviceId: ServiceId;
  customerSource: CustomerSource;
  monthlySessions: number;
  pricePerSessionTwd: number;
  staffLevelId?: StaffLevelId;
  materialCostPerSessionTwd?: number;
  adminCostPerSessionTwd?: number;
  locationCostPerSessionTwd?: number;
  referralBonusPerSessionTwd?: number;
  monthlyFixedCostTwd: number;
}
export interface MonthlyProjectionResult {
  monthlySessions: number;
  monthlyGrossRevenueTwd: number;
  monthlyEmployeePayoutTwd: number;
  monthlyVariableCostTwd: number;
  monthlyFixedCostTwd: number;
  bodyfixMonthlyNetProfitTwd: number;
  breakEvenSessions: number | null;
  notes: string[];
}
