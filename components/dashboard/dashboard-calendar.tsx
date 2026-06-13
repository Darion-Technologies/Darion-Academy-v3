"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
} from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PendingAction } from "@/lib/dashboard-data";
import { createPortal } from "react-dom";

interface Props {
  heatmapDays: Date[];
  pendingActions: PendingAction[];
}

export function DashboardCalendar({ heatmapDays, pendingActions }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Build grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows: Date[][] = [];
  let days: Date[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    rows.push(days);
    days = [];
  }

  // Precompute sets for fast lookup
  const activitySet = new Set(heatmapDays.map((d) => format(new Date(d), "yyyy-MM-dd")));
  
  const deadlineMap = new Map<string, PendingAction[]>();
  pendingActions.forEach((action) => {
    if (action.dueDate) {
      const key = format(new Date(action.dueDate), "yyyy-MM-dd");
      const existing = deadlineMap.get(key) || [];
      existing.push(action);
      deadlineMap.set(key, existing);
    }
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="mb-1 flex flex-row items-center justify-between border-b pb-1.5 sm:pb-2">
        <CardTitle>Schedule</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={prevMonth} className="h-6 w-6">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[100px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={nextMonth} className="h-6 w-6">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-2 pb-2 sm:px-3 sm:pb-3 flex-1 flex flex-col">
        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2 border-b border-border pb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName) => (
            <div key={dayName} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {dayName}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col gap-1 bg-transparent">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex-1 grid grid-cols-7 gap-1">
              {row.map((date) => {
                const dateKey = format(date, "yyyy-MM-dd");
                const hasActivity = activitySet.has(dateKey);
                const dayDeadlines = deadlineMap.get(dateKey) || [];
                const isCurrentMonth = isSameMonth(date, monthStart);
                const isTodayDate = isToday(date);
                
                return (
                  <div
                    key={dateKey}
                    onMouseEnter={(e) => {
                      if (dayDeadlines.length > 0 || hasActivity) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredDate(date);
                        setHoveredCell({ x: rect.left + rect.width / 2, y: rect.top - 8 });
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredDate(null);
                      setHoveredCell(null);
                    }}
                    className={cn(
                      "relative flex flex-col items-center justify-start bg-card p-1 transition-colors min-h-[40px] sm:min-h-[48px] rounded-md border border-border/50",
                      !isCurrentMonth && "text-muted-foreground opacity-50 bg-secondary/10 border-transparent",
                      isCurrentMonth && "hover:bg-secondary/50",
                      isTodayDate && "font-bold text-primary border-primary/50"
                    )}
                  >
                    <span className="text-xs">{format(date, "d")}</span>
                    
                    {/* Indicators container */}
                    <div className="mt-auto flex flex-wrap justify-center gap-1 pb-1">
                      {hasActivity && (
                        <div className="size-1.5 bg-primary rounded-full" />
                      )}
                      {dayDeadlines.length > 0 && (
                        <div className="size-1.5 bg-destructive rounded-full" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-3 flex items-center justify-end gap-3 text-[10px] text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5">
            <div className="size-2 bg-primary rounded-full" />
            <span>Activity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 bg-destructive rounded-full" />
            <span>Deadline</span>
          </div>
        </div>
      </CardContent>

      {/* Floating Tooltip */}
      {mounted && hoveredDate && hoveredCell && createPortal(
        <div
          className="pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-full flex-col gap-1.5 border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md animate-in fade-in zoom-in-95 min-w-[160px]"
          style={{ left: hoveredCell.x, top: hoveredCell.y }}
        >
          <span className="font-semibold border-b border-border pb-1">
            {format(hoveredDate, "MMMM d, yyyy")}
          </span>
          
          {activitySet.has(format(hoveredDate, "yyyy-MM-dd")) && (
             <div className="flex items-center gap-2 text-muted-foreground">
               <div className="size-1.5 bg-primary rounded-full" />
               <span>Activity logged</span>
             </div>
          )}
          
          {(deadlineMap.get(format(hoveredDate, "yyyy-MM-dd")) || []).map((action, i) => (
            <div key={i} className="flex flex-col gap-0.5 mt-0.5">
              <div className="flex items-center gap-2">
                <div className="size-1.5 shrink-0 bg-destructive rounded-full" />
                <span className="font-medium truncate">{action.title}</span>
              </div>
              <span className="text-[10px] text-muted-foreground pl-3.5 truncate">{action.courseName}</span>
            </div>
          ))}
        </div>,
        document.body
      )}
    </Card>
  );
}
