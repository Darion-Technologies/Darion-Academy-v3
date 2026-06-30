import {
  CheckCircle2, Circle, Lock, Clock, FileQuestion, ClipboardCheck,
  Award, ArrowRight, Eye, RotateCcw, ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn, formatDuration } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { calculateModuleDeadlines } from "@/lib/deadlines";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";

const getCachedCourse = unstable_cache(
  async (slug: string) => {
    return prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          include: {
            lessons: {
              include: { assignment: { select: { id: true } }, quiz: { select: { id: true } } },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });
  },
  ["course-syllabus"],
  { revalidate: 3600 }
);

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  const course = await getCachedCourse(slug);
  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { learnerId_courseId: { learnerId: user.id, courseId: course.id } },
    include: { certificates: { where: { status: "GENERATED" }, take: 1, select: { id: true } } },
  });
  if (
    !enrollment &&
    user.role !== "ADMIN" &&
    !(
      user.role === "MENTOR" &&
      (await prisma.enrollment.findFirst({ where: { courseId: course.id, mentorId: user.id } }))
    )
  )
    notFound();

  const isLearner = Boolean(enrollment);

  const [completedRecords, submissions, quizAttempts] = await Promise.all([
    isLearner
      ? prisma.progress.findMany({
          where: { userId: user.id, completed: true, lesson: { module: { courseId: course.id } } },
          select: { lessonId: true },
        })
      : Promise.resolve([]),
    isLearner
      ? prisma.submission.findMany({
          where: { learnerId: user.id, assignment: { lesson: { module: { courseId: course.id } } } },
          select: { assignmentId: true, status: true },
        })
      : Promise.resolve([]),
    isLearner
      ? prisma.quizAttempt.findMany({
          where: { userId: user.id, quiz: { lesson: { module: { courseId: course.id } } } },
          select: { quizId: true, status: true },
          orderBy: { submittedAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const completedLessonIds = new Set(completedRecords.map((p) => p.lessonId));
  const submissionMap = new Map(submissions.map((s) => [s.assignmentId, s.status]));
  const quizResultMap = new Map<string, string>();
  for (const a of quizAttempts) {
    if (!quizResultMap.has(a.quizId) || a.status === "PASSED") {
      quizResultMap.set(a.quizId, a.status);
    }
  }

  const moduleCompletionMap = new Map<string, boolean>();
  for (const mod of course.modules) {
    let allComplete = true;
    for (const l of mod.lessons) {
      if (l.quiz && quizResultMap.get(l.quiz.id) !== "PASSED") allComplete = false;
      else if (l.assignment && submissionMap.get(l.assignment.id) !== "APPROVED") allComplete = false;
      else if (!l.quiz && !l.assignment && !completedLessonIds.has(l.id)) allComplete = false;
    }
    moduleCompletionMap.set(mod.id, allComplete);
  }

  const isCompleted = enrollment?.progressPercent === 100;
  const hasCertificate = (enrollment?.certificates?.length ?? 0) > 0;

  const moduleDeadlines = enrollment && course.deadlineDays 
    ? calculateModuleDeadlines(enrollment.assignedAt, course.deadlineDays, course.modules) 
    : [];
  const moduleDeadlineMap = new Map(moduleDeadlines.map(md => [md.moduleId, md.deadlineAt]));

  return (
    <div className="space-y-4 max-w-[900px] mx-auto">
      {/* Back + Course title */}
      <div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-[var(--info)] transition-colors mb-4"
        >
          <ChevronLeft className="size-3.5" />
          Back to Courses
        </Link>
        <div className="overflow-hidden border bg-card rounded-xl shadow-sm">
          {course.thumbnailUrl ? (
            <div className="relative aspect-[21/9] min-h-[160px] sm:min-h-[200px] flex items-end">
              <Image
                src={`/api/admin/courses/${course.id}/thumbnail`}
                alt={`${course.title} thumbnail`}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="relative z-10 p-4 sm:p-5 w-full">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">{course.title}</h1>
                <div className="mt-2 text-sm max-w-3xl line-clamp-2 sm:line-clamp-none text-white/90">
                  <MarkdownRenderer content={course.description} className="prose-invert [&_*]:text-white/90" />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{course.title}</h1>
              <div className="mt-2 text-sm max-w-3xl text-muted-foreground">
                <MarkdownRenderer content={course.description} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="bg-card border border-border p-3 rounded-lg shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Difficulty</p>
          <p className="mt-0.5 text-sm font-bold text-foreground">{course.difficulty}</p>
        </div>
        <div className="bg-card border border-border p-3 rounded-lg shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Duration</p>
          <p className="mt-0.5 text-sm font-bold text-foreground">{formatDuration(course.estimatedMinutes)}</p>
        </div>
        <div className="bg-card border border-border p-3 rounded-lg shadow-sm">
          <div className="flex justify-between mb-1.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Progress</p>
            <span className="font-bold text-xs text-foreground">{enrollment?.progressPercent ?? 0}%</span>
          </div>
          <Progress value={enrollment?.progressPercent ?? 0} className="h-1.5" />
        </div>
      </div>

      {/* Completion banner */}
      {isCompleted && (
        <div className="border border-[var(--success)] bg-[var(--success-light)] p-3 flex flex-wrap items-center gap-2 rounded-lg shadow-sm">
          <CheckCircle2 className="size-4 text-[var(--success)] shrink-0" />
          <span className="font-bold text-[var(--success)] text-xs">Course completed!</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/courses/${slug}`}>
                <Eye className="size-3.5" /> Course Overview
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/courses/${slug}`}>
                <RotateCcw className="size-3.5" /> Rewatch Lessons
              </Link>
            </Button>
            {hasCertificate && (
              <Button variant="success" size="sm" asChild>
                <Link href="/certificates">
                  <Award className="size-3.5" /> View Certificate
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Module timeline */}
      <div className="space-y-2">
        {course.modules.map((module, moduleIndex) => {
          const isModuleCompleted  = moduleCompletionMap.get(module.id) ?? false;
          const prevModuleCompleted = moduleIndex === 0 || (moduleCompletionMap.get(course.modules[moduleIndex - 1].id) ?? false);
          const isModuleLocked     = isLearner && !prevModuleCompleted && moduleIndex > 0;
          const isModuleInProgress = !isModuleCompleted && prevModuleCompleted;

          return (
            <div
              key={module.id}
              className={`bg-card border border-border overflow-hidden rounded-xl shadow-sm transition-all ${
                isModuleLocked     ? "opacity-60" : ""
              } ${isModuleInProgress ? "border-primary/30 bg-accent/30" : ""}`}
            >
              {/* Module header */}
              <div className="px-3 py-2">
                <div className="flex items-center gap-2">
                  {/* Status circle */}
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center text-xs font-bold rounded-md ${
                      isModuleCompleted
                        ? "bg-[var(--success-light)] text-[var(--success)]"
                        : isModuleLocked
                          ? "bg-muted text-muted-foreground"
                          : "bg-[var(--info-light)] text-[var(--info)]"
                    }`}
                  >
                    {isModuleCompleted ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : isModuleLocked ? (
                      <Lock className="size-3" />
                    ) : (
                      moduleIndex + 1
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-foreground">
                        Mod {module.order}: {module.title}
                      </h3>
                      {isModuleCompleted  && <Badge variant="success">Complete</Badge>}
                      {isModuleInProgress && <Badge variant="info">In Progress</Badge>}
                      {isModuleLocked     && <Badge variant="neutral">Locked</Badge>}
                      {!isModuleCompleted && moduleDeadlineMap.has(module.id) && (
                        <Badge variant="warning" className="border-amber-400 text-amber-500 bg-amber-500/10 shadow-none">
                          Due {moduleDeadlineMap.get(module.id)!.toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                    {module.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
                    )}
                  </div>
                </div>

                {/* Lock message */}
                {isModuleLocked && (
                  <div className="ml-8 mt-2 bg-muted border border-border p-2 text-[10px] text-muted-foreground rounded">
                    <Lock className="mr-1 inline-block size-3" />
                    Complete Module {moduleIndex} ({course.modules[moduleIndex - 1].title}) to unlock.
                  </div>
                )}
              </div>

              {/* Lessons */}
              {!isModuleLocked && (
                <div className="border-t border-border divide-y divide-[#EEF3F5]">
                  {module.lessons.map((lesson) => {
                    const hasQuiz       = !!lesson.quiz;
                    const hasAssignment = !!lesson.assignment;
                    const quizStatus   = hasQuiz       ? quizResultMap.get(lesson.quiz!.id)       : null;
                    const assignStatus  = hasAssignment ? submissionMap.get(lesson.assignment!.id) : null;
                    const isDone =
                      hasQuiz       ? quizStatus   === "PASSED"
                      : hasAssignment ? assignStatus === "APPROVED"
                      : completedLessonIds.has(lesson.id);

                    return (
                      <Link
                        key={lesson.id}
                        prefetch={true}
                        href={`/lessons/${lesson.id}`}
                        className="group flex items-center gap-2 px-3 py-2 transition-colors hover:bg-accent/30"
                      >
                        {isDone ? (
                          <CheckCircle2 className="size-3.5 shrink-0 text-[var(--success)]" />
                        ) : (
                          <Circle className="size-3.5 shrink-0 text-border" />
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                            {lesson.order}. {lesson.title}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <Badge variant="neutral">{lesson.type}</Badge>
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                              <Clock className="size-3" />
                              {lesson.estimatedMinutes} min
                            </span>
                            {hasQuiz && (
                              <span className="flex items-center gap-1">
                                <FileQuestion className="size-3 text-muted-foreground" />
                                <Badge
                                  variant={
                                    quizStatus === "PASSED"  ? "success"
                                    : quizStatus === "FAILED" ? "error"
                                    : "neutral"
                                  }
                                >
                                  {quizStatus === "PASSED" ? "Passed" : quizStatus === "FAILED" ? "Failed" : "Quiz"}
                                </Badge>
                              </span>
                            )}
                            {hasAssignment && (
                              <span className="flex items-center gap-1">
                                <ClipboardCheck className="size-3 text-muted-foreground" />
                                <Badge
                                  variant={
                                    assignStatus === "APPROVED"         ? "success"
                                    : assignStatus === "NEEDS_CORRECTION" ? "error"
                                    : assignStatus === "SUBMITTED"        ? "warning"
                                    : "neutral"
                                  }
                                >
                                  {assignStatus === "APPROVED"           ? "Approved"
                                    : assignStatus === "NEEDS_CORRECTION" ? "Rework"
                                    : assignStatus === "SUBMITTED"        ? "In Review"
                                    : "Assignment"}
                                </Badge>
                              </span>
                            )}
                          </div>
                        </div>

                        <ArrowRight className="size-4 text-border group-hover:text-primary transition-colors shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
