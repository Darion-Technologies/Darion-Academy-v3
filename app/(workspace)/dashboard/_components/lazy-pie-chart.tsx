"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function LazyPieChart({ pieData }: { pieData: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={60}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {pieData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
