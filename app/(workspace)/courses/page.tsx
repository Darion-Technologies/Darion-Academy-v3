import Link from "next/link";
import Image from "next/image";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";
import { ArrowRight, BookOpen } from "lucide-react";

export default async function CoursesPage() {
  const user = await requireUser();
  const enrollments = await prisma.enrollment.findMany({
    where: { learnerId: user.id },
    include: { course: true },
    orderBy: { assignedAt: "desc" },
  });

  const enrollmentsByCategory = enrollments.reduce((acc, curr) => {
    const cat = curr.course.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {} as Record<string, typeof enrollments>);

  return (
    <>
      <PageHeader title="My Courses" description="Your assigned learning catalog." />
      {!enrollments.length ? (
        <EmptyState title="No courses found" description="Assigned courses will appear here." />
      ) : (
        <Tabs defaultValue="All" className="space-y-8">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="h-10 w-auto justify-start">
              <TabsTrigger value="All" className="px-4">All Courses</TabsTrigger>
              {Object.keys(enrollmentsByCategory).map((category) => (
                <TabsTrigger key={category} value={category} className="px-4">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="All" className="mt-0">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {enrollments.map(({ course, progressPercent, status }) => (
                <CourseCard key={`all-${course.id}`} course={course} progressPercent={progressPercent} status={status} />
              ))}
            </div>
          </TabsContent>

          {Object.entries(enrollmentsByCategory).map(([category, catEnrollments]) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {catEnrollments.map(({ course, progressPercent, status }) => (
                  <CourseCard key={`${category}-${course.id}`} course={course} progressPercent={progressPercent} status={status} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </>
  );
}

function CourseCard({ course, progressPercent, status }: { course: any; progressPercent: number; status: string }) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/40">
      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {/* Course header */}
      <div className="gradient-welcome relative min-h-36 overflow-hidden px-6 py-5 text-white">
        {course.thumbnailUrl && (
          <Image
            src={`/api/admin/courses/${course.id}/thumbnail`}
            alt=""
            fill
            className="object-cover transition-transform group-hover:scale-105 duration-700"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10202D]/95 via-[#10202D]/55 to-[#10202D]/20" />
        <div className="relative flex h-full flex-col justify-end">
          <h2 className="mt-3 text-lg font-semibold leading-snug">{course.title}</h2>
        </div>
      </div>

      {/* Course body */}
      <div className="flex flex-col flex-1 p-5">
        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground mb-4">
          {course.description}
        </p>

        <div className="flex justify-between items-center mb-4">
          <Badge variant="neutral">{course.difficulty}</Badge>
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <BookOpen className="size-3" />
            {formatDuration(course.estimatedMinutes)}
          </span>
        </div>

        <div className="mb-1.5 flex justify-between text-xs">
          <span className="font-medium text-muted-foreground">Progress</span>
          <span className="font-bold text-foreground">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} />

        <div className="mt-3 flex justify-between items-center">
          <Badge
            variant={
              status === "COMPLETED"        ? "success"
              : status === "IN_PROGRESS"    ? "info"
              : status === "AWAITING_APPROVAL" ? "warning"
              : "neutral"
            }
          >
            {status.replaceAll("_", " ")}
          </Badge>
        </div>

        <Button className="mt-auto w-full mt-5 active-press" asChild>
          <Link href={`/courses/${course.slug}`}>
            {progressPercent === 100 ? "Review Course" : "Open Course"}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
