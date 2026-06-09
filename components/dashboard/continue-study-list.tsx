import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardEnrollment } from "@/lib/dashboard-data";

export function ContinueStudyList({ enrollments }: { enrollments: DashboardEnrollment[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <CardTitle>
          Active Courses
        </CardTitle>
        <Link
          href="/courses"
          className="text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="flex flex-col">
          {enrollments.slice(0, 4).map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-2 border-b px-2 py-1.5 sm:gap-2.5 sm:px-3 sm:py-2 transition-colors last:border-0 hover:bg-muted/45"
            >
              {/* Course avatar */}
              <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-accent">
                {e.hasThumbnail ? (
                  <Image
                    src={`/api/admin/courses/${e.courseId}/thumbnail`}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs font-bold uppercase text-accent-foreground">
                    {e.courseTitle.slice(0, 2)}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="truncate text-xs font-semibold">{e.courseTitle}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {/* Progress bar */}
                  <div className="h-1.5 max-w-[110px] flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${e.progressPercent}%` }} />
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-primary">{e.progressPercent}%</span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                    {e.completedModules}/{e.totalModules} lessons
                  </span>
                </div>
              </div>

              {/* Play / open button */}
              <Link href={`/courses/${e.courseSlug}`} className="shrink-0 group">
                <div className="flex size-7 items-center justify-center rounded-md bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Play className="w-2.5 h-2.5 ml-0.5 fill-current" />
                </div>
              </Link>
            </div>
          ))}

          {enrollments.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No active assignments.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
