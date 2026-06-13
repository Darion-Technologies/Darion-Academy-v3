import { Skeleton } from "@/components/ui/skeleton";

export function BottomRowSkeleton() {
  return (
    <div className="grid grid-cols-1 items-stretch gap-3 xl:grid-cols-[1.8fr_1fr]">
      {/* Heatmap */}
      <div className="flex min-h-[280px] flex-col overflow-hidden border bg-card text-card-foreground shadow">
        <div className="mb-1 flex flex-row items-center justify-between border-b p-6 pb-2 pt-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 px-3 pb-2 pt-4">
          <div className="flex">
            <div className="mr-1 flex w-[28px] flex-col justify-between py-1">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-2 w-5" />
              ))}
            </div>
            <div className="flex gap-[2px] overflow-hidden">
              {[...Array(53)].map((_, i) => (
                <div key={i} className="flex flex-col gap-[2px]">
                  {[...Array(7)].map((_, j) => (
                    <Skeleton key={j} className="h-[12px] w-[12px]]" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* To Do List */}
      <div className="flex min-h-[280px] flex-col overflow-hidden border bg-card text-card-foreground shadow">
        <div className="mb-1 flex flex-row items-center justify-between border-b p-6 pb-4 pt-6">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex flex-1 flex-col px-3 pb-3 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b px-2 py-2 last:border-0">
              <Skeleton className="size-4 shrink-0 rounded" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
