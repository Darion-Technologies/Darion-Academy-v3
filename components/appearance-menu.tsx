"use client";

import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useTransition } from "react";
import { updateAppearanceAction } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppearanceTheme } from "@/generated/prisma";

const options = [
  { value: "SYSTEM" as const, label: "System", icon: Laptop },
  { value: "LIGHT" as const, label: "Light", icon: Sun },
  { value: "DARK" as const, label: "Dark", icon: Moon },
];

export function AppearanceMenu({
  initialTheme,
}: {
  initialTheme: AppearanceTheme;
  sidebarCollapsed?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const [, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function chooseTheme(newTheme: AppearanceTheme) {
    // 1. Direct DOM manipulation for absolute 0ms latency
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (newTheme === "DARK") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else if (newTheme === "LIGHT") {
      root.classList.add("light");
      root.style.colorScheme = "light";
    } else if (newTheme === "SYSTEM") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(systemDark ? "dark" : "light");
      root.style.colorScheme = systemDark ? "dark" : "light";
    }

    // 2. Let next-themes and React state catch up
    setTheme(newTheme.toLowerCase());
    
    // 3. Optimistically send to server in background, completely breaking out of the event batch
    setTimeout(() => {
      startTransition(() => {
        const formData = new FormData();
        formData.set("theme", newTheme);
        updateAppearanceAction(formData).catch(console.error);
      });
    }, 10);
  }

  // Use next-themes' current theme if mounted, otherwise fallback to initialTheme to prevent hydration mismatch
  const currentThemeValue = mounted 
    ? (theme?.toUpperCase() as AppearanceTheme) || initialTheme 
    : initialTheme;
    
  const CurrentIcon = options.find((option) => option.value === currentThemeValue)?.icon ?? Laptop;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Choose appearance theme">
          <CurrentIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem key={value} onSelect={() => chooseTheme(value)}>
            <Icon className="size-4" />
            {label}
            {currentThemeValue === value && <Check className="ml-auto size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
