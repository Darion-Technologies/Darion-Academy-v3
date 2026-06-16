import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardEnrollment } from "@/lib/dashboard-data";

export function FocusCourseCard({ course }: { course: DashboardEnrollment | null }) {
  if (!course) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-6 text-center border border-border shadow-none rounded-none bg-card">
        <h3 className="text-sm font-semibold text-foreground mb-1">No active courses</h3>
        <p className="text-xs text-muted-foreground mb-4">Try exploring the library to find something new.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/courses">Browse Library</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden relative group border-none shadow-none rounded-none bg-card">
      {course.hasThumbnail ? (
        <Image
          src={`/api/admin/courses/${course.courseId}/thumbnail`}
          alt=""
          fill
          className="object-cover absolute inset-0 z-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-muted flex items-center justify-center">
          <span className="text-6xl font-bold uppercase text-muted-foreground/20">{course.courseTitle.slice(0, 2)}</span>
        </div>
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/60 to-black/10" />

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col relative z-20 justify-end pt-16">
        <div className="mt-auto flex flex-col min-w-0 mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Focus Course</span>
          </div>
          <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight">
            {course.courseTitle}
          </h3>
          <p className="text-xs text-zinc-300 line-clamp-1 mt-1.5 font-medium">
            {course.nextPendingModuleTitle || "Continue Learning"}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Progress</span>
            <span className="text-[10px] font-bold text-white">{course.progressPercent}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden bg-white/20 rounded-none mb-4">
            <div className="h-full bg-primary" style={{ width: `${course.progressPercent}%` }} />
          </div>
          
          <Button className="w-full shadow-none bg-primary text-primary-foreground hover:bg-primary/90 font-bold border-none rounded-none uppercase tracking-wider text-[11px] h-9" asChild>
            <Link href={`/courses/${course.courseSlug}`} prefetch={true}>
              <Play className="w-3.5 h-3.5 mr-2 fill-current" />
              Resume Learning
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
