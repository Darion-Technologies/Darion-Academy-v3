import { Skeleton } from "@/components/ui/skeleton";

export function HighlightsSkeleton() {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-5 w-24 rounded-sm" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-md border border-border p-3 h-[88px] flex flex-col justify-between shadow-none">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Skeleton className="size-3.5 rounded-sm" />
                <Skeleton className="h-3 w-24 rounded-sm" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <Skeleton className="h-7 w-12 rounded-sm" />
              <div className="flex items-end gap-1 h-8">
                <Skeleton className="w-1.5 h-3 rounded-sm" />
                <Skeleton className="w-1.5 h-5 rounded-sm" />
                <Skeleton className="w-1.5 h-4 rounded-sm" />
                <Skeleton className="w-1.5 h-8 rounded-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
