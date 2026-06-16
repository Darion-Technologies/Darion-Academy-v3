"use client";

import { useMemo } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import type { CalendarData, CalendarEvent } from "@/lib/calendar-data";
import { FileQuestion, ClipboardCheck, GraduationCap, Flame } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CalendarGridProps {
  currentDate: Date;
  data: CalendarData;
}

export function CalendarGrid({ currentDate, data }: CalendarGridProps) {
  const { events, heatmapDays } = data;

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDayEvents = (day: Date) => {
    return events.filter(e => isSameDay(new Date(e.date), day));
  };

  const isStreakDay = (day: Date) => {
    const dStr = format(day, "yyyy-MM-dd");
    return heatmapDays.includes(dStr);
  };

  return (
    <div className="flex-1 flex flex-col bg-card border border-border rounded-none overflow-hidden">
      {/* Header Row */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/20">
        {weekDays.map(day => (
          <div key={day} className="py-1.5 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-auto">
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const hasStreak = isStreakDay(day);
          const dayEvents = getDayEvents(day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[60px] lg:min-h-[75px] p-0.5 border-r border-b border-border relative transition-colors",
                !isCurrentMonth && "bg-muted/10 opacity-40",
                i % 7 === 6 && "border-r-0", // Remove right border for last col
                hasStreak && isCurrentMonth && "bg-orange-500/5 hover:bg-orange-500/10"
              )}
            >
              <div className="flex justify-between items-start mb-0.5 px-0.5">
                <span className={cn(
                  "text-[10px] font-bold flex items-center justify-center h-5 w-5 rounded-none",
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                )}>
                  {format(day, "d")}
                </span>
                {hasStreak && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Flame className="size-3 text-orange-500/80 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                      </TooltipTrigger>
                      <TooltipContent>Learning Streak Active!</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[45px] lg:max-h-[55px] no-scrollbar px-0.5 pb-0.5">
                {dayEvents.map(event => (
                  <EventBadge key={event.id} event={event} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventBadge({ event }: { event: CalendarEvent }) {
  let Icon = GraduationCap;
  let colorClass = "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  
  if (event.type === "assignment") {
    Icon = ClipboardCheck;
    if (event.status === "completed") {
       colorClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900";
    } else if (event.status === "overdue") {
       colorClass = "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900";
    } else {
       colorClass = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900";
    }
  } else if (event.type === "quiz") {
    Icon = FileQuestion;
    if (event.status === "completed") {
       colorClass = "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900";
    } else if (event.status === "overdue") {
       colorClass = "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900";
    } else {
       colorClass = "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900";
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={event.link} className={cn(
            "flex items-center gap-1 px-1 py-0.5 rounded-none border text-[9px] font-bold truncate transition-all hover:brightness-95 dark:hover:brightness-110",
            colorClass
          )}>
            <Icon className="size-2.5 shrink-0" />
            <span className="truncate">{event.title}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="top" className="flex flex-col gap-1 rounded-none border-border">
          <p className="font-bold text-xs">{event.title}</p>
          <p className="text-[10px] text-muted-foreground">{event.courseName}</p>
          <p className="text-[10px] capitalize font-bold mt-1">Status: {event.status}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
