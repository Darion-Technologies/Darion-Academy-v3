"use client";

import { useRef } from "react";
import { Search, Filter, Hourglass } from "lucide-react";
import type { PendingAction, DashboardEnrollment } from "@/lib/dashboard-data";
import { format } from "date-fns";
import { FocusCourseCard } from "@/components/dashboard/focus-course-card";
import { useRouter } from "next/navigation";

export function BottomWidgetsRow({ pendingActions, activeCourse }: { pendingActions: PendingAction[], activeCourse: DashboardEnrollment | null }) {
  const router = useRouter();
  const getStatusColor = (status: string) => {
    if (status === "Waiting for approval" || status === "In Progress") return "text-blue-500";
    if (status === "Retake needed" || status === "Rework needed") return "text-red-500";
    return "text-slate-500";
  };

  const getTypeDotColor = (type: string) => {
    if (type === "assignment") return "bg-blue-500";
    if (type === "quiz") return "bg-purple-500";
    return "bg-slate-500";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 pb-4">
      {/* Upcoming Deadlines - Takes up 2 columns */}
      <div className="lg:col-span-2 bg-card rounded-xl border border-border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3 sm:gap-2">
          <div 
            className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors group"
            onClick={() => router.push('/calendar')}
          >
            <Hourglass className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <h2 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Upcoming Deadlines & Actions</h2>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button className="p-2 sm:p-1.5 border border-border rounded-lg hover:bg-muted transition-colors">
              <Search className="size-4 sm:size-3.5 text-muted-foreground" />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-medium text-foreground bg-background/50 border border-border rounded-lg hover:bg-muted transition-colors">
              <Filter className="size-4 sm:size-3.5" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="text-[10px] text-muted-foreground bg-muted/50 rounded-lg">
              <tr>
                <th className="px-3 py-2 font-medium rounded-l-lg">Course / Task</th>
                <th className="px-3 py-2 font-medium">Due Date</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium rounded-r-lg">Priority</th>
              </tr>
            </thead>
            <tbody>
              {pendingActions.slice(0, 5).map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => router.push(`/courses/${item.courseSlug}`)}
                  className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <td className="px-3 py-3 sm:py-2.5 font-medium text-foreground flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className={`size-1.5 shrink-0 rounded-full ${getTypeDotColor(item.type)}`}></div>
                      <span className="font-bold text-[13px] leading-tight truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px] xl:max-w-[300px]">{item.title}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground pl-3.5 mt-0.5 leading-tight truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px] xl:max-w-[300px]">{item.courseName}</span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{item.dueDate ? format(new Date(item.dueDate), "MMM d, yy") : "-"}</td>
                  <td className="px-3 py-2.5 text-muted-foreground capitalize">{item.type}</td>
                  <td className={`px-3 py-2.5 font-medium ${getStatusColor(item.status)}`}>{item.status}</td>
                  <td className="px-3 py-2.5 text-muted-foreground capitalize">{item.priority}</td>
                </tr>
              ))}
              {pendingActions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <h3 className="text-sm font-semibold text-foreground mb-1">No actions match your filters</h3>
                    <p className="text-xs text-muted-foreground">Try adjusting your filters or check back later.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Focused Course - Takes up 1 column */}
      <div className="lg:col-span-1 bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden min-h-[220px]">
        <FocusCourseCard course={activeCourse} />
      </div>
    </div>
  );
}
