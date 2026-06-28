"use client";

import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileHeader({ title, rightIcon }: { title: string, rightIcon?: React.ReactNode }) {
  return (
    <div 
      className="sticky top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
    >
      <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
      <div className="flex items-center gap-3">
        {rightIcon || (
          <button className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <Bell className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
