"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreQuiz } from "@/lib/quiz";
import { refreshEnrollmentProgress } from "@/lib/progress";
import { uploadPrivateFile } from "@/lib/storage";
import type { AttemptStatus } from "@/generated/prisma";

async function requireLessonEnrollment(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) throw new Error("Lesson not found.");
  const enrollment = await prisma.enrollment.findUnique({
    where: { learnerId_courseId: { learnerId: userId, courseId: lesson.module.courseId } },
  });
  if (!enrollment) throw new Error("You are not enrolled in this course.");
  return { lesson, enrollment };
}

export async function completeLessonAction(formData: FormData) {
  const user = await requireRole("EMPLOYEE", "INTERN");
  const lessonId = String(formData.get("lessonId") ?? "");
  const { lesson } = await requireLessonEnrollment(user.id, lessonId);
  if (lesson.type === "YOUTUBE" && formData.get("videoCompleted") !== "true") {
    throw new Error("Watch the video to the end before completing this lesson.");
  }
  await prisma.progress.upsert({ where: { userId_lessonId: { userId: user.id, lessonId } }, update: { completed: true, completedAt: new Date() }, create: { userId: user.id, lessonId, completed: true, completedAt: new Date() } });
  await refreshEnrollmentProgress(prisma, user.id, lesson.module.courseId);
  revalidatePath(`/courses/${lesson.module.course.slug}`);
}

type SubmissionState = { error?: string; success?: string };

export async function submitAssignmentAction(_state: SubmissionState, formData: FormData): Promise<SubmissionState> {
  const user = await requireRole("EMPLOYEE", "INTERN");
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const textAnswer = String(formData.get("textAnswer") ?? "").trim() || null;
  const externalUrl = String(formData.get("externalUrl") ?? "").trim() || null;
  const file = formData.get("file");
  const assignment = await prisma.assignment.findUniqueOrThrow({ where: { id: assignmentId }, include: { lesson: { include: { module: { include: { course: true } } } } } });
  const enrollment = await prisma.enrollment.findUnique({ where: { learnerId_courseId: { learnerId: user.id, courseId: assignment.lesson.module.courseId } } });
  if (!enrollment) return { error: "You are not enrolled in this course." };
  let fileUrl: string | null = null;
  if (file instanceof File && file.size > 0) fileUrl = await uploadPrivateFile("submissions", `${user.id}/${assignmentId}/${Date.now()}-${file.name}`, file);
  if (!textAnswer && !externalUrl && !fileUrl) return { error: "Provide a text answer, link, or file." };
  await prisma.submission.upsert({
    where: { assignmentId_learnerId: { assignmentId, learnerId: user.id } },
    update: { textAnswer, externalUrl, fileUrl: fileUrl ?? undefined, status: "SUBMITTED", submittedAt: new Date(), reviewedAt: null, reviewerId: null },
    create: { assignmentId, learnerId: user.id, textAnswer, externalUrl, fileUrl, status: "SUBMITTED", submittedAt: new Date() },
  });
  await prisma.notification.createMany({ data: [
    ...(enrollment.mentorId ? [{ userId: enrollment.mentorId, type: "GENERAL" as const, title: "Task submitted", message: `${user.name} submitted ${assignment.lesson.title}.`, href: "/mentor/submissions" }] : []),
  ] });
  revalidatePath(`/lessons/${assignment.lessonId}`);
  return { success: "Your assignment was submitted for review." };
}

export async function startQuizAction(formData: FormData) {
  const user = await requireRole("EMPLOYEE", "INTERN");
  const quizId = String(formData.get("quizId") ?? "");
  const quiz = await prisma.quiz.findUniqueOrThrow({
    where: { id: quizId },
    include: {
      attempts: { where: { userId: user.id } },
      lesson: { select: { module: { select: { courseId: true } } } },
    },
  });
  const enrollment = await prisma.enrollment.findUnique({
    where: { learnerId_courseId: { learnerId: user.id, courseId: quiz.lesson.module.courseId } },
    select: { id: true },
  });
  if (!enrollment) throw new Error("You are not enrolled in this course.");
  
  if (quiz.maxAttempts && quiz.attempts.length >= quiz.maxAttempts) throw new Error("Maximum attempts reached.");
  
  const inProgress = quiz.attempts.find(a => a.status === "IN_PROGRESS");
  if (inProgress) return { attemptId: inProgress.id };

  const attempt = await prisma.quizAttempt.create({
    data: { quizId, userId: user.id, status: "IN_PROGRESS" }
  });
  
  revalidatePath(`/quizzes/${quizId}`);
  return { attemptId: attempt.id };
}

export async function submitQuizAction(formData: FormData) {
  const user = await requireRole("EMPLOYEE", "INTERN");
  const quizId = String(formData.get("quizId") ?? "");
  const attemptId = String(formData.get("attemptId") ?? ""); // Strict mode requires tracking an active attempt
  const warnings = parseInt(String(formData.get("warnings") ?? "0"), 10);
  const quiz = await prisma.quiz.findUniqueOrThrow({ where: { id: quizId }, include: { questions: true, lesson: { include: { module: { include: { course: true } } } }, attempts: { where: { userId: user.id } } } });
  
  const enrollment = await prisma.enrollment.findUnique({ where: { learnerId_courseId: { learnerId: user.id, courseId: quiz.lesson.module.courseId } } });
  if (!enrollment) throw new Error("You are not enrolled in this course.");
  
  // Find attempt if passed, otherwise create it later (for non-strict mode)
  let attempt = attemptId
    ? await prisma.quizAttempt.findFirst({ where: { id: attemptId, quizId, userId: user.id } })
    : null;
  if (attemptId && !attempt) throw new Error("Quiz attempt not found.");
  
  if (attempt && attempt.status !== "IN_PROGRESS") {
    redirect(`/quizzes/${quizId}/result?attempt=${attempt.id}`);
  }

  // Evaluate strict mode limits
  let isTimeout = false;
  let isTerminated = false;
  
  if (quiz.isStrict && attempt) {
    if (warnings >= 3) {
      isTerminated = true;
    }
    if (quiz.timeLimit) {
      const elapsedMinutes = (Date.now() - attempt.startedAt.getTime()) / 60000;
      // Allow 30 seconds of buffer for network latency
      if (elapsedMinutes > quiz.timeLimit + 0.5) {
        isTimeout = true;
      }
    }
  }

  const answers = Object.fromEntries(quiz.questions.map((question) => [question.id, String(formData.get(`question-${question.id}`) ?? "")]));
  const result = scoreQuiz(quiz.questions, answers, quiz.passMark);
  
  let finalStatus: AttemptStatus = result.passed ? "PASSED" : "FAILED";
  if (isTerminated) finalStatus = "TERMINATED";
  else if (isTimeout) finalStatus = "TIMEOUT";

  // If terminated or timeout, score is 0
  const finalScore = (isTerminated || isTimeout) ? 0 : result.score;
  const finalEarned = (isTerminated || isTimeout) ? 0 : result.earnedPoints;

  if (attempt) {
    attempt = await prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: { score: finalScore, earnedPoints: finalEarned, totalPoints: result.totalPoints, status: finalStatus, submittedAt: new Date(), warnings, answers: { create: result.graded } },
    });
  } else {
    if (quiz.maxAttempts && quiz.attempts.length >= quiz.maxAttempts) throw new Error("Maximum attempts reached.");
    attempt = await prisma.quizAttempt.create({
      data: { quizId, userId: user.id, score: finalScore, earnedPoints: finalEarned, totalPoints: result.totalPoints, status: finalStatus, submittedAt: new Date(), warnings, answers: { create: result.graded } },
    });
  }

  await refreshEnrollmentProgress(prisma, user.id, quiz.lesson.module.courseId);
  redirect(`/quizzes/${quizId}/result?attempt=${attempt.id}`);
}

export async function saveVideoProgressAction(formData: FormData) {
  const user = await requireRole("EMPLOYEE", "INTERN");
  const lessonId = String(formData.get("lessonId") ?? "");
  const timestamp = parseInt(String(formData.get("timestamp") ?? "0"), 10);
  const maxTimestampStr = formData.get("maxTimestamp");
  const maxTimestamp = maxTimestampStr ? parseInt(String(maxTimestampStr), 10) : undefined;
  const completed = formData.get("completed") === "true";
  const { lesson } = await requireLessonEnrollment(user.id, lessonId);
  
  await prisma.videoProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: { timestamp, maxTimestamp: maxTimestamp !== undefined ? { set: maxTimestamp } : undefined, completed: completed ? true : undefined },
    create: { userId: user.id, lessonId, timestamp, maxTimestamp: maxTimestamp !== undefined ? maxTimestamp : timestamp, completed }
  });
  
  if (completed) {
    // Also mark standard progress
    await prisma.progress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      update: { completed: true, completedAt: new Date() },
      create: { userId: user.id, lessonId, completed: true, completedAt: new Date() }
    });
    await refreshEnrollmentProgress(prisma, user.id, lesson.module.courseId);
  }
}

export async function createVideoNoteAction(formData: FormData) {
  const user = await requireRole("EMPLOYEE", "INTERN");
  const lessonId = String(formData.get("lessonId") ?? "");
  const timestamp = parseInt(String(formData.get("timestamp") ?? "0"), 10);
  const text = String(formData.get("text") ?? "").trim();
  const isDoubt = formData.get("isDoubt") === "true";
  
  if (!text) return { error: "Note text is required." };
  const { lesson, enrollment } = await requireLessonEnrollment(user.id, lessonId);
  
  await prisma.videoNote.create({
    data: { userId: user.id, lessonId, timestamp, text, isDoubt }
  });
  
  if (isDoubt && enrollment.mentorId) {
    await prisma.notification.create({
      data: {
        userId: enrollment.mentorId,
        type: "GENERAL",
        title: "Question from learner",
        message: `${user.name} asked a question in ${lesson.title}`,
        href: `/mentor/learners/${user.id}`
      }
    });
  }
  
  revalidatePath(`/lessons/${lessonId}`);
  return { success: true };
}

export async function deleteVideoNoteAction(formData: FormData) {
  const user = await requireRole("EMPLOYEE", "INTERN");
  const noteId = String(formData.get("noteId") ?? "");
  
  const note = await prisma.videoNote.findUnique({ where: { id: noteId } });
  if (!note || note.userId !== user.id) return { error: "Note not found or unauthorized." };
  
  await prisma.videoNote.delete({ where: { id: noteId } });
  revalidatePath(`/lessons/${note.lessonId}`);
  return { success: true };
}

export async function replyToDoubtAction(formData: FormData) {
  const user = await requireRole("MENTOR", "ADMIN");
  const noteId = String(formData.get("noteId") ?? "");
  const text = String(formData.get("text") ?? "").trim();
  
  if (!text) return { error: "Reply text is required." };
  
  const note = await prisma.videoNote.findUnique({
    where: { id: noteId },
    include: { lesson: true }
  });
  
  if (!note) return { error: "Doubt not found." };
  
  await prisma.videoNote.update({
    where: { id: noteId },
    data: {
      mentorReply: text,
      repliedAt: new Date(),
      resolved: true,
    }
  });

  // Notify learner
  await prisma.notification.create({
    data: {
      userId: note.userId,
      type: "GENERAL",
      title: "Mentor Replied",
      message: `${user.name} responded to your doubt in ${note.lesson.title}`,
      href: `/lessons/${note.lessonId}`
    }
  });
  
  revalidatePath(`/lessons/${note.lessonId}`);
  revalidatePath(`/mentor/learners/${note.userId}`);
  return { success: true };
}
