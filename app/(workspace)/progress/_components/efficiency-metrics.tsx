"use client";

import { ProgressAnalyticsData } from "@/lib/progress-data";
import { Zap, Target, BookOpen, Clock } from "lucide-react";

export function EfficiencyMetrics({ data }: { data: ProgressAnalyticsData }) {
  const { totalHours, lessonsCompleted, avgScore } = data.stats;

  // Calculate efficiency metrics
  const lessonsPerHour = totalHours > 0 ? (lessonsCompleted / totalHours).toFixed(1) : "0";
  const scoreStatus = avgScore >= 90 ? "Excellent" : avgScore >= 80 ? "Good" : "Needs Review";

  const metrics = [
    {
      title: "Learning Velocity",
      value: lessonsPerHour,
      unit: "lessons / hr",
      subtitle: "Focus efficiency",
      icon: Zap,
    },
    {
      title: "Mastery Rate",
      value: avgScore,
      unit: "%",
      subtitle: `Status: ${scoreStatus}`,
      icon: Target,
    },
    {
      title: "Content Processed",
      value: lessonsCompleted,
      unit: "lessons",
      subtitle: "All-time completion",
      icon: BookOpen,
    },
    {
      title: "Deep Work",
      value: totalHours,
      unit: "hours",
      subtitle: "Total focus time",
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map((metric, idx) => (
        <div 
          key={idx} 
          className="bg-card rounded-xl border border-border p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-28 transition-colors hover:bg-muted/40"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <metric.icon className="size-3.5 text-muted-foreground/70" />
              {metric.title}
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-medium text-foreground tracking-tight">{metric.value}</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{metric.unit}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{metric.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
