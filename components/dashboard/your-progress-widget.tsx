import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardEnrollment } from "@/lib/dashboard-data";

export function YourProgressWidget({
  enrollments,
}: {
  enrollments: DashboardEnrollment[];
}) {
  const totalCourses = enrollments.length || 1;
  const avgProgress = Math.round(
    enrollments.reduce((acc, curr) => acc + curr.progressPercent, 0) / totalCourses
  );

  const theoryProgress = Math.min(avgProgress, 60);
  const practicalProgress = Math.max(0, avgProgress - 60);

  const completedTasks = enrollments.reduce((acc, curr) => acc + curr.completedModules, 0);
  const totalTasks = enrollments.reduce((acc, curr) => acc + curr.totalModules, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="mb-2 flex flex-row items-center justify-between border-b">
        <CardTitle>
          Completion
        </CardTitle>
        <div className="rounded-md border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          Year to date
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 flex flex-col flex-1">
        {/* Big percentage */}
        <div className="flex items-end justify-between mb-2">
          <div className="text-3xl font-semibold leading-none tracking-tight">
            {avgProgress}%
          </div>
          <span className="rounded-full bg-[var(--success-light)] px-2.5 py-1 text-xs font-semibold text-[var(--success)]">
            On Track
          </span>
        </div>

        {/* Segmented progress bar */}
        <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary" style={{ width: `${theoryProgress}%` }} />
          <div className="h-full bg-[var(--chart-2)]" style={{ width: `${practicalProgress}%` }} />
        </div>
        <div className="mt-2.5 flex justify-between text-xs text-muted-foreground">
          <span>Theory</span>
          <span>Practical</span>
          <span>Pending</span>
        </div>

        {/* Stats footer */}
        <div className="mt-auto pt-4">
          <div className="flex w-full items-center justify-center rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground">
            {completedTasks}/{totalTasks || 1} completed
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
