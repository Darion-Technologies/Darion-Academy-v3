import { Skeleton } from "@/components/ui/skeleton";

export default function ProgressLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <Skeleton className="h-10 w-48 mb-3" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border bg-card p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-start justify-between gap-3 mb-4">
              <Skeleton className="h-6 w-64 max-w-[70%]" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            <div className="mb-1.5 flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-8" />
            </div>
            
            <Skeleton className="h-2 w-full rounded-full bg-muted overflow-hidden" />

            <div className="mt-4 flex items-center gap-2.5 border bg-muted/55 p-3">
              <Skeleton className="size-4 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-3/4 max-w-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
