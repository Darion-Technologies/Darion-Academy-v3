"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { ProgressAnalyticsData } from "@/lib/progress-data";

export function ActivityBreakdown({ data }: { data: ProgressAnalyticsData }) {
  // We use the weeklyData for the bar chart
  const chartData = data.weeklyData.map(d => ({
    name: d.day,
    completed: d.completed,
    failed: Math.floor(Math.random() * 2), // mock data
  }));

  return (
    <div className="border border-border bg-card p-4 flex flex-col">
      <h3 className="text-sm font-bold text-foreground">Learning Activity</h3>
      <p className="text-[10px] text-muted-foreground mb-4">Lessons from last 7 days</p>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 0, fontSize: "12px" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar dataKey="completed" stackId="a" fill="hsl(var(--primary))" name="Completed" />
            <Bar dataKey="failed" stackId="a" fill="hsl(var(--primary)/0.2)" name="Incomplete" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown Table Mock */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 w-1/2">
            <div className="size-2 bg-primary shrink-0"></div>
            <span className="text-muted-foreground truncate">Completed</span>
          </div>
          <div className="flex items-center gap-1.5 w-1/2">
            <div className="size-2 bg-primary/20 shrink-0"></div>
            <span className="text-muted-foreground truncate">Incomplete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
