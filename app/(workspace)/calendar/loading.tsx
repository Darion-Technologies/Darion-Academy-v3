import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronLeft, ChevronRight, Check } from "lucide-react";

export default function CalendarLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Exact Page Header Match */}
      <div className="mb-4 pb-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <Calendar className="size-5 text-primary" />
          Learning Calendar
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Track momentum & deadlines
        </p>
      </div>
      
      {/* Exact CalendarClient Layout Match */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-40px)] w-full overflow-hidden bg-background">
        
        {/* Left Sidebar Skeleton (w-[220px]) */}
        <div className="w-full lg:w-[220px] shrink-0 border-r border-border bg-background flex flex-col h-full pt-2 pr-3 lg:pr-4">
          
          {/* Mini Calendar Header static */}
          <div className="flex items-center justify-between mb-2 px-1">
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center gap-1 opacity-50">
              <div className="p-1 rounded-md"><ChevronLeft className="size-4" /></div>
              <div className="p-1 rounded-md"><ChevronRight className="size-4" /></div>
            </div>
          </div>
          
          {/* Mini Calendar Grid skeleton */}
          <div className="mb-8">
            <div className="grid grid-cols-7 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div key={i} className="text-center text-[10px] font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="flex items-center justify-center h-8 w-full">
                  <Skeleton className="size-5 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Filters Skeleton */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between px-1 mb-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">My Calendars</h4>
              </div>
              <div className="space-y-0.5 pointer-events-none opacity-80">
                <div className="flex items-center gap-2 px-1.5 py-1">
                  <div className="size-3.5 rounded-sm bg-blue-500 flex items-center justify-center"><Check className="size-2.5 text-white" strokeWidth={3} /></div>
                  <span className="text-xs font-medium text-foreground">Deadlines</span>
                </div>
                <div className="flex items-center gap-2 px-1.5 py-1">
                  <div className="size-3.5 rounded-sm bg-purple-500 flex items-center justify-center"><Check className="size-2.5 text-white" strokeWidth={3} /></div>
                  <span className="text-xs font-medium text-foreground">Events</span>
                </div>
                <div className="flex items-center gap-2 px-1.5 py-1">
                  <div className="size-3.5 rounded-sm bg-orange-500 flex items-center justify-center"><Check className="size-2.5 text-white" strokeWidth={3} /></div>
                  <span className="text-xs font-medium text-foreground">Personal</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between px-1 mb-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Course Type</h4>
              </div>
              <div className="space-y-0.5 pointer-events-none opacity-80">
                <div className="flex items-center gap-2 px-1.5 py-1">
                  <div className="size-3.5 rounded-sm bg-emerald-500 flex items-center justify-center"><Check className="size-2.5 text-white" strokeWidth={3} /></div>
                  <span className="text-xs font-medium text-foreground">Engineering</span>
                </div>
                <div className="flex items-center gap-2 px-1.5 py-1">
                  <div className="size-3.5 rounded-sm bg-pink-500 flex items-center justify-center"><Check className="size-2.5 text-white" strokeWidth={3} /></div>
                  <span className="text-xs font-medium text-foreground">Soft Skills</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Grid Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-card overflow-hidden border border-border lg:border-none lg:rounded-none rounded-lg mt-4 lg:mt-0">
          {/* Top App Tabs */}
          <div className="flex items-center border-b border-border bg-muted/30 pt-2 px-2 gap-1 overflow-x-auto no-scrollbar pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border border-b-transparent rounded-t-lg min-w-fit">
              <div className="size-4 rounded-sm bg-black flex items-center justify-center">
                 <div className="size-2 bg-white rounded-[1px]" />
              </div>
              <span className="text-xs font-bold text-foreground">Skejulio Calendar</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 opacity-60 min-w-fit">
              <div className="size-4 rounded-full border-2 border-emerald-500" />
              <span className="text-xs font-semibold text-muted-foreground">Bubbee API Gateway</span>
            </div>
          </div>

          {/* Calendar Header Skeleton */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-40 hidden sm:block" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
          
          {/* Calendar Grid Skeleton */}
          <div className="flex-1 flex flex-col bg-card overflow-hidden">
             <div className="grid grid-cols-7 border-b border-border bg-muted/30">
               {Array.from({ length: 7 }).map((_, i) => (
                 <div key={i} className="py-2 flex justify-center">
                   <Skeleton className="h-4 w-8" />
                 </div>
               ))}
             </div>
             <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-auto">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="min-h-[100px] lg:min-h-[120px] p-2 border-r border-b border-border">
                    <Skeleton className="size-6 rounded-full mb-2 opacity-50" />
                    {i % 8 === 2 && <Skeleton className="h-5 w-full rounded-sm mb-1 bg-blue-500/20 border border-blue-500/30" />}
                    {i % 11 === 4 && <Skeleton className="h-5 w-3/4 rounded-sm bg-emerald-500/20 border border-emerald-500/30" />}
                  </div>
                ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
