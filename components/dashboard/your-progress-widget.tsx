"use client"

import { RadialBar, RadialBarChart, PolarGrid, PolarRadiusAxis, Label } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import type { DashboardEnrollment, TopDashboardData } from "@/lib/dashboard-data"

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

const chartConfig = {
  completion: {
    label: "Completion",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function YourProgressWidget({
  enrollments,
  stats,
}: {
  enrollments: DashboardEnrollment[]
  stats?: TopDashboardData["stats"]
}) {
  const totalCourses = enrollments.length || 1;
  const avgProgress = Math.round(
    enrollments.reduce((acc, curr) => acc + curr.progressPercent, 0) / totalCourses
  );

  const completedTasks = enrollments.reduce((acc, curr) => acc + curr.completedModules, 0);
  const totalTasks = enrollments.reduce((acc, curr) => acc + curr.totalModules, 0);

  const chartData = [
    { name: "progress", completion: avgProgress, fill: "var(--color-completion)" },
  ]

  return (
    <Card className="h-full flex flex-col relative overflow-hidden">
      <CardHeader className="mb-2 flex flex-row items-center justify-between border-b pb-2">
        <CardTitle>Completion</CardTitle>
        <div className="border bg-muted px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground rounded-md">
          Year to date
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center pt-2 pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[80px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={90 - (360 * avgProgress) / 100}
            innerRadius={30}
            outerRadius={40}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[35, 25]}
            />
            <RadialBar dataKey="completion" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-lg font-bold"
                        >
                          {avgProgress}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 12}
                          className="fill-muted-foreground text-[8px] uppercase"
                        >
                          Done
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>

        {/* Stats footer */}
        <div className="mt-2 flex w-full flex-col gap-1">
          <div className="flex w-full items-center justify-center bg-secondary/80 px-2 py-1 text-[10px] font-semibold text-secondary-foreground rounded-none">
            {completedTasks}/{totalTasks || 1} Modules Completed
          </div>
          {stats !== undefined && (
            <div className="flex w-full items-center justify-center bg-secondary/80 px-2 py-1 text-[10px] font-semibold text-secondary-foreground rounded-none">
              {formatDuration(stats.videoPlayedSeconds || 0)} Video Played
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
