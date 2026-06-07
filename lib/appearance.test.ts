import { describe, expect, it } from "vitest";
import { parseAppearancePreference, themeToClient } from "./appearance";

describe("appearance preferences", () => {
  it("uses the system theme as a valid client preference", () => {
    expect(themeToClient("SYSTEM")).toBe("system");
  });

  it("parses synchronized theme and sidebar state", () => {
    expect(parseAppearancePreference({ theme: "dark", sidebarCollapsed: "true" })).toEqual({
      theme: "DARK",
      sidebarCollapsed: true,
    });
  });

  it("supports partial updates without resetting another preference", () => {
    expect(parseAppearancePreference({ sidebarCollapsed: "false" })).toEqual({
      theme: null,
      sidebarCollapsed: false,
    });
  });

  it("rejects unknown themes", () => {
    expect(() => parseAppearancePreference({ theme: "sepia" })).toThrow("Invalid appearance theme.");
  });
});
