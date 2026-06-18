import { Skeleton } from "@/components/ui/skeleton";

export function ChartsSkeleton() {
  const heights = [30, 50, 40, 70, 60, 80, 50, 90, 60, 40, 60, 80, 50, 70, 90, 40, 60, 50, 80, 70, 30, 40, 60, 50, 80, 70, 40, 60, 50, 30];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 mb-3 bg-card rounded-md border border-border shadow-none h-[230px] overflow-hidden">
      <div className="lg:col-span-2 p-3 border-b lg:border-b-0 lg:border-r border-border flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
          <div>
            <Skeleton className="h-5 w-32 rounded-sm mb-1" />
            <Skeleton className="h-3 w-48 rounded-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-16 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
        </div>
        <div className="h-[180px] w-full flex items-end justify-between pt-4 pb-2 px-1 gap-[2px]">
           {heights.map((h, i) => (
             <Skeleton key={i} className="flex-1 mx-[1px] rounded-t-sm" style={{ height: `${h}%` }} />
           ))}
        </div>
      </div>
      <div className="lg:col-span-1 p-3 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-3.5 rounded-sm" />
            <Skeleton className="h-4 w-32 rounded-sm" />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[140px] pt-4">
          <Skeleton className="size-24 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-y-2 gap-x-2 mt-4">
          <div className="flex items-center gap-1.5"><Skeleton className="size-1.5 rounded-full" /><Skeleton className="h-2 w-16" /></div>
          <div className="flex items-center gap-1.5"><Skeleton className="size-1.5 rounded-full" /><Skeleton className="h-2 w-16" /></div>
          <div className="flex items-center gap-1.5"><Skeleton className="size-1.5 rounded-full" /><Skeleton className="h-2 w-16" /></div>
          <div className="flex items-center gap-1.5"><Skeleton className="size-1.5 rounded-full" /><Skeleton className="h-2 w-16" /></div>
        </div>
      </div>
    </div>
  );
}
