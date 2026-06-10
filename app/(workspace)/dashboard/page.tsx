import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { TopRow } from "./_components/top-row";
import { BottomRow } from "./_components/bottom-row";
import { TopRowSkeleton } from "./_components/top-row-skeleton";
import { BottomRowSkeleton } from "./_components/bottom-row-skeleton";
import { DailyShortWidget } from "./_components/daily-short-widget";

export const metadata = {
  title: "Dashboard — Darion Academy",
  description: "Track your learning progress, streaks, and upcoming assignments.",
};

export default async function LearnerDashboard() {
  const user = await requireRole("EMPLOYEE", "INTERN");

  return (
    <div className="mx-auto max-w-[1360px] space-y-2 sm:space-y-3 px-2 sm:px-0">
      {/* Top Grid Row: Hero, Study List, Progress */}
      <Suspense fallback={<TopRowSkeleton />}>
        <TopRow userId={user.id} />
      </Suspense>

      {/* Daily Short Row */}
      <Suspense fallback={<div className="h-40 rounded-lg bg-muted animate-pulse" />}>
        <DailyShortWidget userId={user.id} />
      </Suspense>

      {/* Bottom Grid Row: Heatmap, To Do List */}
      <Suspense fallback={<BottomRowSkeleton />}>
        <BottomRow userId={user.id} />
      </Suspense>
    </div>
  );
}

