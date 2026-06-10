"use client";

import { useState } from "react";
import { createShortQuizAction, deleteShortQuizAction } from "@/actions/shorts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export function ShortQuizBuilder({ shortId, existingQuizzes }: { shortId: string, existingQuizzes: any[] }) {
  const [quizzes, setQuizzes] = useState(existingQuizzes);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    answer: "A",
    explanation: ""
  });

  async function handleAddQuiz(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createShortQuizAction(shortId, formData);
      if (res.success) {
        toast.success("Quiz added!");
        setQuizzes([...quizzes, res.quiz]);
        setIsAdding(false);
        setFormData({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", answer: "A", explanation: "" });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(quizId: string) {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await deleteShortQuizAction(quizId, shortId);
      toast.success("Quiz deleted");
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Quizzes</h3>
          <p className="text-sm text-muted-foreground">Add simple multiple choice questions for this short.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Quiz
          </Button>
        )}
      </div>

      {quizzes.length === 0 && !isAdding && (
        <div className="text-center p-8 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">No quizzes added yet.</p>
        </div>
      )}

      {quizzes.map((q, idx) => (
        <Card key={q.id} className="relative">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-start gap-2">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm">Q{idx + 1}</span>
              {q.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className={`p-2 rounded border ${q.answer === 'A' ? 'bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : ''}`}>A: {q.optionA}</div>
            <div className={`p-2 rounded border ${q.answer === 'B' ? 'bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : ''}`}>B: {q.optionB}</div>
            <div className={`p-2 rounded border ${q.answer === 'C' ? 'bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : ''}`}>C: {q.optionC}</div>
            <div className={`p-2 rounded border ${q.answer === 'D' ? 'bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : ''}`}>D: {q.optionD}</div>
            {q.explanation && (
              <p className="mt-4 text-xs text-muted-foreground border-l-2 pl-2 italic">{q.explanation}</p>
            )}
          </CardContent>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => handleDelete(q.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </Card>
      ))}

      {isAdding && (
        <Card className="border-primary/50 shadow-sm">
          <form onSubmit={handleAddQuiz}>
            <CardHeader>
              <CardTitle className="text-lg">New Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question Prompt</Label>
                <Textarea 
                  required
                  placeholder="e.g. What does `useState` return?"
                  value={formData.question}
                  onChange={e => setFormData({...formData, question: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Option A</Label>
                  <Input required value={formData.optionA} onChange={e => setFormData({...formData, optionA: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Option B</Label>
                  <Input required value={formData.optionB} onChange={e => setFormData({...formData, optionB: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Option C</Label>
                  <Input required value={formData.optionC} onChange={e => setFormData({...formData, optionC: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Option D</Label>
                  <Input required value={formData.optionD} onChange={e => setFormData({...formData, optionD: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Select value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})}>
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Explanation (Optional)</Label>
                <Textarea 
                  placeholder="Why is this the correct answer?"
                  value={formData.explanation}
                  onChange={e => setFormData({...formData, explanation: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 bg-muted/30 py-3">
              <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Question
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
