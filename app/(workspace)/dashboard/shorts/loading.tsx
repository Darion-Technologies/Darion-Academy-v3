import { Skeleton } from "@/components/ui/skeleton";

export default function ShortsLoading() {
  return (
    <div className="-mx-2 -mt-2 -mb-16 sm:-mx-4 sm:-mt-4 sm:-mb-16 lg:-mx-6 lg:-mt-6 lg:-mb-6 h-[calc(100dvh-40px)] lg:h-[calc(100dvh-48px)] flex flex-col bg-background" style={{ WebkitTapHighlightColor: "transparent" }}>
      {/* Top Bar */}
      <div className="w-full z-40 p-4 border-b border-border bg-card/80 backdrop-blur-xl shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="flex gap-2 overflow-x-auto w-full scrollbar-none snap-x py-1">
             <Skeleton className="h-8 w-16" />
             <Skeleton className="h-8 w-24" />
             <Skeleton className="h-8 w-20" />
             <Skeleton className="h-8 w-32" />
             <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-9 w-24 shrink-0" />
        </div>
      </div>

      {/* Main Content Area: 3-Column Split View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Info & Discussion Panel */}
        <div className="hidden lg:flex w-[320px] xl:w-[400px] border-r border-border bg-card flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
           <div className="p-4 border-b border-border bg-card pb-0 shrink-0">
             <Skeleton className="h-10 w-full mb-4" />
           </div>
           <div className="flex-1 p-4 flex flex-col gap-4 bg-background/50">
             <div className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-none shrink-0" />
                <Skeleton className="flex-1 h-20" />
             </div>
             <div className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-none shrink-0" />
                <Skeleton className="flex-1 h-24" />
             </div>
             <div className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-none shrink-0" />
                <Skeleton className="flex-1 h-16" />
             </div>
           </div>
           <div className="p-4 border-t border-border bg-card flex gap-2 shrink-0">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10 shrink-0" />
           </div>
        </div>

        {/* Center Side: Video Feed */}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-4 md:p-6 bg-muted/20">
          <div className="w-full max-w-[400px] h-full sm:h-[90%] md:h-full sm:max-h-[850px] sm:aspect-[9/16] bg-black shadow-lg border border-border relative flex flex-col items-center justify-center">
            {/* Play Icon Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="size-16 rounded-full bg-white/10" />
            </div>

            {/* Right Side Actions Skeleton */}
            <div className="absolute bottom-28 right-4 flex flex-col items-center gap-6 z-10">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Skeleton className="size-12 rounded-none bg-white/20" />
                  <Skeleton className="h-3 w-8 bg-white/20" />
                </div>
              ))}
            </div>

            {/* Bottom Text Info Skeleton */}
            <div className="absolute bottom-4 left-4 right-20 flex flex-col gap-3 z-10">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded bg-white/30" />
                <Skeleton className="h-5 w-32 bg-white/30" />
              </div>
              <Skeleton className="h-4 w-full bg-white/30" />
              <Skeleton className="h-4 w-3/4 bg-white/30" />
            </div>
          </div>
        </div>

        {/* Right Side: Captions/Transcript Panel */}
        <div className="hidden lg:flex w-[320px] xl:w-[400px] border-l border-border bg-card flex-col h-full shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
          <div className="p-4 border-b border-border bg-card shrink-0">
             <Skeleton className="h-6 w-48 mb-2" />
             <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex-1 p-4 bg-background/50 flex flex-col gap-4">
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-[90%]" />
             <Skeleton className="h-4 w-[95%]" />
             <Skeleton className="h-4 w-[85%]" />
             <Skeleton className="h-4 w-[92%]" />
             <Skeleton className="h-4 w-[88%]" />
             <br />
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-[93%]" />
             <Skeleton className="h-4 w-[89%]" />
          </div>
        </div>

      </div>
    </div>
  );
}
