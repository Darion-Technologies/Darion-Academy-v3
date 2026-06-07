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
import {
  CheckCircle2, Clock, AlertTriangle, XCircle, ArrowLeft,
} from "lucide-react";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { 
      module: { include: { course: true } }, 
      assignment: true, 
      quiz: true,
      videoProgress: { where: { userId: user.id } },
      videoNotes: { where: { userId: user.id }, orderBy: { timestamp: "asc" } }
    },
  });
  if (!lesson) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { learnerId_courseId: { learnerId: user.id, courseId: lesson.module.courseId } },
  });
  const mentorAccess = user.role === "MENTOR"
    ? await prisma.enrollment.findFirst({ where: { mentorId: user.id, courseId: lesson.module.courseId }, select: { id: true } })
    : null;
  if (!enrollment && user.role !== "ADMIN" && !mentorAccess) notFound();

  const isLearner = Boolean(enrollment);

  // Module lock check — verify previous module is completed
  if (isLearner && lesson.module.order > 1) {
    const prevModule = await prisma.module.findFirst({
      where: { courseId: lesson.module.courseId, order: lesson.module.order - 1 },
      include: { lessons: { include: { assignment: true, quiz: true } } },
    });
    if (prevModule) {
      const prevLessonIds = prevModule.lessons.map((l) => l.id);
      
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
  }

  const submission = lesson.assignment
    ? await prisma.submission.findUnique({
        where: { assignmentId_learnerId: { assignmentId: lesson.assignment.id, learnerId: user.id } },
        include: { feedback: { include: { author: true } } },
      })
    : null;
  const lessonFileUrl = lesson.fileUrl ? await createSignedUrl("lesson-files", lesson.fileUrl) : null;
  const youtubeVideoId = lesson.videoUrl ? getYouTubeVideoId(lesson.videoUrl) : null;
  const canComplete = isLearner;
  const existingProgress = canComplete
    ? await prisma.progress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } } })
    : null;

  // Submission status helpers
  const submissionStatusConfig: Record<string, { label: string; variant: "neutral" | "success" | "warning" | "error" | "info"; icon: typeof CheckCircle2 }> = {
    PENDING: { label: "Not Submitted", variant: "neutral", icon: Clock },
    SUBMITTED: { label: "Waiting for Approval", variant: "warning", icon: Clock },
    APPROVED: { label: "Approved", variant: "success", icon: CheckCircle2 },
    NEEDS_CORRECTION: { label: "Rework Needed", variant: "error", icon: AlertTriangle },
    REJECTED: { label: "Rejected", variant: "error", icon: XCircle },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href={`/courses/${lesson.module.course.slug}`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="size-3.5" />
          Back to {lesson.module.course.title}
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <Badge>{lesson.type}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{lesson.module.title}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_.8fr]">
        {/* Main content */}
        {lesson.type === "VIDEO" && lesson.videoUrl ? (
          <InteractiveVideoLayout
            lessonId={lesson.id}
            videoUrl={lesson.videoUrl}
            canComplete={canComplete}
            initiallyCompleted={existingProgress?.completed ?? false}
            initialProgress={lesson.videoProgress?.[0]?.timestamp ?? 0}
            notes={lesson.videoNotes ?? []}
          />
        ) : (
          <Card className={lesson.type === "YOUTUBE" ? "border-0 bg-transparent shadow-none" : undefined}>
            <CardContent className={lesson.type === "YOUTUBE" ? "p-0" : "pt-5"}>
            {lesson.type === "YOUTUBE" && youtubeVideoId && (
              <YouTubePlayer
                lessonId={lesson.id}
                videoId={youtubeVideoId}
                canComplete={canComplete}
                initiallyCompleted={existingProgress?.completed ?? false}
              />
            )}
            {lesson.type === "YOUTUBE" && lesson.videoUrl && !youtubeVideoId && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                <p className="text-sm text-amber-900">This saved URL cannot be embedded.</p>
                <Button className="mt-3" variant="outline" asChild>
                  <a href={lesson.videoUrl} target="_blank" rel="noreferrer">Open on YouTube</a>
                </Button>
              </div>
            )}
            {lesson.type === "LINK" && lesson.externalUrl && (
              <Button asChild>
                <a href={lesson.externalUrl} target="_blank" rel="noreferrer">Open resource</a>
              </Button>
            )}
            {lessonFileUrl && (
              <Button variant="outline" asChild>
                <a href={lessonFileUrl} target="_blank" rel="noreferrer">Open lesson file</a>
              </Button>
            )}
            {lesson.content && (
              <div className="prose-content whitespace-pre-wrap text-sm">{lesson.content}</div>
            )}
            {lesson.assignment && (
              <div className="mt-6">
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
            )}
            {lesson.quiz && (
              <Button className="mt-5" asChild>
                <Link href={`/quizzes/${lesson.quiz.id}`}>Take quiz</Link>
              </Button>
            )}
          </CardContent>
        </Card>
        )}

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Lesson status */}
          <Card>
            <CardHeader><CardTitle>Lesson Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {/* Assignment status with proper flow */}
              {submission && (() => {
                const config = submissionStatusConfig[submission.status] ?? submissionStatusConfig.PENDING;
                const StatusIcon = config.icon;
                return (
                  <div className={`flex items-center gap-3 rounded-xl p-3 ${
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
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">Lesson completed</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mentor feedback */}
          {submission?.feedback.length ? (
            <Card>
              <CardHeader><CardTitle>Mentor Feedback</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {submission.feedback.map((f) => (
                  <div key={f.id} className="rounded-xl bg-muted/50 p-3">
                    <p className="text-sm">{f.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{f.author.name}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
