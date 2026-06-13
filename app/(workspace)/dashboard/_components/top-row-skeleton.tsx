import { Skeleton } from "@/components/ui/skeleton";

export function TopRowSkeleton() {
  return (
    <div className="grid grid-cols-1 items-stretch gap-3 xl:grid-cols-[1.05fr_1.25fr_.95fr]">
      {/* Welcome Card */}
      <div className="flex min-h-[220px] flex-col justify-between overflow-hidden border bg-card p-4 shadow">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="size-8" />
        </div>

        {/* Bottom row */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-[280px]">
            <Skeleton className="mb-2 h-3 w-48" />
            <Skeleton className="h-7 w-3/4 max-w-[200px]" />
            <Skeleton className="mt-2 h-7 w-1/2 max-w-[150px]" />
          </div>
          
          <Skeleton className="h-[76px] w-[88px] shrink-0" />
        </div>
      </div>
      
      {/* Continue Study List */}
      <div className="flex min-h-[220px] flex-col overflow-hidden border bg-card text-card-foreground shadow">
        <div className="flex flex-row items-center justify-between border-b p-6 py-4">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex flex-1 flex-col p-0">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 border-b px-3 py-2 last:border-0">
              <Skeleton className="size-8 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-1.5 w-1/2" />
              </div>
              <Skeleton className="size-7 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Progress Widget */}
      <div className="flex min-h-[220px] flex-col overflow-hidden border bg-card text-card-foreground shadow">
        <div className="flex flex-row items-center justify-between border-b p-6 py-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex flex-1 flex-col px-3 pb-3 pt-6">
          <div className="mb-2 flex items-end justify-between">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="mb-1 mt-4 h-2 w-full" />
          <div className="mt-auto pt-4">
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
