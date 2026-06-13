import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardEnrollment } from "@/lib/dashboard-data";

export function FocusCourseCard({ course }: { course: DashboardEnrollment | null }) {
  if (!course) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground border-dashed">
        <p className="text-sm font-medium">You have no active courses.</p>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link href="/courses">Browse Library</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden relative group border-0 ring-1 ring-border/50 shadow-md">
      {/* Full Background Image */}
      {course.hasThumbnail ? (
        <Image
          src={`/api/admin/courses/${course.courseId}/thumbnail`}
          alt=""
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-accent flex items-center justify-center text-accent-foreground font-bold uppercase text-6xl opacity-30">
          {course.courseTitle.slice(0, 2)}
        </div>
      )}
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />
      
      {/* Floating Focus Course Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-white/10 z-10">
        <div className="size-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white drop-shadow-md">
          Focus Course
        </span>
      </div>
      
      {/* Bottom Content Area */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-end z-10 relative">
        <div className="flex flex-col min-w-0 mb-4 mt-auto pt-8">
          <h3 className="text-sm sm:text-lg font-bold leading-tight text-white line-clamp-2 drop-shadow-md">
            {course.courseTitle}
          </h3>
          <p className="text-xs font-medium text-white/80 mt-1 truncate drop-shadow-sm">
            {course.nextPendingModuleTitle || "Continue Learning"}
          </p>
        </div>

        <div className="mt-auto">
          {/* Progress Section */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-white/70">Progress</span>
            <span className="text-[10px] font-bold text-white">
              {course.progressPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20 mb-4 border border-white/10">
            <div className="h-full bg-primary transition-all shadow-[0_0_8px_var(--primary)]" style={{ width: `${course.progressPercent}%` }} />
          </div>
          
          <Button className="w-full font-bold tracking-wide shadow-lg border-white/10 hover:brightness-110" size="sm" asChild>
            <Link href={`/courses/${course.courseSlug}`}>
              <Play className="w-4 h-4 mr-2 fill-current" />
              Resume Learning
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
