import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export default async function ProgressPage() {
  const user = await requireUser();
  const enrollments = await prisma.enrollment.findMany({
    where: { learnerId: user.id },
    include: { course: { include: { modules: { include: { lessons: true } } } } },
  });

  return (
    <>
      <PageHeader
        title="Learning Progress"
        description="A complete view of your course completion and status."
      />
      <div className="space-y-4">
        {enrollments.map((e) => {
          const totalLessons = e.course.modules.flatMap((m) => m.lessons).length;
          const statusConfig = {
            ASSIGNED:          { variant: "neutral"  as const, icon: Clock,          text: "Not started yet. Begin your first module to get going." },
            IN_PROGRESS:       { variant: "info"     as const, icon: Clock,          text: "Keep going! Complete all required lessons, assignments, and quizzes." },
            AWAITING_APPROVAL: { variant: "warning"  as const, icon: AlertTriangle,  text: "All requirements complete. Awaiting mentor approval." },
            COMPLETED:         { variant: "success"  as const, icon: CheckCircle2,   text: "Course completed and approved. Well done!" },
          };
          const config = statusConfig[e.status];
          const StatusIcon = config.icon;

          return (
            <div key={e.id} className="rounded-xl border bg-card p-6 shadow-[var(--shadow-sm)]">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h2 className="font-bold text-foreground">{e.course.title}</h2>
                <Badge variant={config.variant}>
                  {e.status.replaceAll("_", " ")}
                </Badge>
              </div>

              <div className="mb-1.5 flex justify-between text-xs">
                <span className="font-medium text-muted-foreground">
                  {totalLessons} lessons · {e.course.modules.length} modules
                </span>
                <b className="text-foreground">{e.progressPercent}%</b>
              </div>
              <Progress value={e.progressPercent} />

              <div className="mt-4 flex items-center gap-2.5 rounded-lg border bg-muted/55 p-3">
                <StatusIcon
                  className={`size-4 shrink-0 ${
                    config.variant === "success" ? "text-[var(--success)]"
                    : config.variant === "warning" ? "text-[var(--warning)]"
                    : config.variant === "info"    ? "text-primary"
                    : "text-muted-foreground"
                  }`}
                />
                <p className="text-xs text-muted-foreground">{config.text}</p>
              </div>
            </div>
          );
        })}

        {enrollments.length === 0 && (
          <div className="text-center py-16 text-sm font-semibold text-muted-foreground">
            No enrolled courses yet.
          </div>
        )}
      </div>
    </>
  );
}
