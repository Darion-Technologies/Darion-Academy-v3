"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ProgressAnalyticsData } from "@/lib/progress-data";
import { cn } from "@/lib/utils";

export function PerformanceHeatmap({ data }: { data: ProgressAnalyticsData }) {
  // data.heatmapData is last 90 days. We'll render it as a grid.
  // 90 days / 7 days a week = ~13 weeks (columns), 7 rows.
  
  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted/30 border-border";
    if (count === 1) return "bg-primary/30 border-primary/40";
    if (count === 2) return "bg-primary/60 border-primary/70";
    if (count >= 3) return "bg-primary border-primary";
    return "bg-muted border-border";
  };

  // Group into weeks
  const weeks: { date: string, count: number }[][] = [];
  let currentWeek: { date: string, count: number }[] = [];
  
  // To keep it simple, just chunk every 7 items into a column.
  data.heatmapData.forEach((day, i) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || i === data.heatmapData.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="border border-border bg-card p-4 flex flex-col h-[320px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-bold text-foreground">Learning Performance</h3>
          <p className="text-[10px] text-muted-foreground">Activity from last 90 days</p>
        </div>
        <button className="text-[10px] text-primary font-bold hover:underline">More analysis &gt;</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex gap-1.5">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day, dIdx) => (
                <Tooltip key={dIdx}>
                  <TooltipTrigger asChild>
                    <div className={cn("size-3.5 sm:size-4 border rounded-sm transition-all hover:scale-110", getIntensityClass(day.count))} />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs rounded-none border-border">
                    <p className="font-bold">{day.count} lessons</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(day.date).toDateString()}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 border-t border-border pt-4">
        <div className="flex flex-col">
          <span className="text-sm font-black text-foreground">{data.stats.lessonsCompleted} <span className="text-[10px] text-muted-foreground font-semibold">Total</span></span>
        </div>
        <div className="flex flex-col border-l border-border pl-4">
          <span className="text-sm font-black text-foreground">{data.stats.learningStreak} <span className="text-[10px] text-muted-foreground font-semibold">Day Streak</span></span>
        </div>
        <div className="flex flex-col border-l border-border pl-4">
          <span className="text-sm font-black text-foreground">{data.stats.totalHours} <span className="text-[10px] text-muted-foreground font-semibold">Hours</span></span>
        </div>
      </div>
    </div>
  );
}
