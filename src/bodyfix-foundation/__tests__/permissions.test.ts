import { describe, expect, it } from "vitest";
import { canOperateService, listAllowedServices } from "../permissions";

describe("BodyFix foundation permissions", () => {
  it("keeps grooming_interest unavailable for L1 because it is interest_only", () => {
    expect(canOperateService("L1_GROOMING_TRAINEE", "grooming_interest")).toBe(false);
  });

  it("allows L4 to operate fascia chain reset", () => {
    expect(canOperateService("L4_FASCIA_LINE_PRACTITIONER", "fascia_chain_reset_60")).toBe(true);
  });

  it("allows L4 to operate selected fascia line reset", () => {
    expect(canOperateService("L4_FASCIA_LINE_PRACTITIONER", "fascia_line_selected_reset_60")).toBe(true);
  });

  it("blocks L4 from multi-line reset", () => {
    expect(canOperateService("L4_FASCIA_LINE_PRACTITIONER", "multi_line_reset_90")).toBe(false);
  });

  it("allows L5 to operate multi-line reset", () => {
    expect(canOperateService("L5_MULTI_LINE_PRACTITIONER", "multi_line_reset_90")).toBe(true);
  });

  it("blocks L5 from pelvic core reset", () => {
    expect(canOperateService("L5_MULTI_LINE_PRACTITIONER", "pelvic_core_reset_60")).toBe(false);
  });

  it("allows L6 to operate pelvic core reset", () => {
    expect(canOperateService("L6_PELVIC_CORE_PRACTITIONER", "pelvic_core_reset_60")).toBe(true);
  });

  it("blocks L6 from pelvic core advanced", () => {
    expect(canOperateService("L6_PELVIC_CORE_PRACTITIONER", "pelvic_core_advanced_120")).toBe(false);
  });

  it("allows Gavin-only level to operate pelvic core advanced", () => {
    expect(canOperateService("GAVIN_ONLY", "pelvic_core_advanced_120")).toBe(true);
  });

  it("does not list interest-only services as allowed services", () => {
    expect(listAllowedServices("L1_GROOMING_TRAINEE").includes("grooming_interest")).toBe(false);
  });
});
