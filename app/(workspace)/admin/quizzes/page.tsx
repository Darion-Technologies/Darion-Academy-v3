import { addQuestionAction, deleteQuestionAction, updateQuizSettingsAction, bulkImportQuestionsAction } from "@/app/actions/admin";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseSelector } from "@/components/admin/course-selector";
import { Settings, List, PlusCircle, Trash2, Clock, Target, CheckSquare } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminQuizzesPage({ searchParams }: { searchParams: Promise<{ courseId?: string }> }) {
  await requireRole("ADMIN");
  
  const courses = await prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" }
  });

  const resolvedSearchParams = await searchParams;
  const selectedCourseId = resolvedSearchParams.courseId || courses[0]?.id;

  const quizzes = await prisma.quiz.findMany({ 
    where: selectedCourseId ? { lesson: { module: { courseId: selectedCourseId } } } : undefined,
    include: { 
      questions: { orderBy: { order: "asc" } }, 
      lesson: { include: { module: { include: { course: true } } } } 
    } 
  });
  
  return (
    <>
      <PageHeader title="Quizzes" description="Manage quizzes, settings, and questions." />
      
      {courses.length > 0 && (
        <CourseSelector courses={courses} selectedCourseId={selectedCourseId} />
      )}

      {quizzes.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-none border border-dashed text-muted-foreground">
          No quizzes found for the selected course.
        </div>
      )}

      <div className="space-y-8">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="size-5 text-primary" />
                {quiz.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">
                {quiz.lesson.module.course.title} · {quiz.lesson.module.title} · {quiz.lesson.title}
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              
              {/* Settings Form */}
              <form action={updateQuizSettingsAction} className="mb-10 space-y-5">
                <input type="hidden" name="quizId" value={quiz.id} />
                <div className="flex items-center gap-2 font-semibold text-base">
                  <Settings className="size-5 text-muted-foreground" />
                  Quiz Settings
                </div>
                
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Pass Mark (%)</Label>
                    <Input name="passMark" type="number" defaultValue={quiz.passMark} required className="h-10 font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Max Attempts (Empty = ∞)</Label>
                    <Input name="maxAttempts" type="number" defaultValue={quiz.maxAttempts || ""} className="h-10 font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="size-4" /> Time Limit (Minutes)
                    </Label>
                    <Input name="timeLimit" type="number" defaultValue={quiz.timeLimit || ""} placeholder="No limit" className="h-10 font-medium" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-2">
                  <div className="flex items-center justify-between border rounded-none p-4 bg-muted/20">
                    <div className="space-y-0.5 pr-4">
                      <Label htmlFor={`strict-${quiz.id}`} className="text-base cursor-pointer">Strict Mode</Label>
                      <p className="text-sm text-muted-foreground">Prevent navigating away during the quiz.</p>
                    </div>
                    <Switch name="isStrict" id={`strict-${quiz.id}`} defaultChecked={quiz.isStrict} />
                  </div>

                  <div className="flex items-center justify-between border rounded-none p-4 bg-muted/20">
                    <div className="space-y-0.5 pr-4">
                      <Label htmlFor={`review-${quiz.id}`} className="text-base cursor-pointer">Manual Short Answer Grading</Label>
                      <p className="text-sm text-muted-foreground">Short answers will require manual verification later.</p>
                    </div>
                    <Switch name="requireShortAnswerReview" id={`review-${quiz.id}`} defaultChecked={quiz.requireShortAnswerReview} />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <SubmitButton size="sm" pendingText="Saving...">Save Settings</SubmitButton>
                </div>
              </form>

              <Separator className="my-8" />

              {/* Questions List */}
              <div className="mb-8 space-y-4">
                <div className="flex items-center gap-2 font-semibold text-base mb-4">
                  <List className="size-5 text-muted-foreground" />
                  Questions ({quiz.questions.length})
                </div>
                
                <div className="space-y-3">
                  {quiz.questions.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic border border-dashed p-6 text-center">No questions added yet.</div>
                  ) : (
                    quiz.questions.map((q) => (
                      <div key={q.id} className="group relative flex flex-col gap-3 border p-4 hover:border-foreground/20 transition-colors bg-card">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Badge variant="neutral" className="font-mono text-xs px-1.5 py-0">#{q.order}</Badge>
                              <b className="text-sm font-medium">{q.prompt}</b>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="neutral" className="text-[10px] font-normal uppercase tracking-wider">{q.type.replace('_', ' ')}</Badge>
                              <span>·</span>
                              <span className="font-medium text-foreground/80">{q.points} {q.points === 1 ? 'pt' : 'pts'}</span>
                            </div>
                          </div>
                          <form action={deleteQuestionAction}>
                            <input type="hidden" name="questionId" value={q.id} />
                            <SubmitButton variant="ghost" size="icon" pendingText="..." className="text-destructive hover:text-destructive hover:bg-destructive/10 size-8 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="size-4" />
                            </SubmitButton>
                          </form>
                        </div>
                        
                        <div className="text-sm bg-muted/40 p-2.5 border border-dashed flex items-start gap-2">
                          <CheckSquare className="size-4 text-success shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mr-2">Answer:</span>
                            <span className="font-medium">{q.correctAnswer}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Question Form */}
              <div className="border bg-card shadow-sm mt-8 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="p-6">
                  <Tabs defaultValue="single" className="w-full">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 font-semibold text-base">
                        <PlusCircle className="size-5 text-primary" />
                        Add Questions
                      </div>
                      <TabsList>
                        <TabsTrigger value="single">Single</TabsTrigger>
                        <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="single" className="space-y-5">
                      <form action={addQuestionAction} className="space-y-5">
                        <input type="hidden" name="quizId" value={quiz.id} />
                        
                        <div className="grid gap-5 md:grid-cols-2">
                          <div className="md:col-span-2 space-y-2">
                            <Label>Question Prompt</Label>
                            <Input name="prompt" required placeholder="What is the capital of..." className="h-10" />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Question Type</Label>
                            <Select name="type" className="h-10">
                              <option value="MULTIPLE_CHOICE">Multiple choice</option>
                              <option value="TRUE_FALSE">True / false</option>
                              <option value="SHORT_ANSWER">Short answer</option>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Correct Answer</Label>
                            <Input name="correctAnswer" required placeholder="e.g. Paris, True, etc." className="h-10" />
                          </div>
                          
                          <div className="md:col-span-2 space-y-2">
                            <Label>Options (One per line) <span className="text-xs font-normal text-muted-foreground ml-1">- For Multiple Choice only</span></Label>
                            <Textarea name="options" className="min-h-[100px] resize-y" placeholder="Option A&#10;Option B&#10;Option C" />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Points</Label>
                            <Input name="points" type="number" defaultValue={1} className="h-10" />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Order / Position</Label>
                            <Input name="order" type="number" defaultValue={quiz.questions.length + 1} className="h-10" />
                          </div>
                        </div>
                        
                        <div className="flex justify-end pt-2">
                          <SubmitButton size="sm" pendingText="Adding question...">Add Question</SubmitButton>
                        </div>
                      </form>
                    </TabsContent>

                    <TabsContent value="bulk" className="space-y-5">
                      <form action={bulkImportQuestionsAction} className="space-y-4">
                        <input type="hidden" name="quizId" value={quiz.id} />
                        <div className="bg-muted/40 p-4 border text-sm text-muted-foreground space-y-2">
                          <p className="font-semibold text-foreground">How to format your questions (Aiken Format):</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>The first line is the question prompt.</li>
                            <li>Options must start with an uppercase letter followed by a parenthesis or dot (e.g. <code>A)</code> or <code>A.</code>).</li>
                            <li>The correct answer must be on a new line starting with <code>ANSWER:</code></li>
                            <li>Separate questions with a blank line.</li>
                          </ul>
                          <div className="bg-background border p-2 mt-2 font-mono text-xs">
                            What is the capital of France?<br/>
                            A) Rome<br/>
                            B) Paris<br/>
                            C) Berlin<br/>
                            ANSWER: B
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Paste Questions</Label>
                          <Textarea 
                            name="rawText" 
                            required 
                            placeholder="Paste your questions here..." 
                            className="min-h-[300px] font-mono text-sm resize-y" 
                          />
                        </div>
                        
                        <div className="flex justify-end pt-2">
                          <SubmitButton size="sm" pendingText="Importing...">Import Questions</SubmitButton>
                        </div>
                      </form>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
