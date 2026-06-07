import { QuizClient } from "@/components/learning/quiz-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("EMPLOYEE", "INTERN");
  const { id } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      lesson: { include: { module: { include: { course: true } } } },
      attempts: { where: { userId: user.id } },
    },
  });
  if (!quiz || !await prisma.enrollment.findUnique({ where: { learnerId_courseId: { learnerId: user.id, courseId: quiz.lesson.module.courseId } } })) notFound();

  const attemptsRemaining = quiz.maxAttempts ? quiz.maxAttempts - quiz.attempts.length : null;
  const canAttempt = !quiz.maxAttempts || quiz.attempts.length < quiz.maxAttempts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="quiz-page-header mx-auto max-w-3xl px-4">
        <Link href={`/courses/${quiz.lesson.module.course.slug}`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="size-3.5" />
          Back to {quiz.lesson.module.course.title}
        </Link>
        <h1 className="mt-3 text-2xl font-bold">{quiz.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="info">Pass mark: {quiz.passMark}%</Badge>
          <Badge variant={attemptsRemaining !== null && attemptsRemaining <= 1 ? "warning" : "neutral"}>
            Attempts: {quiz.attempts.length}{quiz.maxAttempts ? `/${quiz.maxAttempts}` : ""}
          </Badge>
        </div>
        {quiz.instructions && (
          <p className="mt-3 text-sm text-muted-foreground">{quiz.instructions}</p>
        )}
      </div>

      <QuizClient quiz={quiz} canAttempt={canAttempt} />
    </div>
  );
}
