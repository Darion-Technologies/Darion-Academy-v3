import { Skeleton } from "@/components/ui/skeleton";

export function AdminTableSkeleton() {
  return (
    <div className="animate-in fade-in duration-500 w-full h-full">
      {/* Page Header */}
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-3" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      {/* Table Toolbar / Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Skeleton className="h-10 w-full sm:w-72" />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-24" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-border bg-card rounded-md overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-muted/50">
          <Skeleton className="h-4 w-8 mr-4" /> {/* Checkbox */}
          <Skeleton className="h-4 w-1/4 mr-4" />
          <Skeleton className="h-4 w-1/4 mr-4" />
          <Skeleton className="h-4 w-1/4 mr-4" />
          <Skeleton className="h-4 w-1/4" />
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
            <div key={row} className="flex items-center px-4 py-4 hover:bg-muted/30 transition-colors">
              <Skeleton className="h-4 w-4 rounded-sm mr-4 shrink-0" />
              
              {/* Column 1: Usually Avatar/Name */}
              <div className="flex items-center gap-3 w-1/4 mr-4 shrink-0">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex flex-col gap-1.5 w-full">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              
              {/* Column 2 */}
              <div className="w-1/4 mr-4 shrink-0">
                <Skeleton className="h-4 w-1/2" />
              </div>
              
              {/* Column 3: Usually Badge */}
              <div className="w-1/4 mr-4 shrink-0">
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>

              {/* Column 4: Actions */}
              <div className="w-1/4 flex justify-end gap-2 shrink-0">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
