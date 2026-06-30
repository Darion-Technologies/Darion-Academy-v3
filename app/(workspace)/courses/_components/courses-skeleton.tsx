import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CoursesSkeleton() {
  return (
    <Tabs defaultValue="all" className="space-y-8">
      {/* Fake Tabs List */}
      <div className="flex overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        <TabsList className="h-10 w-auto justify-start pointer-events-none">
          <TabsTrigger value="all" className="px-4">
            <Skeleton className="h-4 w-16" />
          </TabsTrigger>
          <TabsTrigger value="1" className="px-4">
            <Skeleton className="h-4 w-20" />
          </TabsTrigger>
          <TabsTrigger value="2" className="px-4">
            <Skeleton className="h-4 w-24" />
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Fake Grid matching exact breakpoints */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </Tabs>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden border bg-card rounded-xl shadow-[var(--shadow-sm)]">
      {/* Course header */}
      <div className="gradient-welcome relative min-h-36 overflow-hidden px-6 py-5 bg-muted/40 text-white">
        <div className="absolute inset-0 bg-gradient-to-t from-[#10202D]/95 via-[#10202D]/55 to-[#10202D]/20" />
        <div className="relative flex h-full flex-col justify-end">
          <Skeleton className="h-6 w-3/4 mt-3 bg-white/20" />
        </div>
      </div>

      {/* Course body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="min-h-10 mb-4 space-y-2 py-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>

        <div className="flex justify-between items-center mb-4">
          <Badge variant="neutral" className="text-transparent border-transparent">
            <Skeleton className="h-3 w-12" />
          </Badge>
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 opacity-50">
            <BookOpen className="size-3" />
            <Skeleton className="h-3 w-8" />
          </span>
        </div>

        <div className="mb-1.5 flex justify-between text-xs">
          <span className="font-medium text-muted-foreground opacity-50">Progress</span>
          <Skeleton className="h-3 w-8" />
        </div>
        <Progress value={0} className="opacity-40" />

        <div className="mt-3 flex justify-between items-center">
          <Badge variant="neutral" className="text-transparent border-transparent">
            <Skeleton className="h-3 w-20" />
          </Badge>
        </div>

        <Button disabled variant="outline" className="mt-auto w-full mt-5 text-transparent pointer-events-none border-transparent bg-muted/50">
          Open Course
          <ArrowRight className="size-4 opacity-0" />
        </Button>
      </div>
    </div>
  );
}
