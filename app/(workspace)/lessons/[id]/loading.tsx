import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function LessonLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-sm text-blue-600">
            <ArrowLeft className="size-3.5" />
            <span>Back to course</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_.8fr]">
        {/* Main content */}
        <div className="space-y-6">
          <Skeleton className="w-full aspect-video border border-border bg-black shadow-sm rounded-none" />
          
          <Card>
            <CardContent className="pt-5 space-y-6">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Lesson status */}
          <Card>
            <CardHeader><CardTitle><Skeleton className="h-6 w-32" /></CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          {/* Lesson Notes */}
          <div className="h-[500px]">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-12" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-4 pt-4">
                <div className="flex-1 space-y-4 mt-4">
                  <Skeleton className="h-16 w-3/4" />
                  <Skeleton className="h-16 w-5/6 ml-auto" />
                  <Skeleton className="h-16 w-2/3" />
                </div>
                <div className="mt-4 pt-4 border-t border-border flex gap-2">
                  <Skeleton className="flex-1 h-10" />
                  <Skeleton className="h-10 w-10 shrink-0" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
