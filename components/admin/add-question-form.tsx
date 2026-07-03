"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { addQuestionAction } from "@/app/actions/admin";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRef } from "react";

export function AddQuestionForm({ quizId, nextOrder }: { quizId: string, nextOrder: number }) {
  const [type, setType] = useState("MULTIPLE_CHOICE");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState("True");
  
  const formRef = useRef<HTMLFormElement>(null);

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

      await addQuestionAction(formData);
      toast.success("Question added successfully.");
      
      // Reset form but keep type
      formRef.current?.reset();
      setOptions(["", "", "", ""]);
      setCorrectIndex(0);
      setCorrectAnswer("True");
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    }
  }

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
    <form ref={formRef} action={action} className="space-y-6 border p-6 bg-card rounded-md">
      <input type="hidden" name="quizId" value={quizId} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2 space-y-2">
          <Label>Question Prompt</Label>
          <Input name="prompt" required placeholder="What is the capital of..." className="h-10" />
        </div>
        
        <div className="space-y-2">
          <Label>Question Type</Label>
          <Select name="type" className="h-10" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="SHORT_ANSWER">Short Answer</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Points</Label>
            <Input name="points" type="number" defaultValue={1} className="h-10" min={0} />
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Input name="order" type="number" defaultValue={nextOrder} className="h-10" min={1} />
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        {type === "MULTIPLE_CHOICE" && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <Label>Options & Correct Answer</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setOptions([...options, ""])} className="h-8 text-xs">
                <Plus className="size-3 mr-1.5" /> Add Option
              </Button>
            </div>
            <div className="space-y-3">
              {options.map((opt, i) => (
                <div key={i} className={cn("flex items-center gap-3 p-2.5 border rounded-md transition-colors", correctIndex === i ? "bg-primary/5 border-primary/40 shadow-sm" : "bg-muted/10")}>
                  <div className="flex items-center justify-center pl-2">
                    <input 
                      type="radio" 
                      name="correctOptionRadioNew" 
                      checked={correctIndex === i} 
                      onChange={() => setCorrectIndex(i)} 
                      className="size-4 cursor-pointer"
                    />
                  </div>
                  <Input 
                    value={opt} 
                    onChange={(e) => updateOption(i, e.target.value)} 
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="flex-1 bg-background h-9"
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
          <div className="space-y-3 max-w-md">
            <Label>Correct Answer</Label>
            <div className="flex gap-4">
              <label className={cn("flex-1 flex items-center justify-center gap-2 p-3 border rounded-md cursor-pointer transition-colors", correctAnswer === "True" ? "bg-primary/10 border-primary font-medium text-primary shadow-sm" : "bg-muted/10 hover:bg-muted/30")}>
                <input type="radio" checked={correctAnswer === "True"} onChange={() => setCorrectAnswer("True")} className="hidden" />
                True
              </label>
              <label className={cn("flex-1 flex items-center justify-center gap-2 p-3 border rounded-md cursor-pointer transition-colors", correctAnswer === "False" ? "bg-primary/10 border-primary font-medium text-primary shadow-sm" : "bg-muted/10 hover:bg-muted/30")}>
                <input type="radio" checked={correctAnswer === "False"} onChange={() => setCorrectAnswer("False")} className="hidden" />
                False
              </label>
            </div>
          </div>
        )}

        {type === "SHORT_ANSWER" && (
          <div className="space-y-3 max-w-xl">
            <Label>Expected Answer</Label>
            <Input 
              value={correctAnswer} 
              onChange={(e) => setCorrectAnswer(e.target.value)} 
              placeholder="Type the exact expected answer..." 
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">This is used for automatic grading. You can enable manual review in settings if answers might vary.</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-end pt-4 border-t mt-6">
        <SubmitButton size="sm" pendingText="Adding question...">Add Question</SubmitButton>
      </div>
    </form>
  );
}
