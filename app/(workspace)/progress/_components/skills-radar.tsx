"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import type { RadarDataPoint } from "@/lib/progress-data";

export function SkillsRadar({ data }: { data: RadarDataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No skills data available.
      </div>
    );
  }

  // Normalize data for the chart to always have 5 points minimum for a nice shape, 
  // or just use the data if it has enough.
  const chartData = data.length < 3 
    ? [...data, { subject: "Other", A: 0, fullMark: 1 }, { subject: "Misc", A: 0, fullMark: 1 }] 
    : data;

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: "hsl(var(--foreground))", fontSize: 10, fontWeight: 600 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 'dataMax']} 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            name="Completed Modules"
            dataKey="A"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.4}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--popover))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              fontSize: "12px"
            }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
