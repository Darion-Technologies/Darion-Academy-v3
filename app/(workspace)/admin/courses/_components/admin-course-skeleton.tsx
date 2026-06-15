import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Settings } from "lucide-react";

export function AdminCourseSkeleton() {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Tabs Skeleton */}
      <div className="mb-6 grid w-full max-w-md grid-cols-2 bg-muted p-1 rounded-md">
        <div className="flex items-center justify-center gap-2 h-8 bg-background shadow-sm rounded-sm">
          <BookOpen className="w-4 h-4 text-foreground/50" /> 
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center justify-center gap-2 h-8 opacity-50">
          <Settings className="w-4 h-4 text-foreground/50" /> 
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Curriculum Builder Skeleton */}
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((moduleIndex) => (
            <div key={moduleIndex} className="border border-border rounded-lg bg-card overflow-hidden">
              {/* Module Header */}
              <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-6 w-6 rounded-md shrink-0" />
                  <Skeleton className="h-5 w-64" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
              
              {/* Lessons */}
              <div className="p-2 space-y-2">
                {[1, 2].map((lessonIndex) => (
                  <div key={lessonIndex} className="p-3 border border-border bg-background rounded flex items-center justify-between ml-8">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-md ml-2" />
                    </div>
                  </div>
                ))}
                <div className="ml-8 mt-4 mb-2">
                  <Skeleton className="h-9 w-32 rounded-md border border-dashed" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
