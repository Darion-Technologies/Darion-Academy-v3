import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-2 sm:px-4 lg:px-6 bg-background font-sans pt-2 pb-4 lg:pb-0 lg:h-[calc(100vh-24px)] lg:overflow-y-auto no-scrollbar flex flex-col">
      {/* Dashboard Greeting Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4 lg:mb-6 mt-2 lg:mt-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <Skeleton className="size-10 lg:size-12 rounded-full" />
          <div>
            <Skeleton className="h-3 w-32 mb-2 lg:mb-3 rounded-full" />
            <Skeleton className="h-6 lg:h-8 w-48 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>

      {/* Highlights Row Skeleton */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-md border border-border p-3 shadow-none flex flex-col justify-between h-[88px]">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-3 w-28 rounded-full" />
              </div>
              <div className="flex items-end justify-between">
                <Skeleton className="h-6 w-12 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 mb-3 bg-card rounded-md border border-border shadow-none">
        {/* Area Chart / Heatmap Skeleton */}
        <div className="lg:col-span-2 p-3 border-b lg:border-b-0 lg:border-r border-border flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
            <div>
              <Skeleton className="h-4 w-32 mb-1.5 rounded-full" />
              <Skeleton className="h-2.5 w-48 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </div>
          <div className="h-[180px] w-full flex items-end justify-between pt-4 pb-2 px-2 gap-2">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="w-full rounded-t-md" style={{ height: `${Math.max(20, Math.random() * 100)}%` }} />
            ))}
          </div>
        </div>
        {/* Pie Chart Skeleton */}
        <div className="lg:col-span-1 p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-32 rounded-full" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[140px]">
            <Skeleton className="size-28 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-full rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Widgets Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-6">
        {/* Table Skeleton */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 p-5 shadow-sm h-[320px] flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <Skeleton className="h-5 w-48 rounded-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-1 mt-2">
            <Skeleton className="h-6 w-full rounded-md" />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
        {/* Focus Course Skeleton */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border/50 shadow-sm min-h-[220px] p-5 flex flex-col justify-end">
          <Skeleton className="h-3 w-20 mb-2 rounded-full bg-muted/50" />
          <Skeleton className="h-6 w-3/4 mb-2 rounded-full bg-muted/50" />
          <Skeleton className="h-3 w-1/2 mb-6 rounded-full bg-muted/50" />
          <div className="flex justify-between mb-2">
            <Skeleton className="h-3 w-16 rounded-full bg-muted/50" />
            <Skeleton className="h-3 w-8 rounded-full bg-muted/50" />
          </div>
          <Skeleton className="h-1.5 w-full mb-5 rounded-full bg-muted/50" />
          <Skeleton className="h-10 w-full rounded-xl bg-muted/50" />
        </div>
      </div>
    </div>
  );
}
