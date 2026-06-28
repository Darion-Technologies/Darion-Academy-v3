import { requireUser } from "@/lib/auth";
import { getProgressData } from "@/lib/progress-data";
import { EfficiencyMetrics } from "./_components/efficiency-metrics";
import { CourseXRay } from "./_components/course-xray";
import { CompetencyMatrix } from "./_components/competency-matrix";
import { LongTermVelocity } from "./_components/long-term-velocity";

export const metadata = {
  title: "Learning Analytics - Darion Academy",
  description: "Deep dive analytics and long-term tracking for your learning journey.",
};

export default async function ProgressPage() {
  const user = await requireUser();
  const data = await getProgressData(user.id);

  return (
    <div className="container-responsive bg-background font-sans pt-2 pb-4 flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold text-foreground">Learning Analytics</h2>
      </div>

      {/* Top Level KPIs */}
      <EfficiencyMetrics data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start lg:h-[calc(100vh-180px)] lg:min-h-[600px]">
        {/* Left Pane: Detailed skill breakdown and course internal structure */}
        <div className="lg:col-span-8 flex flex-col gap-3 h-full">
          <div className="flex-1 min-h-0">
            <CourseXRay data={data} />
          </div>
        </div>

        {/* Right Pane: Long term progress & Skills Matrix */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full">
          <div className="flex-none">
            <LongTermVelocity data={data} />
          </div>
          <div className="flex-1 min-h-0">
            <CompetencyMatrix data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
