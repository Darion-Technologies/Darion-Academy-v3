import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getTopDashboardData } from "@/lib/dashboard-data";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { Flame, BookOpen, CheckCircle, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Dashboard",
};

export default async function MobileDashboardPage() {
  const user = await requireUser();
  const firstName = user.name.split(' ')[0];

  return (
    <div className="flex flex-col min-h-full">
      <MobileHeader title={`Hi, ${firstName} 👋`} />
      
      <div className="px-4 py-5 flex-1 space-y-6">
        <Suspense fallback={<div className="h-40 bg-muted/20 animate-pulse rounded-2xl"></div>}>
          <MobileStatsWrapper userId={user.id} />
        </Suspense>

        <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-2xl"></div>}>
          <MobileDeadlinesWrapper userId={user.id} />
        </Suspense>
      </div>
    </div>
  );
}

async function MobileStatsWrapper({ userId }: { userId: string }) {
  const data = await getTopDashboardData(userId);
  const { stats, enrollments } = data;
  const lessonsCompleted = enrollments.reduce((acc, e) => acc + e.completedLessons, 0);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-foreground tracking-tight px-1">Your Progress</h2>
      
      {/* Horizontal Swipeable Cards */}
      <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 -mx-4 px-4 snap-x">
        {/* Streak Card */}
        <div className="snap-center shrink-0 w-40 bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-orange-500/20 rounded-full">
              <Flame className="size-4 text-orange-600" />
            </div>
            <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">Streak</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-foreground">{stats.currentStreak}</span>
              <span className="text-xs font-medium text-muted-foreground">days</span>
            </div>
          </div>
        </div>

        {/* Lessons Card */}
        <div className="snap-center shrink-0 w-40 bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-full">
              <CheckCircle className="size-4 text-blue-500" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">Lessons</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-foreground">{lessonsCompleted}</span>
              <span className="text-xs font-medium text-muted-foreground">done</span>
            </div>
          </div>
        </div>

        {/* Courses Card */}
        <div className="snap-center shrink-0 w-40 bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <BookOpen className="size-4 text-primary" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">Enrolled</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-foreground">{stats.totalCourses}</span>
              <span className="text-xs font-medium text-muted-foreground">courses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function MobileDeadlinesWrapper({ userId }: { userId: string }) {
  const data = await getTopDashboardData(userId);
  const { pendingActions } = data;

  if (pendingActions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-foreground tracking-tight">Up Next</h2>
        <Link href="/m/calendar" className="text-xs font-semibold text-primary">See all</Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {pendingActions.slice(0, 4).map((item, i) => (
          <Link 
            key={item.id} 
            href={`/m/courses/${item.courseSlug}`}
            className={cn(
              "flex items-center justify-between p-4 transition-colors active:bg-muted/50",
              i !== 0 && "border-t border-border/50"
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={cn(
                "w-1.5 h-10 rounded-full shrink-0",
                item.type === "assignment" ? "bg-blue-500" : "bg-purple-500"
              )} />
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold text-foreground truncate">{item.title}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.type}</span>
                  <span className="size-1 rounded-full bg-border"></span>
                  <span className="text-[11px] font-medium text-muted-foreground truncate">{item.courseName}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 pl-2">
              {item.dueDate && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-muted-foreground font-medium">Due</span>
                  <span className="text-xs font-bold text-foreground">{format(new Date(item.dueDate), "MMM d")}</span>
                </div>
              )}
              <ChevronRight className="size-4 text-muted-foreground/50" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
