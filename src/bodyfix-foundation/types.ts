export type Currency = "TWD";

export type CustomerSource =
  | "bodyfix_official"
  | "staff_own"
  | "partner_referral"
  | "student_own"
  | "unknown";

export type CustomerOwnership =
  | "bodyfix"
  | "shared"
  | "staff"
  | "student"
  | "case_by_case";

export type RevenueModel =
  | "service_commission"
  | "fixed_referral_bonus"
  | "case_by_case"
  | "training_fee"
  | "license_fee"
  | "not_open";

export type ServiceStatus = "active" | "coming_soon" | "interest_only" | "paused" | "archived";

export type ServiceCategory =
  | "body_reset"
  | "status_analysis"
  | "movement_training"
  | "grooming"
  | "training"
  | "vip"
  | "addon";

export type StaffLevelId =
  | "L0_FOUNDATION_ASSISTANT"
  | "L1_GROOMING_TRAINEE"
  | "L2_OBSERVATION_ASSISTANT"
  | "L3_FASCIA_INTERN"
  | "L4_FASCIA_LINE_PRACTITIONER"
  | "L5_MULTI_LINE_PRACTITIONER"
  | "L6_PELVIC_CORE_PRACTITIONER"
  | "L7_ADVANCED_INTEGRATION_PRACTITIONER"
  | "INSTRUCTOR"
  | "GAVIN_ONLY";

export type ServiceCode =
  | "fascia_chain_reset_60"
  | "fascia_extension_30"
  | "pelvic_core_reset_60"
  | "pelvic_core_extension_30"
  | "fascia_line_selected_reset_60"
  | "multi_line_reset_90"
  | "pelvic_core_advanced_120"
  | "ziwei_structural_analysis_90"
  | "tarot_single_question_15"
  | "tarot_status_reading_30"
  | "tarot_deep_reading_60"
  | "ziwei_tarot_integration_120"
  | "consultation_extension_30"
  | "training_single_session_60"
  | "training_12_foundation"
  | "training_24_integration"
  | "training_36_progression"
  | "training_24_plus_12_bundle"
  | "grooming_interest";

export interface MoneyAmount {
  amount: number;
  currency: Currency;
}

export interface StaffLevel {
  id: StaffLevelId;
  nameZh: string;
  rank: number;
  positioning: string;
  canOperateServiceCodes: ServiceCode[];
  cannotOperateServiceCodes?: ServiceCode[];
  notes?: string[];
}

export interface ServiceProduct {
  serviceCode: ServiceCode;
  nameZh: string;
  category: ServiceCategory;
  recommendedPriceTwd: number | null;
  durationMinutes: number | null;
  status: ServiceStatus;
  minimumStaffLevelId: StaffLevelId | "CASE_BY_CASE";
  revenueModel: RevenueModel;
  positioning: string;
  externalOneLiner?: string;
  nextServiceCodes?: ServiceCode[];
  defaultMaterialCostTwd?: number;
  defaultAdminCostTwd?: number;
  isHighRiskOrHighTrust?: boolean;
  note?: string;
}

export interface CommissionRule {
  id: string;
  serviceCode: ServiceCode;
  customerSource: CustomerSource;
  staffLevelId?: StaffLevelId;
  revenueModel: RevenueModel;
  employeeRate: number | null;
  bodyfixRate: number | null;
  note?: string;
}

export interface ReferralBonusRule {
  id: string;
  targetServiceCode: ServiceCode;
  label: string;
  bonusMinTwd: number;
  bonusMaxTwd: number;
  recommendedBonusTwd: number;
  note?: string;
}

export interface CustomerOwnershipRule {
  id: CustomerSource;
  ownership: CustomerOwnership;
  crmRequired: boolean;
  officialPaymentRequired: boolean;
  note: string;
}

export interface ServiceCalculationInput {
  serviceCode: ServiceCode;
  customerSource: CustomerSource;
  staffLevelId: StaffLevelId;
  grossRevenueTwd?: number;
  materialCostTwd?: number;
  adminCostTwd?: number;
  locationCostTwd?: number;
  referralBonusTwd?: number;
}

export interface ServiceCalculationResult {
  serviceCode: ServiceCode;
  customerSource: CustomerSource;
  staffLevelId: StaffLevelId;
  grossRevenueTwd: number;
  employeePayoutTwd: number;
  bodyfixGrossShareTwd: number;
  materialCostTwd: number;
  adminCostTwd: number;
  locationCostTwd: number;
  referralBonusTwd: number;
  bodyfixNetProfitTwd: number;
  appliedRuleId: string;
  notes: string[];
}

export interface MonthlyProjectionInput extends ServiceCalculationInput {
  monthlySessions: number;
  monthlyFixedCostTwd: number;
}

export interface MonthlyProjectionResult {
  serviceCode: ServiceCode;
  customerSource: CustomerSource;
  staffLevelId: StaffLevelId;
  monthlySessions: number;
  monthlyGrossRevenueTwd: number;
  monthlyEmployeePayoutTwd: number;
  monthlyVariableCostTwd: number;
  monthlyFixedCostTwd: number;
  bodyfixMonthlyNetProfitTwd: number;
  breakEvenSessions: number | null;
  perSession: ServiceCalculationResult;
  notes: string[];
}
