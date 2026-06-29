"use client";

import { useMemo } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import type { CalendarData, CalendarEvent } from "@/lib/calendar-data";
import { FileQuestion, ClipboardCheck, GraduationCap, Flame } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { deletePersonalEventAction } from "@/app/actions/calendar";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface CalendarGridProps {
  currentDate: Date;
  data: CalendarData;
  viewType: "day" | "week" | "month";
  activeCalendars: string[];
}

export function CalendarGrid({ currentDate, data, viewType, activeCalendars }: CalendarGridProps) {
  const { events, heatmapDays } = data;

  const days = useMemo(() => {
    if (viewType === "day") {
      return [currentDate];
    }
    
    if (viewType === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: startDate, end: endDate });
    }

    // Default to week
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate, viewType]);

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDayEvents = (day: Date) => {
    return events.filter(e => {
      if (!isSameDay(new Date(e.date), day)) return false;
      
      // Filter by activeCalendars
      if (e.type === "assignment" || e.type === "quiz") {
        if (!activeCalendars.includes("deadlines")) return false;
      } else if (e.type === "personal") {
        if (!activeCalendars.includes("personal")) return false;
      } else if (e.type === "course_start") {
        if (!activeCalendars.includes("events")) return false;
      }
      return true;
    });
  };

  const isStreakDay = (day: Date) => {
    const dStr = format(day, "yyyy-MM-dd");
    return heatmapDays.includes(dStr);
  };

  return (
    <div className="flex-1 flex flex-col bg-card border border-border rounded-none overflow-hidden">
      {/* Header Row */}
      {viewType !== "day" && (
        <div className="hidden lg:grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-muted/20">
          <div className="py-1.5 flex items-center justify-center text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-r border-border">
            GMT +7
          </div>
          {weekDays.map(day => (
            <div key={day} className="py-1.5 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
      )}

      {/* Grid Body with Time Axis */}
      <div className="flex-1 flex overflow-y-auto no-scrollbar relative">
        
        {/* Current Time Line Indicator (Mock at 11:20 AM) */}
        {viewType !== "month" && (
          <div className="hidden lg:flex absolute left-0 right-0 top-[150px] z-20 items-center pointer-events-none">
            <div className="w-[60px] flex justify-center">
              <span className="bg-foreground text-background text-[8px] font-bold px-1.5 py-0.5 rounded-full">11.20 AM</span>
            </div>
            <div className="flex-1 h-[2px] bg-foreground/90 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-foreground" />
            </div>
          </div>
        )}

        {/* Time Axis Column */}
        {viewType !== "month" && (
          <div className="hidden lg:flex w-[60px] shrink-0 border-r border-border flex-col bg-card pt-10">
            {["8 AM", "9 AM", "10 AM", "11 AM", "12 AM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"].map(time => (
              <div key={time} className="h-[60px] flex items-start justify-center pt-2">
                <span className="text-[10px] font-bold text-muted-foreground">{time}</span>
              </div>
            ))}
          </div>
        )}

        {/* Days Grid */}
        <div className={cn(
          "flex-1 grid",
          viewType === "day" ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-7",
          viewType === "month" ? "grid-rows-[auto]" : "grid-rows-auto lg:grid-rows-1"
        )}>
          {days.map((day, i) => {
          const isToday = isSameDay(day, new Date());
          const hasStreak = isStreakDay(day);
          const dayEvents = getDayEvents(day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "p-2 border-r border-border relative flex flex-col bg-background/30",
                (viewType === "week" && i % 7 === 6) && "border-r-0",
                viewType === "month" && "min-h-[100px] border-b",
                isToday && "bg-muted/10",
                viewType === "month" && !isSameMonth(day, currentDate) && "opacity-40 bg-muted/5",
                viewType !== "month" && "bg-[linear-gradient(to_bottom,transparent_59px,rgba(0,0,0,0.05)_60px)] dark:bg-[linear-gradient(to_bottom,transparent_59px,rgba(255,255,255,0.05)_60px)] bg-[length:100%_60px]"
              )}
            >
              {/* Day Header */}
              <div className={cn(
                "flex items-center justify-between lg:justify-center gap-2 mb-3 py-2 border-b border-border/50 pb-3",
                viewType === "month" && "py-2 lg:py-0 mb-1 lg:flex-row lg:justify-between lg:border-0"
              )}>
                <span className="text-xs font-bold text-foreground lg:hidden">{format(day, "EEEE, MMMM d")}</span>
                {viewType !== "month" && <span className="text-xs font-bold text-foreground hidden lg:inline">{format(day, "EEEE")}</span>}
                <div className="flex items-center justify-center">
                  <span className={cn(
                    "text-[10px] font-bold flex items-center justify-center h-6 w-6 rounded-full",
                    viewType === "month" ? "lg:h-5 lg:w-5 lg:rounded-none" : "",
                    isToday ? "bg-foreground text-background shadow-md" : "bg-muted text-muted-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                </div>
              </div>
              {hasStreak && (
                <div className="absolute top-2 right-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Flame className="size-4 text-orange-500/80 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                      </TooltipTrigger>
                      <TooltipContent>Learning Streak Active!</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              <div className={cn("flex flex-col flex-1 px-0.5 pb-0.5", viewType === "month" && "lg:max-h-[60px] lg:overflow-hidden", viewType !== "month" && "gap-1.5 mt-2")}>
                {dayEvents.slice(0, viewType === "month" ? (typeof window !== "undefined" && window.innerWidth < 1024 ? dayEvents.length : 2) : 10).map(event => (
                  <EventBadge key={event.id} event={event} compact={viewType === "month"} />
                ))}
                <div className="hidden lg:block">
                {dayEvents.length > (viewType === "month" ? 2 : 10) && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground text-left px-1 py-0.5 mt-0.5">
                        + {dayEvents.length - 3} more
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2 rounded-none border border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                      <div className="mb-2 pb-2 border-b border-border">
                        <h4 className="text-xs font-bold uppercase tracking-wider">{format(day, "MMM d, yyyy")}</h4>
                        <p className="text-[10px] text-muted-foreground">{dayEvents.length} events</p>
                      </div>
                      <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto no-scrollbar">
                        {dayEvents.map(event => (
                          <EventBadge key={event.id} event={event} compact={false} />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
}

function EventBadge({ event, compact = false }: { event: CalendarEvent, compact?: boolean }) {
  const router = useRouter();
  let Icon = GraduationCap;
  let bgClass = "bg-[#f1f5f9]";
  let iconBgClass = "bg-white";
  let textClass = "text-[#475569]";
  let label = "Education";
  
  if (event.type === "assignment") {
    Icon = ClipboardCheck;
    label = "Roemah CRM";
    if (event.status === "completed") {
       bgClass = "bg-[#e6f4ed]"; textClass = "text-[#1c644d]"; iconBgClass = "bg-white";
    } else if (event.status === "overdue") {
       bgClass = "bg-[#fef2f2]"; textClass = "text-[#991b1b]"; iconBgClass = "bg-white";
    } else {
       bgClass = "bg-[#e4f0fa]"; textClass = "text-[#1e5b8d]"; iconBgClass = "bg-white";
    }
  } else if (event.type === "quiz") {
    Icon = FileQuestion;
    label = "Bubbee API";
    if (event.status === "completed") {
       bgClass = "bg-[#e6f4ed]"; textClass = "text-[#1c644d]"; iconBgClass = "bg-white";
    } else if (event.status === "overdue") {
       bgClass = "bg-[#fef2f2]"; textClass = "text-[#991b1b]"; iconBgClass = "bg-white";
    } else {
       bgClass = "bg-[#f0e7fa]"; textClass = "text-[#5b378c]"; iconBgClass = "bg-white";
    }
  } else if (event.type === "personal") {
    Icon = Flame;
    label = "Personal";
    bgClass = "bg-[#fff7ed]"; textClass = "text-[#9a3412]"; iconBgClass = "bg-white";
  }

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={event.link} className={cn(
              "flex items-center gap-1.5 px-1.5 py-0.5 rounded-none border border-transparent border-l-[3px] text-[10px] font-bold truncate transition-all text-foreground",
              "bg-muted/30"
            )}>
              <span className="truncate" style={{ color: textClass.replace('text-[', '').replace(']', '') }}>{event.title}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top" className="flex flex-col gap-1 rounded-none border-border">
            <p className="font-bold text-xs">{event.title}</p>
            <p className="text-[10px] text-muted-foreground">{event.courseName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={event.link} className={cn(
            "flex flex-col p-2.5 rounded-2xl transition-all hover:scale-[1.02] shadow-sm mb-2",
            bgClass
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-full shadow-sm">
                <Icon className="size-3" style={{ color: textClass.replace('text-[', '').replace(']', '') }} />
                <span className="text-[9px] font-bold tracking-wider" style={{ color: textClass.replace('text-[', '').replace(']', '') }}>{label}</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <button className="text-black/30 hover:text-black/50 transition-colors p-1 rounded-md hover:bg-black/5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                  {event.type === "personal" ? (
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 font-bold text-xs cursor-pointer"
                      onClick={async (e) => {
                        e.preventDefault();
                        const realId = event.id.replace("personal-", "");
                        await deletePersonalEventAction(realId);
                        router.refresh();
                      }}
                    >
                      <Trash2 className="size-3.5 mr-2" />
                      Delete Event
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem className="text-xs cursor-pointer">
                      View Details
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <h4 className="text-xs font-bold leading-tight mb-1" style={{ color: textClass.replace('text-[', '').replace(']', '') }}>{event.title}</h4>
            <p className="text-[10px] leading-snug line-clamp-2 opacity-70 mb-3" style={{ color: textClass.replace('text-[', '').replace(']', '') }}>
              {event.courseName} module deadline approaching.
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-1">
              <span className="text-[10px] font-semibold opacity-70" style={{ color: textClass.replace('text-[', '').replace(']', '') }}>Team</span>
              <div className="flex -space-x-1.5">
                <div className="size-5 rounded-full border border-white bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/100?img=1" alt="avatar" /></div>
                <div className="size-5 rounded-full border border-white bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/100?img=2" alt="avatar" /></div>
                <div className="size-5 rounded-full border border-white bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/100?img=3" alt="avatar" /></div>
              </div>
            </div>
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
