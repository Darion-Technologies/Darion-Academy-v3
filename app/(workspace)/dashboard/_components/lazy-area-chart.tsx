"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export default function LazyAreaChart({ areaData }: { areaData: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={areaData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0070F3" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0070F3" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dx={-10} />
        <RechartsTooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-popover p-3 border border-border shadow-lg rounded-xl">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {format(new Date(payload[0].payload.fullDate), "MMM d, yyyy")}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#0070F3" }} />
                    <span className="text-sm font-bold text-popover-foreground">
                      {payload[0].value} Days
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Area type="monotone" dataKey="progress" stroke="#0070F3" strokeWidth={3} fillOpacity={1} fill="url(#colorProgress)" activeDot={{ r: 6, fill: '#0070F3', stroke: 'hsl(var(--background))', strokeWidth: 3 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
