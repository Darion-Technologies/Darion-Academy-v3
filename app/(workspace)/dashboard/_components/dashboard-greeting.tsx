"use client";

import { Bell, MessageSquare } from "lucide-react";
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { useEffect, useState, useRef } from "react";
import { initials } from "@/lib/utils";

export function DashboardGreeting({ userName, fullName, avatarUrl }: { userName: string, fullName?: string, avatarUrl?: string | null }) {
  const [greeting, setGreeting] = useState("Welcome back");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="flex items-center justify-between py-4 sm:py-6 mb-2 sm:mb-4">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground flex items-center flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
          <span>{mounted ? greeting : "Welcome back"},</span>
          <span className="text-primary">{userName}</span>
          <span className="animate-wave text-2xl sm:text-3xl">👋</span>
        </h1>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1.5 sm:mt-2">
          You've completed 3 lessons today - keep up the momentum!
        </p>
      </div>
      <div className="flex items-center gap-4 hidden lg:flex">
        <div className="flex items-center gap-2">
          <Link href="/chat" className="relative p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-transparent hover:border-border rounded-xl flex items-center justify-center">
            <MessageSquare className="size-5" />
            <span className="absolute top-1 right-1 flex size-2.5 items-center justify-center rounded-full bg-red-500 border-2 border-background"></span>
          </Link>
          <Link href="/notifications" className="relative p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-transparent hover:border-border rounded-xl flex items-center justify-center">
            <Bell className="size-5" />
          </Link>
        </div>
        <div className="w-80">
          <SearchBar />
        </div>
        <Link href="/settings" className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-xs font-bold text-foreground border border-border transition-colors hover:border-primary/50">
          <span className="absolute inset-0 flex items-center justify-center">{initials(fullName || userName)}</span>
          {avatarUrl && <img src={avatarUrl} alt="" width={40} height={40} className="relative z-10 size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
        </Link>
      </div>
    </div>
  );
}
