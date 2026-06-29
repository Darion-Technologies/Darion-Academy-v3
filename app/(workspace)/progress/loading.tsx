import { Skeleton } from "@/components/ui/skeleton";

export default function ProgressLoading() {
  return (
    <div className="container-responsive bg-background font-sans pt-2 pb-4 flex flex-col gap-3 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-1">
        <Skeleton className="h-5 w-32 rounded-full" />
      </div>

      {/* Efficiency Metrics Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-28">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <div className="flex items-end justify-between">
              <Skeleton className="h-8 w-16 rounded-md" />
              <Skeleton className="h-3 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start lg:h-[calc(100vh-180px)] lg:min-h-[600px]">
        {/* Left Pane: CourseXRay Skeleton */}
        <div className="lg:col-span-8 flex flex-col gap-3 h-full">
          <div className="flex-1 min-h-0 bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
              <Skeleton className="h-5 w-40 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <div className="flex flex-col gap-4 overflow-hidden">
              <Skeleton className="h-4 w-48 rounded-full mb-1" />
              <Skeleton className="h-2 w-full rounded-full mb-4" />
              <div className="space-y-4 border-l border-border ml-2 pl-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full max-w-sm rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: LongTermVelocity & CompetencyMatrix Skeleton */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full">
          {/* Velocity */}
          <div className="flex-none bg-card rounded-xl border border-border p-4 flex flex-col h-[250px] shadow-sm">
            <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
              <Skeleton className="h-5 w-32 rounded-full" />
            </div>
            <Skeleton className="flex-1 w-full mt-2 rounded-md" />
          </div>
          
          {/* Competency Matrix */}
          <div className="flex-1 min-h-0 bg-card rounded-xl border border-border p-4 flex flex-col shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
              <Skeleton className="h-5 w-36 rounded-full" />
            </div>
            <div className="flex flex-col gap-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-3 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
