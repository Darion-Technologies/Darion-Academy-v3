"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Calendar as CalendarIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Dashboard", href: "/m/dashboard", icon: LayoutDashboard },
  { name: "Courses", href: "/m/courses", icon: BookOpen },
  { name: "Calendar", href: "/m/calendar", icon: CalendarIcon },
  { name: "Profile", href: "/m/profile", icon: User },
];

export function MobileBottomTabs() {
  const pathname = usePathname();

  // Hide on login screen
  if (pathname === "/m/login") return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <nav className="flex justify-around items-center h-[60px]">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-[3px] bg-primary rounded-b-full"></div>
              )}
              <tab.icon 
                className={cn("size-6 mb-1 transition-transform", isActive && "-translate-y-0.5")} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              <span className={cn("text-[10px] font-medium transition-all", isActive ? "opacity-100" : "opacity-80")}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
