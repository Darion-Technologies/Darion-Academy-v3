"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";
import type { ProgressAnalyticsData } from "@/lib/progress-data";

export function QuickMetricsGrid({ data }: { data: ProgressAnalyticsData }) {
  const sparklineData1 = Array.from({ length: 10 }, () => ({ val: Math.random() * 10 }));
  const sparklineData2 = Array.from({ length: 10 }, () => ({ val: Math.random() * 10 }));

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Metric 1 */}
      <div className="border border-border bg-card p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="size-2 bg-blue-500 shrink-0"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Enrolled</span>
        </div>
        <div className="flex items-end justify-between mt-1">
          <span className="text-xl font-black">{data.stats.coursesEnrolled}</span>
          <div className="h-6 w-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData1}>
                <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <span className="text-[9px] text-muted-foreground mt-1">Active courses</span>
      </div>

      {/* Metric 2 */}
      <div className="border border-border bg-card p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="size-2 bg-emerald-500 shrink-0"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg Score</span>
        </div>
        <div className="flex items-end justify-between mt-1">
          <span className="text-xl font-black">{data.stats.avgScore}%</span>
          {/* Circular ring mock */}
          <div className="size-6 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 transform rotate-45"></div>
        </div>
        <span className="text-[9px] text-muted-foreground mt-1">Last 30 days</span>
      </div>

      {/* Metric 3 */}
      <div className="border border-border bg-card p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="size-2 bg-purple-500 shrink-0"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Completed</span>
        </div>
        <div className="flex items-end justify-between mt-1">
          <span className="text-xl font-black">{data.stats.lessonsCompleted}</span>
          <div className="h-6 w-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData2}>
                <Line type="monotone" dataKey="val" stroke="#a855f7" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <span className="text-[9px] text-muted-foreground mt-1">Last 30 days</span>
      </div>

      {/* Metric 4 */}
      <div className="border border-border bg-card p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="size-2 bg-orange-500 shrink-0"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Streak</span>
        </div>
        <div className="flex items-end justify-between mt-1">
          <span className="text-xl font-black">{data.stats.learningStreak}</span>
          <div className="size-6 rounded-full border-2 border-orange-500/20 border-r-orange-500 transform -rotate-45"></div>
        </div>
        <span className="text-[9px] text-muted-foreground mt-1">Consecutive days</span>
      </div>
    </div>
  );
}
