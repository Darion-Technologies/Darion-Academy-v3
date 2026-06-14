import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function QuizLoading() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 w-full animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="quiz-page-header">
        <div className="inline-flex items-center gap-1.5 mb-3">
          <ArrowLeft className="size-3.5 text-muted-foreground" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-3/4 mb-3" />
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6 mt-2" />
      </div>

      {/* Quiz Client Body Skeleton */}
      <div className="bg-card border border-border shadow-sm p-6 sm:p-8">
        {/* Progress Bar / Counter */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        
        {/* Question Area */}
        <div className="mb-8">
          <Skeleton className="h-6 w-full mb-3" />
          <Skeleton className="h-6 w-5/6" />
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-3 border border-border p-4 rounded-md">
              <Skeleton className="h-4 w-4 rounded-full shrink-0" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}
