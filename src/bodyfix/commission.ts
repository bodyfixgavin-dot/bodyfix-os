import { COMMISSION_RULES } from "./foundation.config";
import type { CommissionRule, CustomerSource, ServiceId, StaffLevelId } from "./types";
export function findCommissionRule(params: {
  serviceId: ServiceId;
  customerSource: CustomerSource;
  staffLevelId?: StaffLevelId;
}): CommissionRule | null {
  const { serviceId, customerSource, staffLevelId } = params;
  const exact = COMMISSION_RULES.find(
    (rule) =>
      rule.serviceId === serviceId &&
      rule.customerSource === customerSource &&
      (!rule.staffLevelId || rule.staffLevelId === staffLevelId)
  );
  if (exact) return exact;
  const fallback = COMMISSION_RULES.find(
    (rule) =>
      rule.serviceId === serviceId &&
      rule.customerSource === customerSource &&
      !rule.staffLevelId
  );
  return fallback ?? null;
}
export function assertCommissionRuleIsUsable(rule: CommissionRule | null): asserts rule is CommissionRule {
  if (!rule) {
    throw new Error("No commission rule found for the given service, customer source, and staff level.");
  }
  if (rule.employeeRate === null || rule.bodyfixRate === null) {
    throw new Error(`Commission rule '${rule.id}' is case-by-case and cannot be calculated automatically.`);
  }
  const total = Number((rule.employeeRate + rule.bodyfixRate).toFixed(6));
  if (total !== 1) {
    throw new Error(`Commission rule '${rule.id}' must add up to 1. Current total: ${total}`);
  }
}
