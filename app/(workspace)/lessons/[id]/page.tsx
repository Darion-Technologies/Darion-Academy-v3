import { Suspense } from "react";
import { completeLessonAction } from "@/app/actions/learning";
import { SubmissionForm } from "@/components/learning/submission-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSignedUrl } from "@/lib/storage";
import { getYouTubeVideoId } from "@/lib/youtube";
import { YouTubePlayer } from "@/components/learning/youtube-player";
import { InteractiveVideoLayout } from "@/components/learning/interactive-video-layout";
import { LessonProvider } from "@/components/learning/lesson-context";
import { LessonNotes } from "@/components/learning/lesson-notes";
import {
  CheckCircle2, Clock, AlertTriangle, XCircle, ArrowLeft,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Skeleton } from "@/components/ui/skeleton";

// --- SUSPENSE LOADERS ---

async function NextPrevButtons({ lesson, position }: { lesson: any, position: "header" | "footer" }) {
  const [nextLessonInModule, prevLessonInModule, nextModule, prevModule] = await Promise.all([
    prisma.lesson.findFirst({
      where: { moduleId: lesson.moduleId, order: { gt: lesson.order } },
      orderBy: { order: "asc" }
    }),
    prisma.lesson.findFirst({
      where: { moduleId: lesson.moduleId, order: { lt: lesson.order } },
      orderBy: { order: "desc" }
    }),
    prisma.module.findFirst({
      where: { courseId: lesson.module.courseId, order: { gt: lesson.module.order } },
      orderBy: { order: "asc" },
      include: { lessons: { orderBy: { order: "asc" }, take: 1 } }
    }),
    prisma.module.findFirst({
      where: { courseId: lesson.module.courseId, order: { lt: lesson.module.order } },
      orderBy: { order: "desc" },
      include: { lessons: { orderBy: { order: "desc" }, take: 1 } }
    })
  ]);

  let nextLessonUrl: string | null = null;
  if (nextLessonInModule) {
    nextLessonUrl = `/lessons/${nextLessonInModule.id}`;
  } else if (nextModule && nextModule.lessons.length > 0) {
    nextLessonUrl = `/lessons/${nextModule.lessons[0].id}`;
  }

  let prevLessonUrl: string | null = null;
  if (prevLessonInModule) {
    prevLessonUrl = `/lessons/${prevLessonInModule.id}`;
  } else if (prevModule && prevModule.lessons.length > 0) {
    prevLessonUrl = `/lessons/${prevModule.lessons[0].id}`;
  }

  if (position === "header") {
    return (
      <div className="flex items-center gap-2">
        {prevLessonUrl && (
          <Button variant="outline" size="sm" asChild>
            <Link prefetch={true} href={prevLessonUrl}>Previous</Link>
          </Button>
        )}
        {nextLessonUrl && (
          <Button size="sm" asChild>
            <Link prefetch={true} href={nextLessonUrl}>Next Lesson</Link>
          </Button>
        )}
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-between pt-6 border-t border-border">
        {prevLessonUrl ? (
          <Button variant="outline" asChild>
            <Link prefetch={true} href={prevLessonUrl}>Previous Lesson</Link>
          </Button>
        ) : <div />}
        {nextLessonUrl && (
          <Button asChild>
            <Link prefetch={true} href={nextLessonUrl}>Next Lesson</Link>
          </Button>
        )}
      </div>
    );
  }
}

async function InteractiveVideoLayoutLoader({ lesson, user, canComplete }: { lesson: any, user: any, canComplete: boolean }) {
  const [existingProgress, videoProgress] = await Promise.all([
    canComplete ? prisma.progress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } } }) : null,
    prisma.videoProgress.findMany({ where: { userId: user.id, lessonId: lesson.id } })
  ]);

  return (
    <InteractiveVideoLayout
      lessonId={lesson.id}
      videoUrl={lesson.videoUrl!}
      canComplete={canComplete}
      initiallyCompleted={existingProgress?.completed ?? false}
      initialProgress={videoProgress?.[0]?.maxTimestamp || videoProgress?.[0]?.timestamp || 0}
      initialMaxProgress={videoProgress?.[0]?.maxTimestamp || videoProgress?.[0]?.timestamp || 0}
      videoStartTime={lesson.videoStartTime}
      videoEndTime={lesson.videoEndTime}
    />
  );
}

async function YouTubePlayerLoader({ lesson, user, canComplete, youtubeVideoId }: { lesson: any, user: any, canComplete: boolean, youtubeVideoId: string }) {
  const [existingProgress, videoProgress] = await Promise.all([
    canComplete ? prisma.progress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } } }) : null,
    prisma.videoProgress.findMany({ where: { userId: user.id, lessonId: lesson.id } })
  ]);

  return (
    <YouTubePlayer
      lessonId={lesson.id}
      videoId={youtubeVideoId}
      canComplete={canComplete}
      initiallyCompleted={existingProgress?.completed ?? false}
      initialProgress={videoProgress?.[0]?.maxTimestamp || videoProgress?.[0]?.timestamp || 0}
      initialMaxProgress={videoProgress?.[0]?.maxTimestamp || videoProgress?.[0]?.timestamp || 0}
      videoStartTime={lesson.videoStartTime}
      videoEndTime={lesson.videoEndTime}
    />
  );
}

async function LessonStatusLoader({ lesson, user, canComplete }: { lesson: any, user: any, canComplete: boolean }) {
  const [existingProgress, submission] = await Promise.all([
    canComplete ? prisma.progress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } } }) : null,
    lesson.assignment
      ? prisma.submission.findUnique({
          where: { assignmentId_learnerId: { assignmentId: lesson.assignment.id, learnerId: user.id } },
        })
      : null
  ]);

  const submissionStatusConfig: Record<string, { label: string; variant: "neutral" | "success" | "warning" | "error" | "info"; icon: typeof CheckCircle2 }> = {
    PENDING: { label: "Not Submitted", variant: "neutral", icon: Clock },
    SUBMITTED: { label: "Waiting for Approval", variant: "warning", icon: Clock },
    APPROVED: { label: "Approved", variant: "success", icon: CheckCircle2 },
    NEEDS_CORRECTION: { label: "Rework Needed", variant: "error", icon: AlertTriangle },
    REJECTED: { label: "Rejected", variant: "error", icon: XCircle },
  };

  return (
    <Card>
      <CardHeader><CardTitle>Lesson Status</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {/* Assignment status with proper flow */}
        {submission && (() => {
          const config = submissionStatusConfig[submission.status] ?? submissionStatusConfig.PENDING;
          const StatusIcon = config.icon;
          return (
            <div className={`flex items-center gap-3 p-3 ${
              config.variant === "success" ? "bg-emerald-50"
                : config.variant === "warning" ? "bg-amber-50"
                : config.variant === "error" ? "bg-red-50"
                : "bg-muted/50"
            }`}>
              <StatusIcon className={`size-5 shrink-0 ${
                config.variant === "success" ? "text-emerald-600"
                  : config.variant === "warning" ? "text-amber-600"
                  : config.variant === "error" ? "text-red-600"
                  : "text-muted-foreground"
              }`} />
              <div>
                <p className="text-sm font-semibold">{config.label}</p>
                {submission.status === "SUBMITTED" && (
                  <p className="text-xs text-amber-600">Your submission is being reviewed by your mentor.</p>
                )}
                {submission.status === "NEEDS_CORRECTION" && (
                  <p className="text-xs text-red-600">Please revise and resubmit your work.</p>
                )}
                {submission.status === "APPROVED" && (
                  <p className="text-xs text-emerald-600">Great work! Your assignment has been approved.</p>
                )}
              </div>
            </div>
          );
        })()}

        {/* Video completion status */}
        {lesson.type === "YOUTUBE" && (
          <p className="text-sm text-muted-foreground">
            {existingProgress?.completed
              ? "✓ Video completed"
              : "Completion unlocks when the video ends."}
          </p>
        )}

        {/* Mark complete button */}
        {!lesson.assignment && !lesson.quiz && lesson.type !== "YOUTUBE" && canComplete && !existingProgress?.completed && (
          <form action={completeLessonAction}>
            <input type="hidden" name="lessonId" value={lesson.id} />
            <SubmitButton className="w-full" pendingText="Completing...">Mark complete</SubmitButton>
          </form>
        )}

        {existingProgress?.completed && !lesson.assignment && (
          <div className="flex items-center gap-2 bg-emerald-50 p-3">
            <CheckCircle2 className="size-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Lesson completed</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function MentorFeedbackLoader({ lesson, user }: { lesson: any, user: any }) {
  if (!lesson.assignment) return null;
  const submission = await prisma.submission.findUnique({
    where: { assignmentId_learnerId: { assignmentId: lesson.assignment.id, learnerId: user.id } },
    include: { feedback: { include: { author: true } } },
  });

  if (!submission?.feedback?.length) return null;

  return (
    <Card>
      <CardHeader><CardTitle>Mentor Feedback</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {submission.feedback.map((f) => (
          <div key={f.id} className="bg-muted/50 p-3">
            <p className="text-sm">{f.message}</p>
            <p className="mt-2 text-xs text-muted-foreground">{f.author.name}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

async function LessonNotesLoader({ lessonId, user, isMentor, isLearner }: { lessonId: string, user: any, isMentor: boolean, isLearner: boolean }) {
  const notes = await prisma.videoNote.findMany({ where: { userId: user.id, lessonId }, orderBy: { timestamp: "asc" } });
  
  return (
    <LessonNotes 
      lessonId={lessonId} 
      notes={notes} 
      isMentor={isMentor && !isLearner}
    />
  );
}

async function AssignmentContentLoader({ lesson, user }: { lesson: any, user: any }) {
  if (!lesson.assignment) return null;
  
  const submission = await prisma.submission.findUnique({
    where: { assignmentId_learnerId: { assignmentId: lesson.assignment.id, learnerId: user.id } },
  });

  return (
    <div>
      <h2 className="mb-2 font-semibold">Assignment</h2>
      <p className="mb-5 text-sm text-muted-foreground">{lesson.assignment.instructions}</p>
      {(!submission || submission.status === "NEEDS_CORRECTION" || submission.status === "PENDING") && (
        <SubmissionForm
          assignmentId={lesson.assignment.id}
          allowText={lesson.assignment.allowText}
          allowFile={lesson.assignment.allowFile}
          allowLink={lesson.assignment.allowLink}
        />
      )}
    </div>
  );
}


// --- MAIN PAGE ---

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, { id }] = await Promise.all([requireUser(), params]);

  // Fetch static lesson structure
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { 
      module: { include: { course: true } }, 
      assignment: true, 
      quiz: true,
    },
  });
  if (!lesson) notFound();

  // Parallel fetch enrollment, mentor access, and prev module for lock check
  const [enrollment, mentorAccess, prevModule] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { learnerId_courseId: { learnerId: user.id, courseId: lesson.module.courseId } },
    }),
    user.role === "MENTOR"
      ? prisma.enrollment.findFirst({ where: { mentorId: user.id, courseId: lesson.module.courseId }, select: { id: true } })
      : null,
    lesson.module.order > 1
      ? prisma.module.findFirst({
          where: { courseId: lesson.module.courseId, order: lesson.module.order - 1 },
          include: { lessons: { include: { assignment: true, quiz: true } } },
        })
      : null
  ]);

  if (!enrollment && user.role !== "ADMIN" && !mentorAccess) notFound();
  const isLearner = Boolean(enrollment);

  // Module lock check
  if (isLearner && prevModule) {
    const prevLessonIds = prevModule.lessons.map((l: any) => l.id);
    const [progress, submissions, quizAttempts] = await Promise.all([
      prisma.progress.findMany({ where: { userId: user.id, lessonId: { in: prevLessonIds }, completed: true } }),
      prisma.submission.findMany({ where: { learnerId: user.id, assignment: { lessonId: { in: prevLessonIds } } } }),
      prisma.quizAttempt.findMany({ where: { userId: user.id, quiz: { lessonId: { in: prevLessonIds } } } })
    ]);

    const completedIds = new Set(progress.map(p => p.lessonId));
    const submissionMap = new Map(submissions.map(s => [s.assignmentId, s.status]));
    const quizMap = new Map(quizAttempts.map(q => [q.quizId, q.status]));

    let allCompleted = true;
    for (const l of prevModule.lessons) {
      if (l.quiz && quizMap.get(l.quiz.id) !== "PASSED") allCompleted = false;
      else if (l.assignment && submissionMap.get(l.assignment.id) !== "APPROVED") allCompleted = false;
      else if (!l.quiz && !l.assignment && !completedIds.has(l.id)) allCompleted = false;
    }

    if (!allCompleted) {
      redirect(`/courses/${lesson.module.course.slug}`);
    }
  }

  const lessonFileUrl = lesson.fileUrl ? await createSignedUrl("lesson-files", lesson.fileUrl) : null;
  const youtubeVideoId = lesson.videoUrl ? getYouTubeVideoId(lesson.videoUrl) : null;
  const canComplete = isLearner;

  return (
    <LessonProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <Link prefetch={true} href={`/courses/${lesson.module.course.slug}`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
              <ArrowLeft className="size-3.5" />
              Back to {lesson.module.course.title}
            </Link>
            <div className="mt-3 flex items-center gap-3">
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              <Badge>{lesson.type}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{lesson.module.title}</p>
          </div>
          <Suspense fallback={
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-28" />
            </div>
          }>
            <NextPrevButtons lesson={lesson} position="header" />
          </Suspense>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_.8fr]">
        {/* Main content */}
        {lesson.type === "VIDEO" && lesson.videoUrl ? (
          <Suspense fallback={<Skeleton className="w-full aspect-video border border-border bg-black shadow-sm rounded-none" />}>
            <InteractiveVideoLayoutLoader lesson={lesson} user={user} canComplete={canComplete} />
          </Suspense>
        ) : (
          <div className="space-y-6">
            {lesson.type === "YOUTUBE" && youtubeVideoId && (
              <Suspense fallback={<Skeleton className="w-full aspect-video border border-border bg-black shadow-sm rounded-none" />}>
                <YouTubePlayerLoader lesson={lesson} user={user} canComplete={canComplete} youtubeVideoId={youtubeVideoId} />
              </Suspense>
            )}
            {((lesson.type === "YOUTUBE" && lesson.videoUrl && !youtubeVideoId) || lesson.type === "LINK" || lessonFileUrl || lesson.content || lesson.assignment || lesson.quiz) && (
              <Card>
                <CardContent className="pt-5 space-y-6">
                  {lesson.type === "YOUTUBE" && lesson.videoUrl && !youtubeVideoId && (
                    <div className="border border-amber-300 bg-amber-50 p-4">
                      <p className="text-sm text-amber-900">This saved URL cannot be embedded.</p>
                      <Button className="mt-3" variant="outline" asChild>
                        <a href={lesson.videoUrl} target="_blank" rel="noreferrer">Open on YouTube</a>
                      </Button>
                    </div>
                  )}
                  {lesson.type === "LINK" && lesson.externalUrl && (
                    <Button asChild className="">
                      <a href={lesson.externalUrl} target="_blank" rel="noreferrer">Open resource</a>
                    </Button>
                  )}
                  {lessonFileUrl && (
                    <Button variant="outline" asChild className="">
                      <a href={lessonFileUrl} target="_blank" rel="noreferrer">Open lesson file</a>
                    </Button>
                  )}
                  {lesson.content && (
                    <MarkdownRenderer content={lesson.content} />
                  )}
                  {lesson.assignment && (
                    <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                      <AssignmentContentLoader lesson={lesson} user={user} />
                    </Suspense>
                  )}
                  {lesson.quiz && (
                    <Button className="" asChild>
                      <Link prefetch={true} href={`/quizzes/${lesson.quiz.id}`}>Take quiz</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
            
            <Suspense fallback={
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-32" />
              </div>
            }>
              <NextPrevButtons lesson={lesson} position="footer" />
            </Suspense>
          </div>
        )}

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Lesson status */}
          <Suspense fallback={
            <Card>
              <CardHeader><CardTitle><Skeleton className="h-6 w-32" /></CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          }>
            <LessonStatusLoader lesson={lesson} user={user} canComplete={canComplete} />
          </Suspense>

          {/* Mentor feedback */}
          <Suspense fallback={null}>
            <MentorFeedbackLoader lesson={lesson} user={user} />
          </Suspense>

          <div className="h-[500px]">
            <Suspense fallback={
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
            }>
              <LessonNotesLoader lessonId={lesson.id} user={user} isMentor={!!mentorAccess} isLearner={isLearner} />
            </Suspense>
          </div>
        </div>
        </div>
      </div>
    </LessonProvider>
  );
}
