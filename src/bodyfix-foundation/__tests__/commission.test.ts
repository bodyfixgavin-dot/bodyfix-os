import { describe, expect, it } from "vitest";
import { assertCommissionRuleIsUsable, findCommissionRule } from "../commission";

describe("BodyFix foundation commission rules", () => {
  it("finds fascia_chain_reset_60 official customer 45 / 55 rule", () => {
    const rule = findCommissionRule({
      serviceCode: "fascia_chain_reset_60",
      customerSource: "bodyfix_official",
      staffLevelId: "L4_FASCIA_LINE_PRACTITIONER",
    });

    expect(rule?.employeeRate).toBe(0.45);
    expect(rule?.bodyfixRate).toBe(0.55);
    let thrown = false;
    try {
      assertCommissionRuleIsUsable(rule);
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(false);
  });

  it("finds fascia_line_selected_reset_60 staff-owned customer 55 / 45 rule", () => {
    const rule = findCommissionRule({
      serviceCode: "fascia_line_selected_reset_60",
      customerSource: "staff_own",
      staffLevelId: "L4_FASCIA_LINE_PRACTITIONER",
    });

    expect(rule?.employeeRate).toBe(0.55);
    expect(rule?.bodyfixRate).toBe(0.45);
  });

  it("finds multi_line_reset_90 official customer 50 / 50 rule", () => {
    const rule = findCommissionRule({
      serviceCode: "multi_line_reset_90",
      customerSource: "bodyfix_official",
      staffLevelId: "L5_MULTI_LINE_PRACTITIONER",
    });

    expect(rule?.employeeRate).toBe(0.5);
    expect(rule?.bodyfixRate).toBe(0.5);
  });

  it("finds pelvic_core_reset_60 official customer 42.5 / 57.5 rule", () => {
    const rule = findCommissionRule({
      serviceCode: "pelvic_core_reset_60",
      customerSource: "bodyfix_official",
      staffLevelId: "L6_PELVIC_CORE_PRACTITIONER",
    });

    expect(rule?.employeeRate).toBe(0.425);
    expect(rule?.bodyfixRate).toBe(0.575);
  });

  it("blocks case-by-case rules from automatic calculation", () => {
    const rule = findCommissionRule({
      serviceCode: "pelvic_core_advanced_120",
      customerSource: "bodyfix_official",
      staffLevelId: "GAVIN_ONLY",
    });

    expect(rule?.employeeRate).toBe(null);
    expect(rule?.bodyfixRate).toBe(null);
    let thrown = false;
    try {
      assertCommissionRuleIsUsable(rule);
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });
});
