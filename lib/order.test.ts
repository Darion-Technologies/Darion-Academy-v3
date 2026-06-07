import { describe, expect, it } from "vitest";
import { resolveAvailableOrder } from "./order";

describe("resolveAvailableOrder", () => {
  it("keeps an unused requested position", () => {
    expect(resolveAvailableOrder(2, [1, 3])).toBe(2);
  });

  it("appends when the requested position is occupied", () => {
    expect(resolveAvailableOrder(1, [1, 2, 4])).toBe(5);
  });

  it("uses the requested position for an empty collection", () => {
    expect(resolveAvailableOrder(1, [])).toBe(1);
  });
});
