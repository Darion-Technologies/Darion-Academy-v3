import { Skeleton } from "@/components/ui/skeleton";
import { PlayCircle } from "lucide-react";

export default function ShortsLoading() {
  return (
    <div className="-mx-2 -mt-2 -mb-16 sm:-mx-4 sm:-mt-4 sm:-mb-16 lg:-mx-6 lg:-mt-6 lg:-mb-6 h-[calc(100dvh-40px)] lg:h-[calc(100dvh-48px)] bg-black flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-500">
      <div className="relative flex h-full w-full max-w-[450px] items-center justify-center mx-auto">
        {/* Main Video Skeleton Area */}
        <Skeleton className="absolute inset-0 h-full w-full bg-slate-900 rounded-none sm:rounded-xl my-0 sm:my-4 shadow-2xl" />
        
        {/* Play Icon Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="size-16 text-white/10" />
        </div>

        {/* Right Side Actions Skeleton */}
        <div className="absolute bottom-28 right-4 flex flex-col items-center gap-6 z-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="size-12 rounded-full bg-white/20" />
              <Skeleton className="h-3 w-8 bg-white/20" />
            </div>
          ))}
        </div>

        {/* Bottom Text Info Skeleton */}
        <div className="absolute bottom-4 left-4 right-20 flex flex-col gap-3 z-10">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded bg-blue-500/50" />
            <Skeleton className="h-5 w-32 bg-white/30" />
          </div>
          <Skeleton className="h-4 w-full bg-white/30" />
          <Skeleton className="h-4 w-3/4 bg-white/30" />
        </div>
      </div>
    </div>
  );
}
