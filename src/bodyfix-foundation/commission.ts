import { COMMISSION_RULES } from "./config";
import type { CommissionRule, CustomerSource, ServiceCode, StaffLevelId } from "./types";

export interface FindCommissionRuleParams {
  serviceCode: ServiceCode;
  customerSource: CustomerSource;
  staffLevelId?: StaffLevelId;
}

export type UsableCommissionRule = CommissionRule & {
  employeeRate: number;
  bodyfixRate: number;
};

export function findCommissionRule(params: FindCommissionRuleParams): CommissionRule | null {
  return (
    COMMISSION_RULES.find((rule) => {
      const staffLevelMatches = !rule.staffLevelId || !params.staffLevelId || rule.staffLevelId === params.staffLevelId;

      return (
        rule.serviceCode === params.serviceCode &&
        rule.customerSource === params.customerSource &&
        staffLevelMatches
      );
    }) ?? null
  );
}

export function assertCommissionRuleIsUsable(
  rule: CommissionRule | null,
): asserts rule is UsableCommissionRule {
  if (!rule) throw new Error("No commission rule found for this calculation.");
  if (rule.employeeRate === null || rule.bodyfixRate === null) {
    throw new Error(`Commission rule '${rule.id}' is case-by-case and cannot be calculated automatically.`);
  }

  const rateTotal = rule.employeeRate + rule.bodyfixRate;
  if (Math.abs(rateTotal - 1) > 0.000001) {
    throw new Error(`Commission rule '${rule.id}' is invalid: employeeRate + bodyfixRate must equal 1.`);
  }
}
