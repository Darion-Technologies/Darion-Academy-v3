import { describe, expect, it } from "vitest";
import {
  averageHighestQuizScores,
  certificateHtml,
  corporateTemplate,
  snapshotTemplate,
} from "./certificate";

describe("certificate templates", () => {
  it("creates an immutable approved-field snapshot", () => {
    const source = { ...corporateTemplate, title: "Achievement Award", primaryColor: "#000000" };
    const snapshot = snapshotTemplate(source);
    source.title = "Changed later";
    expect(snapshot.title).toBe("Achievement Award");
    expect(snapshot.primaryColor).toBe("#000000");
  });

  it("escapes recipient and course content in generated HTML", () => {
    const html = certificateHtml({
      recipient: '<script>alert("x")</script>',
      course: "<b>Unsafe</b>",
      completionDate: "June 6, 2026",
      issueDate: "June 6, 2026",
      issuer: "Darion",
      certificateId: "DA-TEST",
      verificationUrl: "https://example.com/verify/DA-TEST",
      template: corporateTemplate,
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;Unsafe&lt;/b&gt;");
  });
});

describe("certificate score", () => {
  it("averages the highest attempt for every required quiz", () => {
    expect(averageHighestQuizScores(["q1", "q2"], [
      { quizId: "q1", score: 50 },
      { quizId: "q1", score: 90 },
      { quizId: "q2", score: 80 },
    ])).toBe(85);
  });

  it("omits a score when a required quiz has no attempt", () => {
    expect(averageHighestQuizScores(["q1", "q2"], [{ quizId: "q1", score: 90 }])).toBeNull();
    expect(averageHighestQuizScores([], [])).toBeNull();
  });
});
