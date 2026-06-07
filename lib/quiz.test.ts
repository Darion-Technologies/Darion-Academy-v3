import { describe, expect, it } from "vitest";
import { normalizeAnswer, scoreQuiz } from "./quiz";

describe("quiz scoring", () => {
  it("normalizes case and whitespace for exact-match short answers", () => {
    expect(normalizeAnswer("  Least   Privilege ")).toBe("least privilege");
  });
  it("calculates weighted percentage and pass status", () => {
    const result = scoreQuiz([
      { id: "a", correctAnswer: "True", points: 1 },
      { id: "b", correctAnswer: "Normalization", points: 3 },
    ], { a: "true", b: "wrong" }, 70);
    expect(result.score).toBe(25);
    expect(result.passed).toBe(false);
  });
});
