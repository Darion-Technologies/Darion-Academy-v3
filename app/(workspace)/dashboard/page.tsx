import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getTopDashboardData, getHeatmapData } from "@/lib/dashboard-data";
import { DashboardGreeting } from "./_components/dashboard-greeting";
import { HighlightsRow } from "./_components/highlights-row";
import { ChartsRow } from "./_components/charts-row";
import { BottomWidgetsRow } from "./_components/bottom-widgets-row";
import { HighlightsSkeleton } from "./_components/highlights-skeleton";
import { ChartsSkeleton } from "./_components/charts-skeleton";
import { BottomRowSkeleton } from "./_components/bottom-row-skeleton";

export const metadata = {
  title: "Dashboard - Darion Academy",
  description: "Track your learning progress, streaks, and upcoming assignments.",
};

export default async function LearnerDashboard() {
  const user = await requireUser();

  return (
    <div className="container-responsive bg-background font-sans pt-2 pb-4 lg:pb-0 lg:h-[calc(100vh-24px)] lg:overflow-y-auto no-scrollbar flex flex-col gap-4">
      <DashboardGreeting 
        userName={user.name.split(' ')[0]} 
        fullName={user.name} 
        avatarUrl={user.avatarUrl} 
      />
      <Suspense fallback={<HighlightsSkeleton />}>
        <HighlightsWrapper userId={user.id} />
      </Suspense>
      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsWrapper userId={user.id} />
      </Suspense>
      <Suspense fallback={<BottomRowSkeleton />}>
        <BottomWidgetsWrapper userId={user.id} />
      </Suspense>
    </div>
  );
}

async function HighlightsWrapper({ userId }: { userId: string }) {
  const data = await getTopDashboardData(userId);
  return <HighlightsRow stats={data.stats} enrollments={data.enrollments} />;
}

async function ChartsWrapper({ userId }: { userId: string }) {
  const [data, { heatmapDays }] = await Promise.all([
    getTopDashboardData(userId),
    getHeatmapData(userId),
  ]);
  return <ChartsRow enrollments={data.enrollments} heatmapDays={heatmapDays} />;
}

async function BottomWidgetsWrapper({ userId }: { userId: string }) {
  const data = await getTopDashboardData(userId);
  return <BottomWidgetsRow pendingActions={data.pendingActions} activeCourse={data.activeCourse} />;
}
