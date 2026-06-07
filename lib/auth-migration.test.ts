import { describe, expect, it } from "vitest";
import { identityPlan } from "./auth-migration";

describe("identity migration mapping", () => {
  it("preserves linked profiles and maps existing Auth identities by normalized email", () => {
    const plan = identityPlan(
      [
        { id: "linked", email: "admin@darion.in", active: true },
        { id: "legacy", email: "USER@darion.in", active: true },
      ],
      [
        { id: "linked", email: "admin@darion.in" },
        { id: "auth-user", email: "user@darion.in" },
      ],
    );
    expect(plan.map((item) => item.action)).toEqual(["linked", "rekey-to-existing-auth"]);
  });

  it("marks profiles without Auth identities for invitation", () => {
    expect(identityPlan(
      [{ id: "legacy", email: "new@darion.in", active: true }],
      [],
    )[0].action).toBe("invite-and-rekey");
  });
});
