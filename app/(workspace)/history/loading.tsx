import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Calendar, Clock } from "lucide-react";

export default function HistoryLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Activity History</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Track your course progress and interactions
          </p>
        </div>
        
        {/* Filters Section (Static HTML to prevent flash) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center bg-card border border-border rounded-md p-1 shadow-sm opacity-70 pointer-events-none">
            <Filter className="h-3.5 w-3.5 text-muted-foreground ml-2 mr-1" />
            <div className="h-4 w-[1px] bg-border mx-1"></div>
            <button className="px-3 py-1.5 text-xs font-medium rounded-sm transition-colors bg-primary text-primary-foreground shadow-sm">All Content</button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-sm transition-colors bg-transparent text-muted-foreground">Courses</button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-sm transition-colors bg-transparent text-muted-foreground">Shorts</button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-sm transition-colors bg-transparent text-muted-foreground">Comments</button>
          </div>
          
          <div className="flex items-center bg-card border border-border rounded-md p-1 shadow-sm opacity-70 pointer-events-none">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground ml-2 mr-1" />
            <div className="h-4 w-[1px] bg-border mx-1"></div>
            <button className="px-3 py-1.5 text-xs font-medium rounded-sm transition-colors bg-primary text-primary-foreground shadow-sm">All Time</button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-sm transition-colors bg-transparent text-muted-foreground">Today</button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-sm transition-colors bg-transparent text-muted-foreground">7 Days</button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-sm transition-colors bg-transparent text-muted-foreground">30 Days</button>
          </div>
        </div>
      </div>

      {/* History Items List Skeleton */}
      <div className="bg-card rounded-md border border-border shadow-sm overflow-hidden">
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4"
            >
              {/* Thumbnail Skeleton */}
              <div className="flex-shrink-0 relative">
                <div className="h-14 w-24 rounded-md border border-border bg-muted/50 overflow-hidden">
                  <Skeleton className="h-full w-full rounded-none" />
                </div>
                <div className="absolute -top-2 -left-2 bg-background border border-border px-1.5 py-0.5 rounded shadow-sm">
                  <Skeleton className="h-2.5 w-10 bg-muted-foreground/30 rounded-sm" />
                </div>
              </div>

              {/* Content Column Skeleton */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-5 w-48" />
                </div>
                <Skeleton className="h-3.5 w-64 mt-1" />
              </div>
              
              {/* Meta Column Skeleton (Date) */}
              <div className="flex-shrink-0 flex items-center gap-1.5 sm:ml-auto mt-2 sm:mt-0 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
