import { describe, expect, it } from "vitest";
import { calculateMonthlyProjection, calculateServiceProfit } from "../calculator";

describe("BodyFix foundation service calculator", () => {
  it("calculates fascia_chain_reset_60 official customer BodyFix share", () => {
    const result = calculateServiceProfit({
      serviceCode: "fascia_chain_reset_60",
      customerSource: "bodyfix_official",
      staffLevelId: "L4_FASCIA_LINE_PRACTITIONER",
    });

    expect(result.grossRevenueTwd).toBe(2200);
    expect(result.employeePayoutTwd).toBe(990);
    expect(result.bodyfixGrossShareTwd).toBe(1210);
    expect(result.bodyfixNetProfitTwd).toBe(1210);
  });

  it("calculates fascia_line_selected_reset_60 official customer BodyFix share", () => {
    const result = calculateServiceProfit({
      serviceCode: "fascia_line_selected_reset_60",
      customerSource: "bodyfix_official",
      staffLevelId: "L4_FASCIA_LINE_PRACTITIONER",
    });

    expect(result.grossRevenueTwd).toBe(2300);
    expect(result.employeePayoutTwd).toBe(1035);
    expect(result.bodyfixGrossShareTwd).toBe(1265);
  });

  it("calculates multi_line_reset_90 official customer BodyFix share", () => {
    const result = calculateServiceProfit({
      serviceCode: "multi_line_reset_90",
      customerSource: "bodyfix_official",
      staffLevelId: "L5_MULTI_LINE_PRACTITIONER",
    });

    expect(result.grossRevenueTwd).toBe(3600);
    expect(result.employeePayoutTwd).toBe(1800);
    expect(result.bodyfixGrossShareTwd).toBe(1800);
  });

  it("calculates pelvic_core_reset_60 official customer BodyFix share", () => {
    const result = calculateServiceProfit({
      serviceCode: "pelvic_core_reset_60",
      customerSource: "bodyfix_official",
      staffLevelId: "L6_PELVIC_CORE_PRACTITIONER",
    });

    expect(result.grossRevenueTwd).toBe(2500);
    expect(result.employeePayoutTwd).toBe(1063);
    expect(result.bodyfixGrossShareTwd).toBe(1437);
  });

  it("throws for grooming_interest because it is interest-only", () => {
    let thrown = false;
    try {
      calculateServiceProfit({
        serviceCode: "grooming_interest",
        customerSource: "bodyfix_official",
        staffLevelId: "L1_GROOMING_TRAINEE",
      });
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });

  it("throws for pelvic_core_advanced_120 because it is case-by-case", () => {
    let thrown = false;
    try {
      calculateServiceProfit({
        serviceCode: "pelvic_core_advanced_120",
        customerSource: "bodyfix_official",
        staffLevelId: "GAVIN_ONLY",
      });
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });
});

describe("BodyFix foundation monthly projection calculator", () => {
  it("calculates 30 monthly fascia_chain_reset_60 sessions", () => {
    const result = calculateMonthlyProjection({
      serviceCode: "fascia_chain_reset_60",
      customerSource: "bodyfix_official",
      staffLevelId: "L4_FASCIA_LINE_PRACTITIONER",
      monthlySessions: 30,
      monthlyFixedCostTwd: 10000,
    });

    expect(result.monthlyGrossRevenueTwd).toBe(66000);
    expect(result.monthlyEmployeePayoutTwd).toBe(29700);
    expect(result.bodyfixMonthlyNetProfitTwd).toBe(26300);
    expect(result.breakEvenSessions).toBe(9);
  });

  it("calculates 50 monthly fascia_chain_reset_60 sessions", () => {
    const result = calculateMonthlyProjection({
      serviceCode: "fascia_chain_reset_60",
      customerSource: "bodyfix_official",
      staffLevelId: "L4_FASCIA_LINE_PRACTITIONER",
      monthlySessions: 50,
      monthlyFixedCostTwd: 10000,
    });

    expect(result.monthlyGrossRevenueTwd).toBe(110000);
    expect(result.monthlyEmployeePayoutTwd).toBe(49500);
    expect(result.bodyfixMonthlyNetProfitTwd).toBe(50500);
  });

  it("calculates 80 monthly fascia_line_selected_reset_60 sessions", () => {
    const result = calculateMonthlyProjection({
      serviceCode: "fascia_line_selected_reset_60",
      customerSource: "bodyfix_official",
      staffLevelId: "L4_FASCIA_LINE_PRACTITIONER",
      monthlySessions: 80,
      monthlyFixedCostTwd: 15000,
    });

    expect(result.monthlyGrossRevenueTwd).toBe(184000);
    expect(result.monthlyEmployeePayoutTwd).toBe(82800);
    expect(result.bodyfixMonthlyNetProfitTwd).toBe(86200);
  });

  it("calculates 100 monthly multi_line_reset_90 sessions", () => {
    const result = calculateMonthlyProjection({
      serviceCode: "multi_line_reset_90",
      customerSource: "bodyfix_official",
      staffLevelId: "L5_MULTI_LINE_PRACTITIONER",
      monthlySessions: 100,
      monthlyFixedCostTwd: 30000,
    });

    expect(result.monthlyGrossRevenueTwd).toBe(360000);
    expect(result.monthlyEmployeePayoutTwd).toBe(180000);
    expect(result.bodyfixMonthlyNetProfitTwd).toBe(150000);
  });
});
