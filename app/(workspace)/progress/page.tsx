import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { getProgressData } from "@/lib/progress-data";
import { ProfileCard } from "./_components/profile-card";
import { ActivityBreakdown } from "./_components/activity-breakdown";
import { PerformanceHeatmap } from "./_components/performance-heatmap";
import { JourneyMetrics } from "./_components/journey-metrics";
import { FocusCampaign } from "./_components/focus-campaign";
import { QuickMetricsGrid } from "./_components/quick-metrics-grid";
import { LeaderboardWidget } from "./_components/leaderboard-widget";
import { Target } from "lucide-react";

export const metadata = {
  title: "Learning Progress - Darion Academy",
  description: "Advanced analytics and tracking for your learning journey.",
};

export default async function ProgressPage() {
  const user = await requireUser();
  const data = await getProgressData(user.id);

  return (
    <div className="flex flex-col gap-4 lg:gap-6 h-full w-full">
      {/* Top Header */}
      <div className="pb-2 border-b border-border flex items-center justify-between gap-2">
        <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <Target className="size-5 text-primary" />
          Learning Progress
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Analytics & Metrics
        </p>
      </div>

      {/* 3-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        {/* Left Column: Profile & Activity */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <ProfileCard user={user} data={data} />
          <ActivityBreakdown data={data} />
        </div>

        {/* Center Column: Heatmap & Journey */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <PerformanceHeatmap data={data} />
          <JourneyMetrics data={data} />
        </div>

        {/* Right Column: Campaign, Metrics, Leaderboard */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full">
          <FocusCampaign />
          <QuickMetricsGrid data={data} />
          <div className="flex-1">
            <LeaderboardWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
