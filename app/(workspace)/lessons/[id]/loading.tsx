import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LessonLoading() {
  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-64px)] bg-black">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar Skeleton */}
        <div className="h-14 border-b border-border bg-background flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </div>
            <div className="h-4 w-px bg-border mx-2" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>

        {/* Video Player Skeleton */}
        <div className="w-full aspect-video bg-black flex items-center justify-center border-b border-border">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full bg-slate-800" />
            <Skeleton className="h-4 w-32 bg-slate-800" />
          </div>
        </div>

        {/* Content Tabs Skeleton */}
        <div className="p-6 md:p-8 flex-1 max-w-4xl w-full mx-auto">
          <Skeleton className="h-10 w-full max-w-md mb-8" />
          <Skeleton className="h-6 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-6" />
        </div>
      </div>

      {/* Right Sidebar Skeleton */}
      <div className="w-full lg:w-96 border-l border-border bg-background/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="p-4 flex-1">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-32 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
