import { User } from "lucide-react";
import { initials } from "@/lib/utils";
import type { ProgressAnalyticsData } from "@/lib/progress-data";

export function ProfileCard({ user, data }: { user: any, data: ProgressAnalyticsData }) {
  // Mock recent activities for the timeline
  const activities = [
    { time: "Today, 11:11 am", title: "Completed: Frontend Fundamentals", type: "Lesson", status: "Done" },
    { time: "Yesterday, 10:12 am", title: "Started: React Masterclass", type: "Course", status: "In Progress" },
    { time: "Oct 24, 10:00 am", title: "Passed: JS Quiz", type: "Quiz", status: "Score: 92%" },
    { time: "Oct 22, 09:43 am", title: "Completed: CSS Grid Layout", type: "Lesson", status: "Done" },
    { time: "Oct 20, 06:15 am", title: "Earned Certificate: HTML Basics", type: "Award", status: "Issued" },
  ];

  return (
    <div className="border border-border bg-card p-4 flex flex-col items-center">
      <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-xl font-bold text-primary mb-3">
        <span className="absolute inset-0 flex items-center justify-center">{initials(user.name)}</span>
        {user.avatarUrl && <img src={user.avatarUrl} alt="" className="relative z-10 size-full object-cover" />}
      </div>
      <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
      <p className="text-xs text-muted-foreground mb-4">{user.email}</p>

      <div className="flex items-center gap-4 text-xs font-semibold w-full justify-center pb-4 border-b border-border">
        <span className="text-muted-foreground flex items-center gap-1">
          <div className="size-2 rounded-full bg-yellow-500"></div> In Progress <span className="text-foreground">{data.stats.coursesEnrolled}</span>
        </span>
        <span className="text-muted-foreground">Completed <span className="text-foreground">{data.stats.lessonsCompleted}</span></span>
        <span className="text-muted-foreground">Hours <span className="text-foreground">{data.stats.totalHours}</span></span>
      </div>

      <div className="w-full mt-4 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-semibold uppercase">Last Activity</span>
        <span className="text-[10px] text-primary font-semibold uppercase bg-primary/10 px-2 py-0.5 rounded-sm">Syncing</span>
      </div>

      <div className="w-full mt-3 flex flex-col gap-2">
        {activities.map((act, i) => (
          <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-12 shrink-0 truncate" title={act.time}>{act.time.split(',')[0]}</span>
              <span className="font-medium text-foreground truncate max-w-[120px]" title={act.title}>{act.title}</span>
            </div>
            <span className="text-[10px] text-orange-500 font-semibold bg-orange-500/10 px-1.5 py-0.5">{act.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
