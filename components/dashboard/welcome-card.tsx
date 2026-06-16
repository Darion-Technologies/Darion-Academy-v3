import { ArrowUpRight } from "lucide-react";
import type { TopDashboardData } from "@/lib/dashboard-data";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function WelcomeCard({ data }: { data: TopDashboardData }) {
  const { user } = data;
  const firstName = user.name.split(" ")[0];

  return (
    <div className="gradient-welcome relative flex h-full flex-col justify-between overflow-hidden p-3 text-foreground border border-border shadow-none rounded-none">

      {/* Header row */}
      <div className="flex items-start justify-between relative z-10">
        <div className="bg-secondary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-foreground">
          {getGreetingTime()}
        </div>
        <Link
          href="/courses"
          className="border border-border bg-card p-1 transition-colors hover:bg-secondary"
        >
          <ArrowUpRight className="size-3 text-foreground" />
        </Link>
      </div>

      <div className="relative z-10 mt-2 flex flex-col justify-between">
        <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
          Darion Group
        </div>
        <h1 className="text-sm font-bold leading-tight tracking-tight">
          Welcome, {firstName}
        </h1>
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
