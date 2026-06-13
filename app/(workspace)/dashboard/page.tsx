import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { TopRow } from "./_components/top-row";
import { BottomRow } from "./_components/bottom-row";
import { MetricsRibbonContainer } from "./_components/metrics-ribbon-container";
import { TopRowSkeleton } from "./_components/top-row-skeleton";
import { BottomRowSkeleton } from "./_components/bottom-row-skeleton";

export const metadata = {
  title: "Dashboard — Darion Academy",
  description: "Track your learning progress, streaks, and upcoming assignments.",
};

export default async function LearnerDashboard() {
  const user = await requireRole("EMPLOYEE", "INTERN");

  return (
    <div className="mx-auto max-w-[1360px] space-y-1.5 sm:space-y-2 px-1 sm:px-0">
      {/* Top Grid Row: Hero, Study List, Progress */}
      <Suspense fallback={<TopRowSkeleton />}>
        <TopRow userId={user.id} />
      </Suspense>

      {/* Analytics Metrics Ribbon */}
      <Suspense fallback={<div className="h-[74px] animate-pulse bg-muted rounded-none border border-border" />}>
        <MetricsRibbonContainer userId={user.id} />
      </Suspense>

      {/* Bottom Grid Row: Heatmap, To Do List */}
      <Suspense fallback={<BottomRowSkeleton />}>
        <BottomRow userId={user.id} />
      </Suspense>

    </div>
  );
}

