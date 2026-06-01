import { describe, expect, it } from "vitest";
import { calculateRiskIndex, getZodiac, hasRedFlag, questions, type QuestionId } from "./logic";

const makeScores = (score: number) =>
  questions.reduce(
    (scores, question) => ({ ...scores, [question.id]: score }),
    {} as Record<QuestionId, number>
  );

describe("sea king radar scoring", () => {
  it("normalizes all 1 scores to zero risk", () => {
    expect(calculateRiskIndex(makeScores(1))).toBe(0);
  });

  it("normalizes all 10 scores to full risk", () => {
    expect(calculateRiskIndex(makeScores(10))).toBe(100);
  });

  it("flags high-intensity manipulation, gaslighting, or multi-line flirting", () => {
    const scores = makeScores(1);
    scores.emotional_manipulation = 8;
    expect(hasRedFlag(scores)).toBe(true);
  });

  it("derives zodiac from optional birthday input", () => {
    expect(getZodiac("1992-03-21")).toBe("牡羊座");
    expect(getZodiac("")).toBe(null);
  });
});
