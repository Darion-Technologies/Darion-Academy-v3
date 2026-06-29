import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesLoading() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <Skeleton className="h-8 w-48 rounded-full mb-2" />
          <Skeleton className="h-4 w-72 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-4 mb-6 border-b border-border pb-px">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Courses Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex h-[320px] flex-col overflow-hidden border bg-card rounded-xl shadow-sm">
            <Skeleton className="h-36 w-full rounded-none" />
            <div className="flex flex-1 flex-col p-5">
              <Skeleton className="h-6 w-3/4 mb-2 rounded-full" />
              <Skeleton className="h-4 w-full mb-1 rounded-full" />
              <Skeleton className="h-4 w-2/3 mb-4 rounded-full" />
              <div className="mt-auto">
                <Skeleton className="h-2 w-full mb-2 rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="h-3 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
