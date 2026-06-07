import { describe, expect, it } from "vitest";
import { calculateCourseProgress } from "./progress";

describe("calculateCourseProgress", () => {
  it("weights each required lesson, assignment, and quiz equally", () => {
    expect(calculateCourseProgress({
      requiredLessonIds: ["l1", "l2"], completedLessonIds: ["l1"],
      requiredAssignmentIds: ["a1"], approvedAssignmentIds: ["a1"],
      requiredQuizIds: ["q1"], passedQuizIds: [],
    })).toBe(50);
  });
  it("does not count submitted but unapproved work", () => {
    expect(calculateCourseProgress({
      requiredLessonIds: [], completedLessonIds: [],
      requiredAssignmentIds: ["a1"], approvedAssignmentIds: [],
      requiredQuizIds: [], passedQuizIds: [],
    })).toBe(0);
  });
});
