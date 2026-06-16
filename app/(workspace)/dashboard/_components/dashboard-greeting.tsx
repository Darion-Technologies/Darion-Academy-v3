"use client";

import { Bell, MessageSquare } from "lucide-react";
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { PushManager } from "@/components/push-manager";
import { useEffect, useState } from "react";
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
    <div className="flex items-center justify-between py-6 mb-4">
      <div className="animate-in slide-in-from-left-4 fade-in duration-500">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
          {mounted ? greeting : "Welcome back"}, <span className="text-primary">{userName}</span>
          <span className="animate-wave text-3xl">👋</span>
        </h1>
        <p className="text-sm font-medium text-muted-foreground mt-2">
          You've completed 3 lessons today - keep up the momentum!
        </p>
      </div>
      <div className="flex items-center gap-4 hidden lg:flex">
        <div className="flex items-center gap-2">
          <PushManager />
          <Link href="/chat" className="relative p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-transparent hover:border-border rounded-xl">
            <MessageSquare className="size-5" />
            <span className="absolute top-1 right-1 flex size-2.5 items-center justify-center rounded-full bg-red-500 border-2 border-background"></span>
          </Link>
          <Link href="/notifications" className="relative p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-transparent hover:border-border rounded-xl">
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
