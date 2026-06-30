import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

export default function CourseDetailLoading() {
  return (
    <div className="space-y-4 max-w-[900px] mx-auto">
      {/* Back Link Skeleton */}
      <div>
        <div className="inline-flex items-center gap-1.5 mb-4">
          <ChevronLeft className="size-3.5 text-muted-foreground" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        {/* Header Block Skeleton (Overlay style) */}
        <div className="overflow-hidden border bg-card rounded-xl shadow-sm relative">
          <div className="relative aspect-[21/9] min-h-[160px] sm:min-h-[200px] flex items-end bg-muted/50">
            <div className="relative z-10 p-4 sm:p-5 w-full space-y-3">
              <Skeleton className="h-7 sm:h-8 w-3/4 max-w-[400px] bg-foreground/20" />
              <div className="space-y-2 max-w-3xl">
                <Skeleton className="h-3 w-full bg-foreground/20" />
                <Skeleton className="h-3 w-5/6 bg-foreground/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid gap-2 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border p-3 rounded-lg shadow-sm">
            <Skeleton className="h-2 w-16 mb-2" />
            <Skeleton className="h-4 w-20" />
            {i === 3 && <Skeleton className="h-1.5 w-full mt-2 rounded-full" />}
          </div>
        ))}
      </div>

      {/* Modules Skeleton */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border overflow-hidden rounded-xl shadow-sm">
            <div className="px-3 py-2">
              <div className="flex items-center gap-2">
                <Skeleton className="size-6 shrink-0 rounded-md" />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            </div>
            
            <div className="border-t border-border divide-y divide-[#EEF3F5]">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-2 px-3 py-2">
                  <Skeleton className="size-3.5 shrink-0 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-48 mb-1.5" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-16 rounded-full" />
                      <Skeleton className="h-4 w-12 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
