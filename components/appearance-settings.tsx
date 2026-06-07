"use client";

import { Check, Laptop, Moon, PanelLeftClose, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useTransition } from "react";
import { updateAppearanceAction } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import type { AppearanceTheme } from "@/generated/prisma";
import { cn } from "@/lib/utils";

const themes = [
  { value: "SYSTEM" as const, label: "System", description: "Match this device", icon: Laptop },
  { value: "LIGHT" as const, label: "Light", description: "Bright and focused", icon: Sun },
  { value: "DARK" as const, label: "Dark", description: "Low-light workspace", icon: Moon },
];

export function AppearanceSettings({
  initialTheme,
  initialSidebarCollapsed,
}: {
  initialTheme: AppearanceTheme;
  initialSidebarCollapsed: boolean;
}) {
  const { setTheme } = useTheme();
  const [theme, setSelectedTheme] = useState(initialTheme);
  const [collapsed, setCollapsed] = useState(initialSidebarCollapsed);
  const [pending, startTransition] = useTransition();

  function save(nextTheme: AppearanceTheme, nextCollapsed: boolean) {
    setSelectedTheme(nextTheme);
    setCollapsed(nextCollapsed);
    setTheme(nextTheme.toLowerCase());
    const data = new FormData();
    data.set("theme", nextTheme);
    data.set("sidebarCollapsed", String(nextCollapsed));
    startTransition(() => void updateAppearanceAction(data));
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-sm font-medium">Color theme</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {themes.map(({ value, label, description, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => save(value, collapsed)}
              className={cn(
                "relative flex items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted/50",
                theme === value && "border-primary bg-accent/60",
              )}
            >
              <Icon className="mt-0.5 size-5 text-primary" />
              <span><span className="block text-sm font-semibold">{label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{description}</span></span>
              {theme === value && <Check className="absolute right-3 top-3 size-4 text-primary" />}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-start gap-3">
          <PanelLeftClose className="mt-0.5 size-5 text-primary" />
          <div><p className="text-sm font-semibold">Start with compact sidebar</p><p className="text-xs text-muted-foreground">Use the icon rail when you sign in on desktop.</p></div>
        </div>
        <Button type="button" variant={collapsed ? "default" : "outline"} size="sm" disabled={pending} onClick={() => save(theme, !collapsed)}>
          {collapsed ? "Compact enabled" : "Use compact sidebar"}
        </Button>
      </div>
    </div>
  );
}
