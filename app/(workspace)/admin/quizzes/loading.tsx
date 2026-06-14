import { PageHeader } from "@/components/page-header";
import { CourseSelector } from "@/components/admin/course-selector";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Settings, List, PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminQuizzesLoading() {
  return (
    <>
      <PageHeader title="Quizzes" description="Manage quizzes, settings, and questions." />

      <CourseSelector courses={[]} selectedCourseId={""} />

      <div className="space-y-8 mt-6">
        {[...Array(2)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <Target className="size-5 text-primary opacity-50" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-4 w-72 mt-2" />
            </CardHeader>
            <CardContent className="pt-6">
              
              {/* Settings Skeleton */}
              <div className="mb-10 space-y-5">
                <div className="flex items-center gap-2 font-semibold text-base">
                  <Settings className="size-5 text-muted-foreground opacity-50" />
                  Quiz Settings
                </div>
                
                <div className="grid gap-6 md:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-2">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between border rounded-none p-4 bg-muted/20">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-6 w-10 rounded-full" />
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end">
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>

              <Separator className="my-8" />

              {/* Questions List Skeleton */}
              <div className="mb-8 space-y-4">
                <div className="flex items-center gap-2 font-semibold text-base mb-4">
                  <List className="size-5 text-muted-foreground opacity-50" />
                  Questions
                </div>
                
                <div className="space-y-3">
                  {[...Array(3)].map((_, qIndex) => (
                    <div key={qIndex} className="flex flex-col gap-3 border p-4 bg-card">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 w-full">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-8" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/40 p-2.5 border border-dashed flex items-center gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Question Skeleton */}
              <div className="border bg-card shadow-sm mt-8 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 font-semibold text-base">
                      <PlusCircle className="size-5 text-primary opacity-50" />
                      Add Questions
                    </div>
                    <Tabs defaultValue="single" className="w-[200px]">
                      <TabsList>
                        <TabsTrigger value="single" disabled>Single</TabsTrigger>
                        <TabsTrigger value="bulk" disabled>Bulk</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`space-y-2 ${i === 2 ? 'md:col-span-2' : ''}`}>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className={`w-full ${i === 2 ? 'h-24' : 'h-10'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
