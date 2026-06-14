import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

export default function LeaderboardLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-20 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 sm:mb-4 inline-flex items-center justify-center bg-primary/5 p-3 sm:p-4 rounded-lg">
          <Trophy className="size-6 sm:size-8 text-primary/20" />
        </div>
        <Skeleton className="h-8 sm:h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-96 max-w-[80vw]" />
      </div>

      {/* Podium Skeleton */}
      <div className="mt-12 flex flex-nowrap items-end justify-center gap-4 sm:gap-6">
        {[2, 1, 3].map((rank) => {
          const isFirst = rank === 1;
          const isSecond = rank === 2;
          
          return (
            <div
              key={rank}
              className={`flex flex-col items-center ${
                isFirst ? "z-10 scale-110" : "opacity-90"
              }`}
            >
              {/* Avatar Box Skeleton */}
              <div className="relative mb-3 sm:mb-4">
                {isFirst && (
                  <Trophy className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 size-5 sm:size-7 text-yellow-500/20" />
                )}
                <Skeleton
                  className={`${
                    isFirst
                      ? "size-14 sm:size-20"
                      : isSecond
                      ? "size-12 sm:size-16"
                      : "size-12 sm:size-16"
                  }`}
                />
                {/* Rank Badge Skeleton */}
                <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 flex size-5 sm:size-7 items-center justify-center border-2 border-background bg-muted shadow-sm">
                  <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">{rank}</span>
                </div>
              </div>

              {/* Name & Score Skeleton */}
              <div className="text-center w-full flex flex-col items-center mt-2">
                <Skeleton className="h-4 w-16 sm:w-24 mb-1" />
                <Skeleton className="h-3 w-12 sm:w-16" />
              </div>

              {/* Breakdown Stats Skeleton */}
              <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2 sm:gap-3 border border-border bg-card px-2 py-1 sm:px-3 sm:py-2 shadow-sm">
                <Skeleton className="size-3 sm:size-3.5 rounded-full" />
                <Skeleton className="size-3 sm:size-3.5 rounded-full" />
                <Skeleton className="size-3 sm:size-3.5 rounded-full" />
                <Skeleton className="size-3 sm:size-3.5 rounded-full" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Rankings List Skeleton */}
      <div className="mt-12 overflow-hidden border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/40 px-4 sm:px-6 py-2.5 sm:py-4">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3.5">
              <Skeleton className="w-6 sm:w-8 h-4" />
              <Skeleton className="size-6 sm:size-8 shrink-0" />
              
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-32" />
              </div>
              
              <div className="hidden items-center gap-6 sm:flex">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
              </div>

              <div className="text-right">
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
