import { addQuestionAction, deleteQuestionAction, updateQuizSettingsAction } from "@/app/actions/admin";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminQuizzesPage() {
  await requireRole("ADMIN");
  const quizzes = await prisma.quiz.findMany({ include: { questions: { orderBy: { order: "asc" } }, lesson: { include: { module: { include: { course: true } } } } } });
  
  return (
    <>
      <PageHeader title="Quizzes" description="Manage quizzes, settings, and questions." />
      <div className="space-y-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{quiz.lesson.module.course.title} · Pass mark {quiz.passMark}%</p>
            </CardHeader>
            <CardContent>
              {/* Settings Form */}
              <form action={updateQuizSettingsAction} className="mb-8 grid gap-4 md:grid-cols-4 rounded-lg bg-muted/50 p-4 border border-border">
                <input type="hidden" name="quizId" value={quiz.id} />
                <div className="md:col-span-4 font-semibold text-sm border-b pb-2">Quiz Settings</div>
                <div>
                  <Label>Pass Mark (%)</Label>
                  <Input name="passMark" type="number" defaultValue={quiz.passMark} required />
                </div>
                <div>
                  <Label>Max Attempts (Empty = ∞)</Label>
                  <Input name="maxAttempts" type="number" defaultValue={quiz.maxAttempts || ""} />
                </div>
                <div>
                  <Label>Time Limit (Minutes)</Label>
                  <Input name="timeLimit" type="number" defaultValue={quiz.timeLimit || ""} placeholder="No limit" />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" name="isStrict" id={`strict-${quiz.id}`} defaultChecked={quiz.isStrict} className="size-4" />
                  <Label htmlFor={`strict-${quiz.id}`} className="cursor-pointer">Enable Strict Mode</Label>
                </div>
                <div className="md:col-span-4 mt-2">
                  <SubmitButton size="sm" pendingText="Saving...">Save Settings</SubmitButton>
                </div>
              </form>

              {/* Questions List */}
              <div className="mb-5 space-y-2">
                <div className="font-semibold text-sm border-b pb-2">Questions</div>
                {quiz.questions.map((q) => (
                  <div key={q.id} className="rounded-lg border p-3 text-sm">
                    <b>{q.order}. {q.prompt}</b>
                    <p className="mt-1 text-xs text-muted-foreground">{q.type} · {q.points} points · Answer: {q.correctAnswer}</p>
                    <form action={deleteQuestionAction} className="mt-2"><input type="hidden" name="questionId" value={q.id} /><SubmitButton variant="destructive" size="sm" pendingText="Deleting...">Delete</SubmitButton></form>
                  </div>
                ))}
              </div>

              {/* Add Question Form */}
              <form action={addQuestionAction} className="grid gap-3 md:grid-cols-2 rounded-lg bg-muted/50 p-4 border border-border">
                <input type="hidden" name="quizId" value={quiz.id} />
                <div className="md:col-span-2 font-semibold text-sm border-b pb-2">Add Question</div>
                <div className="md:col-span-2">
                  <Label>Question</Label>
                  <Input name="prompt" required />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select name="type">
                    <option value="MULTIPLE_CHOICE">Multiple choice</option>
                    <option value="TRUE_FALSE">True / false</option>
                    <option value="SHORT_ANSWER">Short answer</option>
                  </Select>
                </div>
                <div>
                  <Label>Correct answer</Label>
                  <Input name="correctAnswer" required />
                </div>
                <div className="md:col-span-2">
                  <Label>Options, one per line (for Multiple Choice)</Label>
                  <Textarea name="options" />
                </div>
                <div>
                  <Label>Points</Label>
                  <Input name="points" type="number" defaultValue={1} />
                </div>
                <div>
                  <Label>Order</Label>
                  <Input name="order" type="number" defaultValue={quiz.questions.length + 1} />
                </div>
                <div className="md:col-span-2 mt-2">
                  <SubmitButton size="sm" pendingText="Adding question...">Add question</SubmitButton>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
