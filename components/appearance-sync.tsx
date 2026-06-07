"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { themeToClient } from "@/lib/appearance";
import type { AppearanceTheme } from "@/generated/prisma";

export function AppearanceSync({ theme }: { theme: AppearanceTheme }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(themeToClient(theme));
  }, [setTheme, theme]);

  return null;
}
