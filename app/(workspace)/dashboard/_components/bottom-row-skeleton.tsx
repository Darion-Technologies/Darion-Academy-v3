import { Skeleton } from "@/components/ui/skeleton";

export function BottomRowSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 pb-4">
      <div className="lg:col-span-2 bg-card rounded-md border border-border p-3 shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-3.5 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-8 rounded-md" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
        </div>
        <div className="w-full">
          <div className="h-8 bg-muted/50 rounded-lg mb-2"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0">
              <Skeleton className="h-4 w-1/3 rounded-sm" />
              <Skeleton className="h-4 w-20 rounded-sm" />
              <Skeleton className="h-4 w-16 rounded-sm" />
              <Skeleton className="h-4 w-16 rounded-sm" />
              <Skeleton className="h-4 w-12 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-1 bg-card rounded-md border border-border shadow-none flex flex-col overflow-hidden min-h-[220px]">
        <div className="p-3 border-b border-border">
          <Skeleton className="h-4 w-32 rounded-sm mb-2" />
          <Skeleton className="h-3 w-48 rounded-sm" />
        </div>
        <div className="p-3 space-y-3">
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
