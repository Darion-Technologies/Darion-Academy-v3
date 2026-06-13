"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DepartmentChart({ data }: { data: { name: string; progress: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} dy={10} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} dx={-10} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.05)' }} />
          <Bar 
            dataKey="progress" 
            fill="hsl(var(--primary))" 
            radius={[6, 6, 0, 0]} 
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="border bg-popover/80 px-4 py-3 text-popover-foreground shadow-lg backdrop-blur-md">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
}
