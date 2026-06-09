import { getTopDashboardData } from "@/lib/dashboard-data";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { ContinueStudyList } from "@/components/dashboard/continue-study-list";
import { YourProgressWidget } from "@/components/dashboard/your-progress-widget";

export async function TopRow({ userId }: { userId: string }) {
  const data = await getTopDashboardData(userId);

  return (
    <div className="grid grid-cols-1 items-stretch gap-2 sm:gap-3 xl:grid-cols-[1.05fr_1.25fr_.95fr]">
      <div className="min-h-[220px]">
        <WelcomeCard data={data} />
      </div>
      <div className="min-h-[220px]">
        <ContinueStudyList enrollments={data.enrollments} />
      </div>
      <div className="min-h-[220px]">
        <YourProgressWidget enrollments={data.enrollments} />
      </div>
    </div>
  );
}
