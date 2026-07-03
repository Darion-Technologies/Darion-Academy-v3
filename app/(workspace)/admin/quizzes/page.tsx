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
import { EditQuestionDialog } from "@/components/admin/edit-question-dialog";
import { AddQuestionForm } from "@/components/admin/add-question-form";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminQuizzesPage({ searchParams }: { searchParams: Promise<{ courseId?: string, quizId?: string }> }) {
  await requireRole("ADMIN");
  
  const courses = await prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" }
  });

  const resolvedSearchParams = await searchParams;
  const selectedCourseId = resolvedSearchParams.courseId || courses[0]?.id;
  const selectedQuizId = resolvedSearchParams.quizId;

  const quizzes = await prisma.quiz.findMany({ 
    where: selectedCourseId ? { lesson: { module: { courseId: selectedCourseId } } } : undefined,
    include: { 
      questions: { orderBy: { order: "asc" } }, 
      lesson: { include: { module: { include: { course: true } } } } 
    } 
  });

  const selectedQuiz = selectedQuizId ? quizzes.find(q => q.id === selectedQuizId) : quizzes[0];
  
  return (
    <>
      <PageHeader title="Quizzes" description="Manage quizzes, settings, and questions." />
      
      {courses.length > 0 && (
        <CourseSelector courses={courses} selectedCourseId={selectedCourseId} />
      )}

      <div className="grid lg:grid-cols-4 gap-6 items-start mt-6">
        {/* Sidebar: List of Quizzes */}
        <div className="lg:col-span-1 space-y-2 sticky top-6">
          <h3 className="font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wider">Course Quizzes</h3>
          {quizzes.map(quiz => (
            <Link 
              key={quiz.id} 
              href={`?courseId=${selectedCourseId}&quizId=${quiz.id}`} 
              className={cn(
                "block p-4 border text-sm transition-colors group", 
                selectedQuiz?.id === quiz.id 
                  ? "bg-primary/5 border-primary shadow-sm" 
                  : "hover:border-primary/50 bg-card hover:shadow-sm"
              )}
            >
              <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{quiz.title}</div>
              <div className="text-xs text-muted-foreground mt-1 truncate">
                {quiz.lesson.module.title}
              </div>
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                <Badge variant="neutral" className="text-[10px]">{quiz.questions.length} Qs</Badge>
                {quiz.isStrict && <Badge variant="neutral" className="text-[10px]">Strict</Badge>}
              </div>
            </Link>
          ))}
          {quizzes.length === 0 && (
            <div className="text-sm text-muted-foreground border border-dashed p-6 text-center bg-card">
              No quizzes found for the selected course.
            </div>
          )}
        </div>

        {/* Main Detail Area */}
        <div className="lg:col-span-3">
          {selectedQuiz ? (
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="size-5 text-primary" />
                  {selectedQuiz.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium">
                  {selectedQuiz.lesson.module.course.title} <span className="mx-1">/</span> {selectedQuiz.lesson.module.title} <span className="mx-1">/</span> {selectedQuiz.lesson.title}
                </p>
              </CardHeader>
              <CardContent className="pt-0 px-0">
                <Tabs defaultValue="questions" className="w-full">
                  <div className="px-6 border-b bg-muted/10">
                    <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
                      <TabsTrigger value="questions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 h-full">
                        Questions ({selectedQuiz.questions.length})
                      </TabsTrigger>
                      <TabsTrigger value="add" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 h-full">
                        Add Questions
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 h-full">
                        Settings
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Questions List */}
                  <TabsContent value="questions" className="p-6 m-0 space-y-4">
                    {selectedQuiz.questions.length === 0 ? (
                      <div className="text-sm text-muted-foreground italic border border-dashed p-10 text-center bg-muted/10">
                        No questions added yet. Go to the 'Add Questions' tab to get started.
                      </div>
                    ) : (
                      selectedQuiz.questions.map((q) => (
                        <div key={q.id} className="group relative flex flex-col gap-3 border p-5 hover:border-foreground/20 transition-colors bg-card shadow-sm">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="neutral" className="font-mono text-xs px-1.5 py-0">#{q.order}</Badge>
                                <b className="text-base font-medium">{q.prompt}</b>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="neutral" className="text-[10px] font-normal uppercase tracking-wider bg-muted/50">{q.type.replace('_', ' ')}</Badge>
                                <span>·</span>
                                <span className="font-medium text-foreground/80">{q.points} {q.points === 1 ? 'pt' : 'pts'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <EditQuestionDialog question={q} />
                              <form action={deleteQuestionAction}>
                                <input type="hidden" name="questionId" value={q.id} />
                                <SubmitButton variant="ghost" size="icon" pendingText="..." className="text-destructive hover:text-destructive hover:bg-destructive/10 size-8 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                                  <Trash2 className="size-4" />
                                </SubmitButton>
                              </form>
                            </div>
                          </div>
                          
                          <div className="text-sm bg-muted/20 p-3 border border-dashed flex items-start gap-2 mt-2">
                            <CheckSquare className="size-4 text-success shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mr-2">Answer:</span>
                              <span className="font-medium">{q.correctAnswer}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  {/* Add Questions Tab */}
                  <TabsContent value="add" className="p-6 m-0">
                    <Tabs defaultValue="single" className="w-full">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 font-semibold text-base">
                          <PlusCircle className="size-5 text-primary" />
                          Add to Quiz
                        </div>
                        <TabsList className="h-9">
                          <TabsTrigger value="single" className="text-xs">Single</TabsTrigger>
                          <TabsTrigger value="bulk" className="text-xs">Bulk Import</TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="single" className="space-y-5">
                        <AddQuestionForm quizId={selectedQuiz.id} nextOrder={selectedQuiz.questions.length + 1} />
                      </TabsContent>

                      <TabsContent value="bulk" className="space-y-5">
                        <form action={bulkImportQuestionsAction} className="space-y-4 border p-5 bg-card">
                          <input type="hidden" name="quizId" value={selectedQuiz.id} />
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
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="p-6 m-0">
                    <form action={updateQuizSettingsAction} className="space-y-6">
                      <input type="hidden" name="quizId" value={selectedQuiz.id} />
                      
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Pass Mark (%)</Label>
                          <Input name="passMark" type="number" defaultValue={selectedQuiz.passMark} required className="h-10 font-medium" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Max Attempts (Empty = ∞)</Label>
                          <Input name="maxAttempts" type="number" defaultValue={selectedQuiz.maxAttempts || ""} className="h-10 font-medium" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground flex items-center gap-1.5">
                            <Clock className="size-4" /> Time Limit (Minutes)
                          </Label>
                          <Input name="timeLimit" type="number" defaultValue={selectedQuiz.timeLimit || ""} placeholder="No limit" className="h-10 font-medium" />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 mt-4">
                        <div className="flex items-center justify-between border rounded-none p-5 bg-muted/10 hover:bg-muted/20 transition-colors">
                          <div className="space-y-1 pr-4">
                            <Label htmlFor={`strict-${selectedQuiz.id}`} className="text-base cursor-pointer">Strict Mode</Label>
                            <p className="text-sm text-muted-foreground">Prevent navigating away during the quiz.</p>
                          </div>
                          <Switch name="isStrict" id={`strict-${selectedQuiz.id}`} defaultChecked={selectedQuiz.isStrict} />
                        </div>

                        <div className="flex items-center justify-between border rounded-none p-5 bg-muted/10 hover:bg-muted/20 transition-colors">
                          <div className="space-y-1 pr-4">
                            <Label htmlFor={`review-${selectedQuiz.id}`} className="text-base cursor-pointer">Manual Grading</Label>
                            <p className="text-sm text-muted-foreground">Short answers will require manual verification.</p>
                          </div>
                          <Switch name="requireShortAnswerReview" id={`review-${selectedQuiz.id}`} defaultChecked={selectedQuiz.requireShortAnswerReview} />
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4 border-t mt-6">
                        <SubmitButton size="sm" pendingText="Saving...">Save Settings</SubmitButton>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="flex h-[500px] flex-col items-center justify-center border border-dashed text-muted-foreground bg-card">
              <Target className="size-10 mb-4 opacity-20" />
              <p>Select a quiz from the list to view its details.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
