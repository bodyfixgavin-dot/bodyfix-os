import { SERVICES } from "./config";
import { assertCommissionRuleIsUsable, findCommissionRule } from "./commission";
import { assertCanOperateService } from "./permissions";
import type {
  MonthlyProjectionInput,
  MonthlyProjectionResult,
  ServiceCalculationInput,
  ServiceCalculationResult,
} from "./types";

function findService(serviceCode: ServiceCalculationInput["serviceCode"]) {
  const service = SERVICES.find((item) => item.serviceCode === serviceCode);
  if (!service) throw new Error(`Unknown service code: ${serviceCode}`);
  return service;
}

export function calculateServiceProfit(input: ServiceCalculationInput): ServiceCalculationResult {
  const service = findService(input.serviceCode);

  if (service.serviceCode === "grooming_interest") {
    throw new Error("grooming_interest is interest_only and cannot be calculated as a paid service.");
  }

  if (service.status !== "active") {
    throw new Error(`Service '${input.serviceCode}' is not active and cannot be calculated.`);
  }

  if (service.revenueModel !== "service_commission") {
    throw new Error(
      `Service '${input.serviceCode}' uses revenue model '${service.revenueModel}' and cannot be automatically calculated.`,
    );
  }

  assertCanOperateService(input.staffLevelId, input.serviceCode);

  const rule = findCommissionRule({
    serviceCode: input.serviceCode,
    customerSource: input.customerSource,
    staffLevelId: input.staffLevelId,
  });
  assertCommissionRuleIsUsable(rule);

  const grossRevenueTwd = input.grossRevenueTwd ?? service.recommendedPriceTwd;
  if (grossRevenueTwd === null) {
    throw new Error(`Service '${input.serviceCode}' does not have a calculable price.`);
  }

  const materialCostTwd = input.materialCostTwd ?? service.defaultMaterialCostTwd ?? 0;
  const adminCostTwd = input.adminCostTwd ?? service.defaultAdminCostTwd ?? 0;
  const locationCostTwd = input.locationCostTwd ?? 0;
  const referralBonusTwd = input.referralBonusTwd ?? 0;
  const employeePayoutTwd = Math.round(grossRevenueTwd * rule.employeeRate);
  const bodyfixGrossShareTwd = grossRevenueTwd - employeePayoutTwd;
  const bodyfixNetProfitTwd =
    bodyfixGrossShareTwd - materialCostTwd - adminCostTwd - locationCostTwd - referralBonusTwd;

  return {
    serviceCode: input.serviceCode,
    customerSource: input.customerSource,
    staffLevelId: input.staffLevelId,
    grossRevenueTwd,
    employeePayoutTwd,
    bodyfixGrossShareTwd,
    materialCostTwd,
    adminCostTwd,
    locationCostTwd,
    referralBonusTwd,
    bodyfixNetProfitTwd,
    appliedRuleId: rule.id,
    notes: [rule.note ?? "Standard service commission rule applied."],
  };
}

export function calculateMonthlyProjection(input: MonthlyProjectionInput): MonthlyProjectionResult {
  const perSession = calculateServiceProfit(input);
  const perSessionVariableCostTwd =
    perSession.materialCostTwd +
    perSession.adminCostTwd +
    perSession.locationCostTwd +
    perSession.referralBonusTwd;
  const monthlyGrossRevenueTwd = perSession.grossRevenueTwd * input.monthlySessions;
  const monthlyEmployeePayoutTwd = perSession.employeePayoutTwd * input.monthlySessions;
  const monthlyVariableCostTwd = perSessionVariableCostTwd * input.monthlySessions;
  const bodyfixMonthlyNetProfitTwd =
    perSession.bodyfixNetProfitTwd * input.monthlySessions - input.monthlyFixedCostTwd;
  const breakEvenSessions =
    perSession.bodyfixNetProfitTwd > 0
      ? Math.ceil(input.monthlyFixedCostTwd / perSession.bodyfixNetProfitTwd)
      : null;

  return {
    serviceCode: input.serviceCode,
    customerSource: input.customerSource,
    staffLevelId: input.staffLevelId,
    monthlySessions: input.monthlySessions,
    monthlyGrossRevenueTwd,
    monthlyEmployeePayoutTwd,
    monthlyVariableCostTwd,
    monthlyFixedCostTwd: input.monthlyFixedCostTwd,
    bodyfixMonthlyNetProfitTwd,
    breakEvenSessions,
    perSession,
    notes: [
      `Per-session BodyFix net contribution before monthly fixed cost: ${perSession.bodyfixNetProfitTwd}`,
      ...perSession.notes,
    ],
  };
}
