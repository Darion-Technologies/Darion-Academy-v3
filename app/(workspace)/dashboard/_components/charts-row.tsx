"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, Search, ChevronRight, LineChart, Grid3x3 } from "lucide-react";
import type { DashboardEnrollment } from "@/lib/dashboard-data";
import { Select } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const LazyAreaChart = dynamic(() => import("./lazy-area-chart"), { ssr: false, loading: () => <div className="w-full h-full animate-pulse bg-muted/20 rounded-md"></div> });
const LazyPieChart = dynamic(() => import("./lazy-pie-chart"), { ssr: false, loading: () => <div className="w-24 h-24 rounded-full animate-pulse bg-muted/20"></div> });

// dynamic data calculated in component

export function ChartsRow({ enrollments, heatmapDays }: { enrollments: DashboardEnrollment[], heatmapDays: Date[] }) {
  const [courseFilter, setCourseFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("30days");
  const [viewMode, setViewMode] = useState<"chart" | "heatmap">("chart");

  const today = new Date();
  const currentMonthName = today.toLocaleDateString('en-US', { month: 'long' });
  
  const daysToShow = timeFilter === "7days" ? 7 : timeFilter === "90days" ? 90 : 30;

  const areaData = [];
  let cumulative = 0;
  
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    
    const isActive = heatmapDays.some(hd => {
        const hDate = new Date(hd);
        return hDate.getDate() === d.getDate() && 
               hDate.getMonth() === d.getMonth() && 
               hDate.getFullYear() === d.getFullYear();
    });
    
    if (isActive) cumulative += 1;
    
    // Only add to areaData if we want to show it, or always add but it changes width
    areaData.push({
      day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      progress: cumulative,
      isActive
    });
  }

  // Heatmap Data Calculation
  const heatmapDaysToShow = 365;
  const heatmapData = [];
  const oldestDate = new Date(today);
  oldestDate.setDate(oldestDate.getDate() - (heatmapDaysToShow - 1));
  oldestDate.setHours(0,0,0,0);

  const startDayOfWeek = oldestDate.getDay(); // 0 = Sunday
  for (let i = 0; i < startDayOfWeek; i++) {
    heatmapData.push({ isFiller: true, id: `filler-${i}` });
  }

  for (let i = heatmapDaysToShow - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    
    const isActive = heatmapDays.some(hd => {
        const hDate = new Date(hd);
        return hDate.getDate() === d.getDate() && 
               hDate.getMonth() === d.getMonth() && 
               hDate.getFullYear() === d.getFullYear();
    });

    heatmapData.push({
      isFiller: false,
      id: `day-${i}`,
      isActive,
      fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
  }
  
  const filteredEnrollments = courseFilter === "all" ? enrollments : enrollments.filter(e => e.id === courseFilter);
  
  const totalCourses = filteredEnrollments.length;
  const totalModules = filteredEnrollments.reduce((acc, e) => acc + e.completedModules, 0);
  const totalLessons = filteredEnrollments.reduce((acc, e) => acc + e.completedLessons, 0);
  
  const totalQuizzes = filteredEnrollments.filter(e => e.quizStatus === 'passed').length;
  const totalAssignments = filteredEnrollments.filter(e => e.assignmentStatus === 'approved' || e.assignmentStatus === 'submitted').length;
  
  const pieDataRaw = [
    { name: 'Modules Done', value: totalModules, color: '#0070F3' }, // primary blue
    { name: 'Lessons Done', value: totalLessons, color: '#3b82f6' }, // light blue
    { name: 'Quizzes Passed', value: totalQuizzes, color: '#8b5cf6' }, // purple
    { name: 'Assignments', value: totalAssignments, color: '#ec4899' }, // pink
  ].filter(d => d.value > 0);

  const pieData = pieDataRaw.length > 0 ? pieDataRaw : [{ name: 'No Activity', value: 1, color: '#e2e8f0' }];
  const totalActivity = pieDataRaw.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 mb-3 bg-card rounded-xl border border-border shadow-sm animate-in fade-in duration-700 gap-0">
      {/* Progress Overview - Takes up 2 columns */}
      <div className="lg:col-span-2 p-4 border-b lg:border-b-0 lg:border-r border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
          <div>
            <h2 className="text-sm font-bold text-foreground">Progress Overview</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Your learning activity and completion trends.</p>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto shrink-0">
            <div className="flex bg-muted/50 p-0.5 rounded-lg border border-border shrink-0">
              <button 
                onClick={() => setViewMode("heatmap")}
                className={cn("p-2 sm:p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors", viewMode === "heatmap" && "bg-card text-foreground shadow-sm")}
              >
                <Grid3x3 className="size-4 sm:size-3.5" />
              </button>
              <button 
                onClick={() => setViewMode("chart")}
                className={cn("p-2 sm:p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors", viewMode === "chart" && "bg-card text-foreground shadow-sm")}
              >
                <LineChart className="size-4 sm:size-3.5" />
              </button>
            </div>
            <div className="relative shrink-0">
              <Select 
                value={courseFilter} 
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-auto max-w-[160px] h-9 sm:h-8 pl-3 pr-8 py-0 border-border rounded-lg text-foreground font-medium hover:bg-muted cursor-pointer appearance-none text-xs bg-background/50"
              >
                <option value="all">All Courses</option>
                {enrollments.map((course) => (
                  <option key={course.id} value={course.id}>{course.courseTitle}</option>
                ))}
              </Select>
              <ChevronDown className="size-3.5 sm:size-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
            
            <div className="relative shrink-0">
              <Select 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-auto h-9 sm:h-8 pl-3 pr-8 py-0 border-border rounded-lg text-foreground font-medium hover:bg-muted cursor-pointer appearance-none text-xs bg-background/50"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 3 Months</option>
              </Select>
              <ChevronDown className="size-3.5 sm:size-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="h-[180px] w-full flex items-center justify-center overflow-x-auto pt-2 pb-2">
          {viewMode === "chart" ? (
            <LazyAreaChart areaData={areaData} />
          ) : (
            <TooltipProvider>
              <div className="flex gap-1 sm:gap-2 h-full items-center w-full justify-center lg:justify-start">
                <div className="grid grid-rows-7 gap-[2px] text-[8px] sm:text-[9px] text-muted-foreground pr-1 font-medium">
                  <div className="flex items-center justify-end h-[8px] sm:h-[10px] lg:h-3">Sun</div>
                  <div className="h-[8px] sm:h-[10px] lg:h-3"></div>
                  <div className="flex items-center justify-end h-[8px] sm:h-[10px] lg:h-3">Tue</div>
                  <div className="h-[8px] sm:h-[10px] lg:h-3"></div>
                  <div className="flex items-center justify-end h-[8px] sm:h-[10px] lg:h-3">Thu</div>
                  <div className="h-[8px] sm:h-[10px] lg:h-3"></div>
                  <div className="flex items-center justify-end h-[8px] sm:h-[10px] lg:h-3">Sat</div>
                </div>
                <div className="grid grid-rows-7 grid-flow-col gap-[2px] min-w-min">
                  {heatmapData.map((day) => {
                    if (day.isFiller) {
                      return <div key={day.id} className="w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] lg:w-3 lg:h-3 rounded-[2px] bg-transparent" />;
                    }
                    return (
                      <Tooltip key={day.id}>
                        <TooltipTrigger asChild>
                          <div 
                            className={cn("w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] lg:w-3 lg:h-3 rounded-[2px] border border-border/50", day.isActive ? "bg-primary border-primary" : "bg-muted/30")}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <div className="text-xs">
                            <span className="font-semibold">{day.isActive ? "Activity" : "No activity"}</span> on {day.fullDate}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Learning Breakdown - Takes up 1 column */}
      <div className="lg:col-span-1 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <svg className="size-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <h2 className="text-xs font-bold text-foreground">Learning Breakdown</h2>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[140px]">
          <LazyPieChart pieData={pieData} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-foreground leading-none">{totalActivity}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-2 mt-2">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div className="size-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-[9px] text-muted-foreground">{item.name}: <span className="font-semibold">{item.value}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
