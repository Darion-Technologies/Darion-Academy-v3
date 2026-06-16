"use client";

import { MessageSquare, Bell } from "lucide-react";
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { useEffect, useState } from "react";

export function DashboardGreeting({ userName }: { userName: string }) {
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
        <button className="p-2.5 border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors">
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        </button>
      </div>
    </div>
  );
}
