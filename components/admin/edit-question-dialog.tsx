"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/submit-button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { updateQuestionAction } from "@/app/actions/admin";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function EditQuestionDialog({ question }: { question: any }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(question.type);
  
  const initialOptions = Array.isArray(question.options) && question.options.length > 0 
    ? question.options 
    : ["", "", "", ""];
  const [options, setOptions] = useState<string[]>(initialOptions);
  
  const initialIndex = initialOptions.indexOf(question.correctAnswer);
  const [correctIndex, setCorrectIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer);

  async function action(formData: FormData) {
    try {
      if (type === "MULTIPLE_CHOICE") {
        const validOptions = options.map(o => o.trim()).filter(Boolean);
        if (validOptions.length < 2) throw new Error("Please provide at least 2 options.");
        
        const finalCorrectAnswer = options[correctIndex]?.trim();
        if (!finalCorrectAnswer) throw new Error("The selected correct answer cannot be empty.");
        
        formData.set("correctAnswer", finalCorrectAnswer);
        formData.set("options", validOptions.join("\n"));
      } else if (type === "TRUE_FALSE") {
        formData.set("correctAnswer", correctAnswer);
        formData.set("options", "");
      } else {
        if (!correctAnswer.trim()) throw new Error("Please provide a correct answer.");
        formData.set("correctAnswer", correctAnswer.trim());
        formData.set("options", "");
      }

      await updateQuestionAction(formData);
      setOpen(false);
      toast.success("Question updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Reset state to current question when opened
      setType(question.type);
      setOptions(Array.isArray(question.options) && question.options.length > 0 ? question.options : ["", "", "", ""]);
      setCorrectAnswer(question.correctAnswer);
      const idx = (question.options || []).indexOf(question.correctAnswer);
      setCorrectIndex(idx >= 0 ? idx : 0);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    if (correctIndex === index) setCorrectIndex(0);
    else if (correctIndex > index) setCorrectIndex(correctIndex - 1);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 size-8 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-6 pt-4">
          <input type="hidden" name="questionId" value={question.id} />
          
          <div className="space-y-2">
            <Label>Question Prompt</Label>
            <Input name="prompt" defaultValue={question.prompt} required />
          </div>
          
          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select name="type" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="TRUE_FALSE">True / False</option>
                <option value="SHORT_ANSWER">Short Answer</option>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Points</Label>
              <Input name="points" type="number" defaultValue={question.points} required min={0} />
            </div>
          </div>
          
          <div className="pt-2 border-t">
            {type === "MULTIPLE_CHOICE" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Options & Correct Answer</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setOptions([...options, ""])} className="h-7 text-xs">
                    <Plus className="size-3 mr-1" /> Add Option
                  </Button>
                </div>
                <div className="space-y-3">
                  {options.map((opt, i) => (
                    <div key={i} className={cn("flex items-center gap-3 p-2 border rounded-md transition-colors", correctIndex === i ? "bg-primary/5 border-primary/30" : "bg-card")}>
                      <div className="flex items-center justify-center pl-2">
                        <input 
                          type="radio" 
                          name="correctOptionRadio" 
                          checked={correctIndex === i} 
                          onChange={() => setCorrectIndex(i)} 
                          className="size-4 cursor-pointer"
                        />
                      </div>
                      <Input 
                        value={opt} 
                        onChange={(e) => updateOption(i, e.target.value)} 
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1 bg-background"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(i)} disabled={options.length <= 2} className="size-8 text-muted-foreground hover:text-destructive shrink-0">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer.</p>
              </div>
            )}

            {type === "TRUE_FALSE" && (
              <div className="space-y-3">
                <Label>Correct Answer</Label>
                <div className="flex gap-4">
                  <label className={cn("flex-1 flex items-center justify-center gap-2 p-3 border rounded-md cursor-pointer transition-colors", correctAnswer === "True" ? "bg-primary/10 border-primary font-medium text-primary" : "hover:bg-muted")}>
                    <input type="radio" checked={correctAnswer === "True"} onChange={() => setCorrectAnswer("True")} className="hidden" />
                    True
                  </label>
                  <label className={cn("flex-1 flex items-center justify-center gap-2 p-3 border rounded-md cursor-pointer transition-colors", correctAnswer === "False" ? "bg-primary/10 border-primary font-medium text-primary" : "hover:bg-muted")}>
                    <input type="radio" checked={correctAnswer === "False"} onChange={() => setCorrectAnswer("False")} className="hidden" />
                    False
                  </label>
                </div>
              </div>
            )}

            {type === "SHORT_ANSWER" && (
              <div className="space-y-3">
                <Label>Expected Answer</Label>
                <Input 
                  value={correctAnswer} 
                  onChange={(e) => setCorrectAnswer(e.target.value)} 
                  placeholder="Type the exact expected answer..." 
                />
                <p className="text-xs text-muted-foreground">This is used for automatic grading. You can enable manual review in settings if answers might vary.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4 border-t mt-6">
            <SubmitButton pendingText="Saving...">Save Changes</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

