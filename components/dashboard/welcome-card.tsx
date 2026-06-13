import { ArrowUpRight } from "lucide-react";
import type { TopDashboardData } from "@/lib/dashboard-data";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function WelcomeCard({ data }: { data: TopDashboardData }) {
  const { user } = data;
  const firstName = user.name.split(" ")[0];

  return (
    <div className="gradient-welcome relative flex h-full flex-col justify-between overflow-hidden p-4 sm:p-5 text-foreground border border-border shadow-sm rounded-none">
      <div className="pointer-events-none absolute -right-16 -top-20 size-64 border border-border" />
      <div className="pointer-events-none absolute -bottom-24 -right-8 size-56 bg-primary/5 blur-2xl" />

      {/* Header row */}
      <div className="flex items-start justify-between relative z-10">
        <div className="bg-secondary px-2.5 py-1 text-[11px] font-semibold tracking-wide text-foreground backdrop-blur">
          {getGreetingTime()}
        </div>
        <Link
          href="/courses"
          className="border border-border bg-card p-1.5 sm:p-2 transition-colors hover:bg-secondary"
        >
          <ArrowUpRight className="size-4 text-foreground" />
        </Link>
      </div>

      <div className="relative z-10 mt-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Darion Group Internal Academy
          </div>
          <h1 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight">
            Welcome back,<br />
            {firstName}
          </h1>
        </div>
      </div>
    </div>
  );
}

function getGreetingTime(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}
