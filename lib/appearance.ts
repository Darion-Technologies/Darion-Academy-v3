import type { AppearanceTheme } from "@/generated/prisma";

export const appearanceThemes = ["SYSTEM", "LIGHT", "DARK"] as const;

export function isAppearanceTheme(value: string): value is AppearanceTheme {
  return appearanceThemes.includes(value as AppearanceTheme);
}

export function themeToClient(theme: AppearanceTheme) {
  return theme.toLowerCase() as "system" | "light" | "dark";
}

export function parseAppearancePreference(input: {
  theme?: string | null;
  sidebarCollapsed?: string | null;
}) {
  const rawTheme = input.theme?.toUpperCase() ?? null;
  if (rawTheme && !isAppearanceTheme(rawTheme)) throw new Error("Invalid appearance theme.");
  return {
    theme: rawTheme && isAppearanceTheme(rawTheme) ? rawTheme : null,
    sidebarCollapsed: input.sidebarCollapsed == null ? null : input.sidebarCollapsed === "true",
  };
}
