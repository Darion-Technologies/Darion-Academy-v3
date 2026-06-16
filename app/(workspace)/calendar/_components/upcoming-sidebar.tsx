import { format, isAfter, isBefore, addDays } from "date-fns";
import type { CalendarData } from "@/lib/calendar-data";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UpcomingSidebarProps {
  data: CalendarData;
}

export function UpcomingSidebar({ data }: UpcomingSidebarProps) {
  const now = new Date();
  const nextWeek = addDays(now, 7);

  const upcomingEvents = data.events
    .filter(e => e.status !== "completed")
    .filter(e => isAfter(new Date(e.date), now) || e.status === "overdue")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8); // top 8 upcoming/overdue

  if (upcomingEvents.length === 0) {
    return (
      <div className="w-[300px] shrink-0 border border-border bg-card rounded-lg p-4 flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="size-10 text-muted-foreground mb-2 opacity-50" />
        <h3 className="text-sm font-bold">All Caught Up!</h3>
        <p className="text-xs text-muted-foreground mt-1">You have no upcoming deadlines.</p>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[280px] shrink-0 border border-border bg-card rounded-none flex flex-col h-full overflow-hidden">
      <div className="p-2.5 border-b border-border bg-muted/20">
        <h3 className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
          <Clock className="size-3.5 text-muted-foreground" />
          Upcoming Deadlines
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar">
        {upcomingEvents.map(event => {
          const eDate = new Date(event.date);
          const isOverdue = event.status === "overdue";
          const isDueSoon = isBefore(eDate, nextWeek) && !isOverdue;

          return (
            <Link key={event.id} href={event.link} className="group block">
              <div className={cn(
                "p-2 rounded-none border transition-all hover:bg-muted/30",
                isOverdue ? "bg-red-500/5 border-red-500/30" : 
                isDueSoon ? "bg-orange-500/5 border-orange-500/30" : 
                "bg-background border-border"
              )}>
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <h4 className="text-[11px] font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {event.title}
                  </h4>
                  {isOverdue && <AlertCircle className="size-3 text-red-500 shrink-0" />}
                </div>
                <p className="text-[9px] text-muted-foreground truncate mb-1.5">{event.courseName}</p>
                <div className="flex items-center gap-1 mt-auto">
                  <div className={cn(
                    "text-[9px] font-bold px-1 py-0.5 rounded-none border",
                    isOverdue ? "bg-red-500/10 text-red-700 border-red-500/20" :
                    isDueSoon ? "bg-orange-500/10 text-orange-700 border-orange-500/20" :
                    "bg-muted/50 text-muted-foreground border-border"
                  )}>
                    {isOverdue ? "OVERDUE" : format(eDate, "MMM d, h:mm a").toUpperCase()}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
