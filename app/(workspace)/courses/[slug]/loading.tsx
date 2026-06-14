import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CourseDetailLoading() {
  return (
    <div className="space-y-6 max-w-[900px] animate-in fade-in duration-500">
      {/* Back Link Skeleton */}
      <div>
        <div className="inline-flex items-center gap-1.5 mb-4">
          <ChevronLeft className="size-3.5 text-muted-foreground" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        {/* Header Block Skeleton */}
        <div className="overflow-hidden border bg-card">
          <Skeleton className="aspect-[16/6] min-h-44 w-full" />
          <div className="p-5">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="space-y-2 max-w-2xl">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border p-5">
            <Skeleton className="h-3 w-16 mb-2.5" />
            <Skeleton className="h-5 w-24" />
            {i === 3 && <Skeleton className="h-2 w-full mt-3 rounded-full" />}
          </div>
        ))}
      </div>

      {/* Modules Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border overflow-hidden">
            <div className="p-5 pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
            
            <div className="border-t border-border divide-y divide-[#EEF3F5]">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-3 px-5 py-3.5">
                  <Skeleton className="size-4 shrink-0 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-64 mb-2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-12 rounded-full" />
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
