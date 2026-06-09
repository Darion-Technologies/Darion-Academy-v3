import { getTopDashboardData, getHeatmapData } from "@/lib/dashboard-data";
import { ContributionHeatmap } from "@/components/dashboard/contribution-heatmap";
import { ToDoList } from "@/components/dashboard/to-do-list";

export async function BottomRow({ userId }: { userId: string }) {
  // getTopDashboardData is cached, so this is just retrieving the already fetched data
  // from the TopRow suspense boundary (or whichever boundary triggered first)
  const [data, { heatmapDays }] = await Promise.all([
    getTopDashboardData(userId),
    getHeatmapData(userId),
  ]);

  return (
    <div className="grid grid-cols-1 items-stretch gap-2 sm:gap-3 xl:grid-cols-[1.8fr_1fr]">
      <div className="min-h-[280px]">
        <ContributionHeatmap heatmapDays={heatmapDays} />
      </div>
      <div className="min-h-[280px]">
        <ToDoList actions={data.pendingActions} />
      </div>
    </div>
  );
}
