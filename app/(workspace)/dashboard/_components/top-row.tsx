import { getTopDashboardData } from "@/lib/dashboard-data";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { FocusCourseCard } from "@/components/dashboard/focus-course-card";
import { YourProgressWidget } from "@/components/dashboard/your-progress-widget";

export async function TopRow({ userId }: { userId: string }) {
  const data = await getTopDashboardData(userId);

  return (
    <div className="grid grid-cols-1 items-stretch gap-1 xl:grid-cols-[1.05fr_1.25fr_.95fr]">
      <div className="min-h-[120px]">
        <WelcomeCard data={data} />
      </div>
      <div className="min-h-[120px]">
        <FocusCourseCard course={data.activeCourse} />
      </div>
      <div className="min-h-[120px]">
        <YourProgressWidget enrollments={data.enrollments} stats={data.stats} />
      </div>
    </div>
  );
}
