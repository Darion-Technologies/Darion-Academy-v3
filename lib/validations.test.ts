import { describe, expect, it } from "vitest";
import { loginSchema, loginWithEmployeeIdSchema } from "./validations";

describe("login validation", () => {
  it("normalizes email credentials", () => {
    expect(loginSchema.parse({
      email: "  USER@Darion.in ",
      password: "password123",
    }).email).toBe("user@darion.in");
  });

  it("normalizes Employee IDs", () => {
    expect(loginWithEmployeeIdSchema.parse({
      employeeId: " drn-001 ",
      password: "password123",
    }).employeeId).toBe("DRN-001");
  });

  it("rejects short passwords", () => {
    expect(loginSchema.safeParse({ email: "user@darion.in", password: "short" }).success).toBe(false);
  });
});
