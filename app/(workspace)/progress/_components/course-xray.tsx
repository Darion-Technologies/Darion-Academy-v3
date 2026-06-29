"use client";

import { ProgressAnalyticsData } from "@/lib/progress-data";
import { CheckCircle2, Circle, Activity } from "lucide-react";
import Link from "next/link";

export function CourseXRay({ data }: { data: ProgressAnalyticsData }) {
  const courses = data.detailedCourses;

  if (!courses || courses.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 flex flex-col items-center justify-center text-center shadow-sm h-full">
        <div className="mb-3 flex size-8 items-center justify-center rounded bg-muted">
          <Activity className="size-4 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-bold text-foreground">No Course Data</h3>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">Enroll in a course to view its X-Ray breakdown.</p>
      </div>
    );
  }

  // Get the most relevant course (in progress, or the first one)
  const activeCourse = courses.find(c => c.status === "IN_PROGRESS") || courses[0];

  return (
    <div className="bg-card rounded-xl border border-border p-4 flex flex-col h-full shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            Course X-Ray
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">
              {activeCourse.slug}
            </span>
          </h2>
        </div>
        <Link 
          href={`/courses/${activeCourse.slug}`}
          className="text-xs font-bold text-primary hover:underline"
        >
          Resume
        </Link>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2">
        <div>
          <h3 className="text-xs font-bold text-foreground mb-1">{activeCourse.title}</h3>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-1.5 bg-muted rounded-none overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${activeCourse.progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">{activeCourse.progressPercent}%</span>
          </div>

          <div className="space-y-1.5 border-l border-border ml-2 pl-3">
            {activeCourse.modules.map((module) => {
              const isCompleted = module.completed;

              return (
                <div key={module.id} className="relative flex items-center gap-2 group">
                  <div className="absolute -left-[18px] flex size-3 items-center justify-center bg-card">
                    {isCompleted ? (
                      <CheckCircle2 className="size-3 text-primary" />
                    ) : (
                      <Circle className="size-2 text-muted-foreground" />
                    )}
                  </div>
                  <div className={`text-xs ${isCompleted ? 'text-muted-foreground font-medium' : 'text-foreground font-bold'}`}>
                    Module {module.order}: {module.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
