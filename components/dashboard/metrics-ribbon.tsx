import { Card } from "@/components/ui/card";
import { Award, Zap, BookOpen, Target } from "lucide-react";

interface MetricsRibbonProps {
  stats: {
    totalCourses: number;
    completedModules: number;
    totalModules: number;
    pendingAssignments: number;
    avgQuizScore: number;
    certificatesEarned: number;
    currentStreak: number;
  };
}

export function MetricsRibbon({ stats }: MetricsRibbonProps) {
  const metrics = [
    {
      label: "Learning Momentum",
      value: `${stats.currentStreak} Day${stats.currentStreak !== 1 ? 's' : ''}`,
      icon: Zap,
      color: "text-primary",
    },
    {
      label: "Average Score",
      value: `${stats.avgQuizScore}%`,
      icon: Target,
      color: "text-foreground",
    },
    {
      label: "Certificates",
      value: stats.certificatesEarned.toString(),
      icon: Award,
      color: "text-foreground",
    },
    {
      label: "Modules Done",
      value: stats.completedModules.toString(),
      icon: BookOpen,
      color: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      {metrics.map((metric, i) => (
        <Card key={i} className="flex items-center gap-3 p-3 sm:p-4 shadow-sm border border-border">
          <div className={`flex size-8 shrink-0 items-center justify-center bg-secondary rounded-md ${metric.color}`}>
            <metric.icon className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {metric.label}
            </span>
            <span className="truncate text-lg font-bold leading-tight text-foreground">
              {metric.value}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
