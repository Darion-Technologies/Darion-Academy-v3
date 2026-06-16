import { requireUser } from "@/lib/auth";
import { getTopDashboardData, getHeatmapData } from "@/lib/dashboard-data";
import { DashboardGreeting } from "./_components/dashboard-greeting";
import { HighlightsRow } from "./_components/highlights-row";
import { ChartsRow } from "./_components/charts-row";
import { BottomWidgetsRow } from "./_components/bottom-widgets-row";

export const metadata = {
  title: "Dashboard - Darion Academy",
  description: "Track your learning progress, streaks, and upcoming assignments.",
};

export default async function LearnerDashboard() {
  const user = await requireUser();
  const [data, { heatmapDays }] = await Promise.all([
    getTopDashboardData(user.id),
    getHeatmapData(user.id),
  ]);

  return (
    <div className="mx-auto max-w-[1440px] px-2 sm:px-4 lg:px-6 bg-background font-sans pt-2 pb-4 lg:pb-0 lg:h-[calc(100vh-24px)] lg:overflow-hidden flex flex-col">
      <DashboardGreeting 
        userName={user.name.split(' ')[0]} 
        fullName={user.name} 
        avatarUrl={user.avatarUrl} 
      />
      <HighlightsRow stats={data.stats} enrollments={data.enrollments} />
      <ChartsRow enrollments={data.enrollments} heatmapDays={heatmapDays} />
      <BottomWidgetsRow pendingActions={data.pendingActions} activeCourse={data.activeCourse} />
    </div>
  );
}

