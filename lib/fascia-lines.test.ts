import { describe, expect, it } from "vitest";
import {
  FASCIA_LINE_ENTRIES,
  FASCIA_LINE_LEAVES,
  FASCIA_LINE_LEGACY_CODE_MAP,
  resolveFasciaLineCode,
} from "./fascia-lines";

describe("fascia line taxonomy", () => {
  it("locks the seven entry-layer codes", () => {
    expect(FASCIA_LINE_ENTRIES.map((line) => line.code)).toEqual([
      "BF-FL-SBL",
      "BF-FL-SFL",
      "BF-FL-LL",
      "BF-FL-SL",
      "BF-FL-DFL",
      "BF-FLG-ARM",
      "BF-FLG-FUNC",
    ]);
  });

  it("keeps legacy codes out of name aliases", () => {
    const allAliases: string[] = FASCIA_LINE_ENTRIES.flatMap((line) => [...line.aliases]);

    expect(allAliases.includes("體側線")).toBe(true);
    expect(allAliases.includes("前深線")).toBe(true);
    expect(allAliases.includes("BF-FL-SPL")).toBe(false);
    expect(FASCIA_LINE_LEGACY_CODE_MAP["BF-FL-SPL"]).toBe("BF-FL-SL");
    expect(resolveFasciaLineCode("BF-FL-SPL")).toBe("BF-FL-SL");
  });

  it("locks the twelve leaf nodes", () => {
    expect(FASCIA_LINE_LEAVES.map((line) => line.code)).toEqual([
      "BF-FL-SBL",
      "BF-FL-SFL",
      "BF-FL-LL",
      "BF-FL-SL",
      "BF-FL-DFL",
      "BF-FL-SBAL",
      "BF-FL-DBAL",
      "BF-FL-SFAL",
      "BF-FL-DFAL",
      "BF-FL-BFL",
      "BF-FL-FFL",
      "BF-FL-IFL",
    ]);
  });
});
