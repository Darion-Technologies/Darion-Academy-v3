"use client";

import { ProgressAnalyticsData } from "@/lib/progress-data";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function LongTermVelocity({ data }: { data: ProgressAnalyticsData }) {
  const monthlyData = data.monthlyData || [];
  
  return (
    <div className="bg-card rounded-md border border-border p-3 flex flex-col h-[250px] shadow-none">
      <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
        <div>
          <h2 className="text-sm font-bold text-foreground">Long-Term Velocity</h2>
        </div>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: "10px",
                boxShadow: "none"
              }}
            />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(var(--card))", stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "hsl(var(--primary))", stroke: "none" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
