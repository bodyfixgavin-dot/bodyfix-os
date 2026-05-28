import { SERVICES } from "./foundation.config";
import { assertCommissionRuleIsUsable, findCommissionRule } from "./commission";
import type {
  MonthlyProjectionInput,
  MonthlyProjectionResult,
  ServiceCalculationInput,
  ServiceCalculationResult,
} from "./types";
export function calculateServiceProfit(input: ServiceCalculationInput): ServiceCalculationResult {
  const service = SERVICES.find((item) => item.id === input.serviceId);
  if (!service) throw new Error(`Unknown service: ${input.serviceId}`);
  const rule = findCommissionRule({
    serviceId: input.serviceId,
    customerSource: input.customerSource,
    staffLevelId: input.staffLevelId,
  });
  assertCommissionRuleIsUsable(rule);
  const materialCostTwd = input.materialCostTwd ?? service.defaultVariableCostTwd;
  const adminCostTwd = input.adminCostTwd ?? service.defaultAdminCostTwd;
  const locationCostTwd = input.locationCostTwd ?? 0;
  const referralBonusTwd = input.referralBonusTwd ?? 0;
  const employeePayoutTwd = Math.round(input.grossRevenueTwd * rule.employeeRate);
  const bodyfixGrossShareTwd = input.grossRevenueTwd - employeePayoutTwd;
  const bodyfixNetProfitTwd =
    bodyfixGrossShareTwd -
    materialCostTwd -
    adminCostTwd -
    locationCostTwd -
    referralBonusTwd;
  return {
    serviceId: input.serviceId,
    customerSource: input.customerSource,
    grossRevenueTwd: input.grossRevenueTwd,
    employeePayoutTwd,
    bodyfixGrossShareTwd,
    materialCostTwd,
    adminCostTwd,
    locationCostTwd,
    referralBonusTwd,
    bodyfixNetProfitTwd,
    appliedRuleId: rule.id,
    notes: [rule.note],
  };
}
export function calculateMonthlyProjection(input: MonthlyProjectionInput): MonthlyProjectionResult {
  const perSession = calculateServiceProfit({
    serviceId: input.serviceId,
    customerSource: input.customerSource,
    grossRevenueTwd: input.pricePerSessionTwd,
    staffLevelId: input.staffLevelId,
    materialCostTwd: input.materialCostPerSessionTwd,
    adminCostTwd: input.adminCostPerSessionTwd,
    locationCostTwd: input.locationCostPerSessionTwd,
    referralBonusTwd: input.referralBonusPerSessionTwd,
  });
  const monthlyGrossRevenueTwd = input.pricePerSessionTwd * input.monthlySessions;
  const monthlyEmployeePayoutTwd = perSession.employeePayoutTwd * input.monthlySessions;
  const monthlyVariableCostTwd =
    (perSession.materialCostTwd +
      perSession.adminCostTwd +
      perSession.locationCostTwd +
      perSession.referralBonusTwd) *
    input.monthlySessions;
  const bodyfixMonthlyNetProfitTwd =
    perSession.bodyfixNetProfitTwd * input.monthlySessions - input.monthlyFixedCostTwd;
  const perSessionContribution = perSession.bodyfixNetProfitTwd;
  const breakEvenSessions =
    perSessionContribution > 0
      ? Math.ceil(input.monthlyFixedCostTwd / perSessionContribution)
      : null;
  return {
    monthlySessions: input.monthlySessions,
    monthlyGrossRevenueTwd,
    monthlyEmployeePayoutTwd,
    monthlyVariableCostTwd,
    monthlyFixedCostTwd: input.monthlyFixedCostTwd,
    bodyfixMonthlyNetProfitTwd,
    breakEvenSessions,
    notes: [
      `Per-session BodyFix contribution before monthly fixed cost: ${perSessionContribution}`,
      ...perSession.notes,
    ],
  };
}
