"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DepartmentChart({ data }: { data: { name: string; progress: number }[] }) {
  return <div className="h-72 w-full"><ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis domain={[0,100]} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="progress" fill="#1764c0" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer></div>;
}
