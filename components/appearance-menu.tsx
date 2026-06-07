"use client";

import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useTransition } from "react";
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
  const { setTheme } = useTheme();
  const [selected, setSelected] = useState(initialTheme);
  const [, startTransition] = useTransition();
  const CurrentIcon = options.find((option) => option.value === selected)?.icon ?? Laptop;

  function chooseTheme(theme: AppearanceTheme) {
    setSelected(theme);
    setTheme(theme.toLowerCase());
    const formData = new FormData();
    formData.set("theme", theme);
    startTransition(() => void updateAppearanceAction(formData));
  }

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
            {selected === value && <Check className="ml-auto size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
