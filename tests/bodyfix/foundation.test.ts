import { describe, expect, it } from "vitest";
import {
  calculateMonthlyProjection,
  calculateServiceProfit,
  canOperateService,
  listAllowedServices,
} from "../../src/bodyfix";

describe("calculateServiceProfit", () => {
  it.each([
    {
      label: "Grooming 官方客，員工 60%，BodyFix 40%",
      serviceId: "GROOMING_MALE_CARE" as const,
      customerSource: "BODYFIX_OFFICIAL" as const,
      staffLevelId: "L1_GROOMING_SPECIALIST" as const,
      grossRevenueTwd: 2000,
      materialCostTwd: 200,
      adminCostTwd: 100,
      expectedEmployeePayoutTwd: 1200,
      expectedBodyfixGrossShareTwd: 800,
      expectedBodyfixNetProfitTwd: 500,
      expectedRuleId: "grooming_official_certified",
    },
    {
      label: "Grooming 自帶客，員工 65%，BodyFix 35%",
      serviceId: "GROOMING_MALE_CARE" as const,
      customerSource: "EMPLOYEE_OWN" as const,
      staffLevelId: "L1_GROOMING_SPECIALIST" as const,
      grossRevenueTwd: 2000,
      materialCostTwd: 200,
      adminCostTwd: 100,
      expectedEmployeePayoutTwd: 1300,
      expectedBodyfixGrossShareTwd: 700,
      expectedBodyfixNetProfitTwd: 400,
      expectedRuleId: "grooming_employee_own",
    },
    {
      label: "筋膜鏈官方客，員工 45%，BodyFix 55%",
      serviceId: "FASCIA_LINE_RESET_SINGLE" as const,
      customerSource: "BODYFIX_OFFICIAL" as const,
      staffLevelId: "L4_FASCIA_PRACTITIONER" as const,
      grossRevenueTwd: 2300,
      materialCostTwd: 100,
      adminCostTwd: 100,
      expectedEmployeePayoutTwd: 1035,
      expectedBodyfixGrossShareTwd: 1265,
      expectedBodyfixNetProfitTwd: 1065,
      expectedRuleId: "fascia_official_certified",
    },
    {
      label: "骨盆核心官方客，員工 42.5%，BodyFix 57.5%",
      serviceId: "PELVIC_CORE_RESET" as const,
      customerSource: "BODYFIX_OFFICIAL" as const,
      staffLevelId: "L6_PELVIC_CORE_PRACTITIONER" as const,
      grossRevenueTwd: 2500,
      materialCostTwd: 100,
      adminCostTwd: 100,
      expectedEmployeePayoutTwd: 1063,
      expectedBodyfixGrossShareTwd: 1437,
      expectedBodyfixNetProfitTwd: 1237,
      expectedRuleId: "pelvic_core_official",
    },
  ])("calculates $label", (scenario) => {
    const result = calculateServiceProfit(scenario);

    expect(result.employeePayoutTwd).toBe(scenario.expectedEmployeePayoutTwd);
    expect(result.bodyfixGrossShareTwd).toBe(scenario.expectedBodyfixGrossShareTwd);
    expect(result.bodyfixNetProfitTwd).toBe(scenario.expectedBodyfixNetProfitTwd);
    expect(result.appliedRuleId).toBe(scenario.expectedRuleId);
  });
});

describe("calculateMonthlyProjection", () => {
  it.each([30, 50, 80, 100])("calculates monthly grooming projection for %i people", (monthlySessions) => {
    const result = calculateMonthlyProjection({
      serviceId: "GROOMING_MALE_CARE",
      customerSource: "BODYFIX_OFFICIAL",
      staffLevelId: "L1_GROOMING_SPECIALIST",
      monthlySessions,
      pricePerSessionTwd: 2000,
      materialCostPerSessionTwd: 200,
      adminCostPerSessionTwd: 100,
      monthlyFixedCostTwd: 15000,
    });

    expect(result.monthlySessions).toBe(monthlySessions);
    expect(result.monthlyGrossRevenueTwd).toBe(2000 * monthlySessions);
    expect(result.monthlyEmployeePayoutTwd).toBe(1200 * monthlySessions);
    expect(result.monthlyVariableCostTwd).toBe(300 * monthlySessions);
    expect(result.monthlyFixedCostTwd).toBe(15000);
    expect(result.bodyfixMonthlyNetProfitTwd).toBe(500 * monthlySessions - 15000);
    expect(result.breakEvenSessions).toBe(30);
  });
});

describe("canOperateService", () => {
  it("limits L1 to Grooming only", () => {
    expect(listAllowedServices("L1_GROOMING_SPECIALIST")).toEqual(["GROOMING_MALE_CARE"]);
    expect(canOperateService("L1_GROOMING_SPECIALIST", "FASCIA_LINE_RESET_SINGLE")).toBe(false);
  });

  it("allows L4 to operate single fascia-line reset", () => {
    expect(canOperateService("L4_FASCIA_PRACTITIONER", "FASCIA_LINE_RESET_SINGLE")).toBe(true);
    expect(canOperateService("L4_FASCIA_PRACTITIONER", "MULTI_LINE_RESET")).toBe(false);
  });

  it("allows L5 to operate multi-line reset", () => {
    expect(canOperateService("L5_MULTI_LINE_PRACTITIONER", "MULTI_LINE_RESET")).toBe(true);
    expect(canOperateService("L5_MULTI_LINE_PRACTITIONER", "PELVIC_CORE_RESET")).toBe(false);
  });

  it("allows L6 to operate pelvic core reset", () => {
    expect(canOperateService("L6_PELVIC_CORE_PRACTITIONER", "PELVIC_CORE_RESET")).toBe(true);
    expect(canOperateService("L6_PELVIC_CORE_PRACTITIONER", "TWELVE_SESSION_PROGRAM")).toBe(false);
  });

  it("allows L7 to operate 12-session and VIP services", () => {
    expect(canOperateService("L7_ADVANCED_INTEGRATION_PRACTITIONER", "TWELVE_SESSION_PROGRAM")).toBe(true);
    expect(canOperateService("L7_ADVANCED_INTEGRATION_PRACTITIONER", "VIP_DEEP_INTEGRATION_120")).toBe(true);
  });
});
