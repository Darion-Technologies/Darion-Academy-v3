"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";
import type { ProgressAnalyticsData } from "@/lib/progress-data";

export function JourneyMetrics({ data }: { data: ProgressAnalyticsData }) {
  // Generate random sparkline data to match the visual
  const generateSparkline = () => Array.from({ length: 20 }, () => ({ val: Math.random() * 100 }));

  const metrics = [
    { label: "Enrolled", val: data.stats.coursesEnrolled, spark: generateSparkline() },
    { label: "Completion Rate", val: `${data.stats.avgScore}%`, spark: generateSparkline() },
    { label: "Certificates", val: data.stats.certificates, spark: generateSparkline() },
    { label: "Total Hrs", val: data.stats.totalHours, spark: generateSparkline() },
  ];

  return (
    <div className="border border-border bg-card p-4 flex flex-col gap-4">
      <h3 className="text-sm font-bold text-foreground">Journey Metrics</h3>
      
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground uppercase">{m.label}</span>
            <span className="text-lg font-black">{m.val}</span>
          </div>
        ))}
      </div>

      <div className="h-16 w-full flex items-end gap-2 overflow-hidden mt-2">
        {metrics.map((m, i) => (
          <div key={i} className="flex-1 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={m.spark}>
                <Line type="monotone" dataKey="val" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
