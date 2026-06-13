import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesLoading() {
  return (
    <>
      <PageHeader
        title="My Courses"
        description="Continue your learning journey and explore new topics."
      />
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Fake Tabs List */}
        <div className="flex gap-2 pb-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Fake Grid */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex h-[380px] flex-col overflow-hidden border bg-card shadow-[var(--shadow-sm)]">
              {/* Fake Image Header */}
              <Skeleton className="h-36 w-full" />
              <div className="flex flex-col flex-1 p-5 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <div className="flex justify-between items-center mt-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
                <Skeleton className="h-5 w-20 mt-2" />
                <Skeleton className="h-10 w-full mt-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
