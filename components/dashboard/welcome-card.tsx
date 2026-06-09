import { ArrowUpRight } from "lucide-react";
import type { TopDashboardData } from "@/lib/dashboard-data";
import Link from "next/link";
import { cn } from "@/lib/utils";


export function WelcomeCard({ data }: { data: TopDashboardData }) {
  const { user } = data;
  const firstName = user.name.split(" ")[0];
  const currentStreak = data.stats.currentStreak;
  const hasActiveStreak = currentStreak > 0;

  return (
    <div className="gradient-welcome relative flex h-full flex-col justify-between overflow-hidden rounded-xl p-3 sm:p-4 text-white shadow-[var(--shadow-md)]">
      <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -bottom-24 -right-8 size-56 rounded-full bg-primary/20 blur-2xl" />

      {/* Header row */}
      <div className="flex items-start justify-between relative z-10">
        <div className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur">
          {getGreetingTime()}
        </div>
        <Link
          href="/courses"
          className="rounded-lg border border-white/15 bg-white/5 p-1.5 sm:p-2 transition-colors hover:bg-white/12"
        >
          <ArrowUpRight className="size-4 sm:size-5 text-[#8fd9ee]" />
        </Link>
      </div>

      <div className="relative z-10 mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-[280px]">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8fd9ee]">
            Darion Group Internal Academy
          </div>
          <h1 className="text-lg sm:text-xl font-semibold leading-tight tracking-tight">
            Welcome back,<br />
            {firstName}
          </h1>
        </div>

        <div
          aria-label={formatStreakLabel(currentStreak)}
          className={cn(
            "relative w-fit shrink-0 overflow-hidden rounded-xl border px-2.5 py-1.5 sm:px-3 sm:py-2 backdrop-blur-sm",
            hasActiveStreak
              ? "border-amber-200/70 bg-gradient-to-br from-orange-500/45 via-amber-400/30 to-yellow-300/20 text-white shadow-[0_0_36px_rgba(251,146,60,0.38),inset_0_1px_0_rgba(255,255,255,0.28)]"
              : "border-white/15 bg-white/7 text-white/75",
          )}
        >
          {hasActiveStreak && (
            <>
              <div className="streak-halo pointer-events-none absolute -left-4 top-1/2 size-20 -translate-y-1/2 rounded-full bg-orange-400/55 blur-2xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            </>
          )}
          <div className="relative flex items-center gap-1">
            {hasActiveStreak && (
              <span className="text-2xl sm:text-3xl leading-none select-none">🔥</span>
            )}
            <span
              aria-hidden="true"
              className={cn(
                "text-3xl sm:text-4xl font-semibold leading-none tracking-tight",
                hasActiveStreak && "text-yellow-100 drop-shadow-[0_0_24px_rgba(255,220,50,1)]",
              )}
            >
              {currentStreak}
            </span>
          </div>
          <p
            aria-hidden="true"
            className={cn(
              "relative mt-1 sm:mt-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em]",
              hasActiveStreak && "text-amber-50",
            )}
          >
            {hasActiveStreak ? "Day streak" : "Start today"}
          </p>
        </div>
      </div>
    </div>
  );
}

export function formatStreakLabel(days: number): string {
  if (days <= 0) return "Start your learning streak today";
  return `${days} day streak`;
}

function getGreetingTime(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}
