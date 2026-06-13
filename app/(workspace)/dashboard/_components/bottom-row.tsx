import { getTopDashboardData, getHeatmapData } from "@/lib/dashboard-data";
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar";
import { ToDoList } from "@/components/dashboard/to-do-list";
import { MiniLeaderboard } from "@/components/dashboard/mini-leaderboard";

export async function BottomRow({ userId }: { userId: string }) {
  // getTopDashboardData is cached, so this is just retrieving the already fetched data
  // from the TopRow suspense boundary (or whichever boundary triggered first)
  const [data, { heatmapDays }] = await Promise.all([
    getTopDashboardData(userId),
    getHeatmapData(userId),
  ]);

  return (
    <div className="grid grid-cols-1 items-stretch gap-1.5 sm:gap-2 lg:grid-cols-[1.4fr_1fr_1fr]">
      <div className="min-h-[220px]">
        <DashboardCalendar heatmapDays={heatmapDays} pendingActions={data.pendingActions} />
      </div>
      <div className="min-h-[220px]">
        <ToDoList actions={data.pendingActions} />
      </div>
      <div className="min-h-[220px]">
        <MiniLeaderboard />
      </div>
    </div>
  );
}
