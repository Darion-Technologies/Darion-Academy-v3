import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

export default function CalendarLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="size-6 text-primary" />
          Learning Calendar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your learning momentum and manage upcoming deadlines.
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-80px)] lg:overflow-hidden pb-4">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-8 w-48" />
          </div>
          
          <div className="flex-1 flex flex-col bg-card border border-border rounded-lg overflow-hidden">
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
                    <Skeleton className="h-6 w-6 rounded-full mb-2" />
                    {i % 5 === 0 && <Skeleton className="h-4 w-full rounded-md mb-1" />}
                    {i % 7 === 3 && <Skeleton className="h-4 w-3/4 rounded-md" />}
                  </div>
                ))}
             </div>
          </div>
        </div>
        
        <div className="w-full lg:w-[300px] shrink-0 border border-border bg-card rounded-lg flex flex-col h-full">
           <div className="p-3 border-b border-border bg-muted/30">
             <Skeleton className="h-5 w-32" />
           </div>
           <div className="p-3 space-y-3">
             {Array.from({ length: 4 }).map((_, i) => (
               <Skeleton key={i} className="h-20 w-full rounded-md" />
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
