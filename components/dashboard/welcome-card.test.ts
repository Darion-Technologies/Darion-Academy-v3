import { describe, expect, it } from "vitest";
import { formatStreakLabel } from "@/components/dashboard/welcome-card";

describe("formatStreakLabel", () => {
  it("encourages a learner with no current streak", () => {
    expect(formatStreakLabel(0)).toBe("Start your learning streak today");
  });

  it("formats a one-day streak", () => {
    expect(formatStreakLabel(1)).toBe("1 day streak");
  });

  it("formats a multi-day streak", () => {
    expect(formatStreakLabel(6)).toBe("6 day streak");
  });
});
