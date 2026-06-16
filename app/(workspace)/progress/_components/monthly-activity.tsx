"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyActivityPoint } from "@/lib/progress-data";

export function MonthlyActivity({ data }: { data: MonthlyActivityPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
        No activity data available.
      </div>
    );
  }

  return (
    <div className="h-[140px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontWeight: "bold" }} 
            dy={5} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontWeight: "bold" }} 
            allowDecimals={false}
          />
          <Tooltip 
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "0",
              boxShadow: "none",
              fontSize: "10px",
              fontWeight: 700,
              padding: "4px 8px"
            }}
            itemStyle={{ color: "hsl(var(--primary))", fontSize: "10px" }}
            labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "2px", fontSize: "9px", textTransform: "uppercase" }}
          />
          <Bar 
            dataKey="completed" 
            name="Completed" 
            fill="hsl(var(--primary))" 
            radius={[0, 0, 0, 0]} 
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
