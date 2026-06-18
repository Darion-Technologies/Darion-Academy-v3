import { BarChart2, TrendingUp, RefreshCcw, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardEnrollment } from "@/lib/dashboard-data";
import Link from "next/link";

export function HighlightsRow({ stats, enrollments }: { stats: any, enrollments: DashboardEnrollment[] }) {
  const lessonsCompleted = enrollments.reduce((acc, e) => acc + e.completedLessons, 0);

  return (
    <div className="mb-3 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-foreground">Highlights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Card 1 */}
        <Link href="/courses" className="bg-card rounded-md border border-border p-3 shadow-none relative overflow-hidden block transition-colors hover:bg-muted/40 group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              <svg className="size-3.5 text-muted-foreground/70 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              Courses Enrolled
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-medium text-foreground tracking-tight">{stats.totalCourses < 10 ? `0${stats.totalCourses}` : stats.totalCourses}</span>
            <div className="flex items-end gap-1 h-8">
              <div className="w-1.5 h-3 bg-primary/30 rounded-sm"></div>
              <div className="w-1.5 h-5 bg-primary/50 rounded-sm"></div>
              <div className="w-1.5 h-4 bg-primary/70 rounded-sm"></div>
              <div className="w-1.5 h-8 bg-primary rounded-sm"></div>
            </div>
          </div>
        </Link>

        {/* Card 2 */}
        <Link href="/progress" className="bg-card rounded-md border border-border p-3 shadow-none block transition-colors hover:bg-muted/40 group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              <svg className="size-3.5 text-muted-foreground/70 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              Lessons Completed
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-medium text-foreground tracking-tight">{lessonsCompleted < 10 ? `0${lessonsCompleted}` : lessonsCompleted}</span>
            <div className="w-16 h-8 text-primary">
              <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M0 30 Q 25 30, 50 15 T 100 5" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Card 3 */}
        <Link href="/progress" className="bg-card rounded-md border border-border p-3 shadow-none block transition-colors hover:bg-muted/40 group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              <svg className="size-3.5 text-muted-foreground/70 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Average Score
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline">
              <span className="text-xl font-medium text-foreground tracking-tight">{stats.avgQuizScore}</span>
              <span className="text-base font-medium text-foreground">%</span>
            </div>
            <div className="w-12 h-8 text-primary relative">
              <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                 <path d="M5 5 L 10 30 Q 20 35, 30 30 T 55 20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" fill="none"/>
                 <path d="M5 10 L 15 35 Q 25 35, 35 25 T 55 15" stroke="currentColor" strokeWidth="2" fill="none"/>
                 <circle cx="55" cy="15" r="3" fill="currentColor"/>
              </svg>
            </div>
          </div>
        </Link>

        {/* Card 4 */}
        <Link href="/leaderboard" className="bg-card rounded-md border border-border p-3 shadow-none block transition-colors hover:bg-muted/40 group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              <Flame className="size-3.5 text-muted-foreground/70 group-hover:text-primary transition-colors" />
              Learning Streak
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-medium text-foreground tracking-tight">{stats.currentStreak < 10 ? `0${stats.currentStreak}` : stats.currentStreak}</span>
              <span className="text-xs font-medium text-muted-foreground mb-0.5">Days</span>
            </div>
            <div className="flex gap-1.5 mb-1.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={cn("size-3.5 rounded-full relative flex items-center justify-center", i < Math.min(stats.currentStreak, 4) ? "bg-primary" : "border border-primary/30")}>
                  {i < Math.min(stats.currentStreak, 4) && <div className="size-1.5 bg-white rounded-full"></div>}
                </div>
              ))}
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
