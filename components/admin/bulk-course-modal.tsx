"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Copy, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { bulkImportCourseAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { toast } from "sonner";

const JSON_TEMPLATE = `{
  "title": "Mastering React",
  "description": "A complete guide to React.",
  "category": "Engineering",
  "difficulty": "BEGINNER",
  "estimatedMinutes": 120,
  "status": "PUBLISHED",
  "modules": [
    {
      "title": "Module 1: Introduction",
      "description": "Basic concepts",
      "lessons": [
        {
          "title": "What is a component?",
          "type": "VIDEO",
          "videoUrl": "https://youtube.com/watch?v=xyz",
          "videoStartTime": 120,
          "videoEndTime": 300,
          "estimatedMinutes": 10
        },
        {
          "title": "React Basics Quiz",
          "type": "QUIZ",
          "estimatedMinutes": 15,
          "quiz": {
            "passMark": 80,
            "questions": [
              {
                "prompt": "What is a component?",
                "type": "MULTIPLE_CHOICE",
                "correctAnswer": "A building block",
                "options": "A building block\nA function\nA style"
              }
            ]
          }
        },
        {
          "title": "Final Project",
          "type": "ASSIGNMENT",
          "estimatedMinutes": 60,
          "assignment": {
            "instructions": "Build a small React app."
          }
        }
      ]
    }
  ]
}`;

export function BulkCourseModal() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(JSON_TEMPLATE);
    setCopied(true);
    toast.success("Template copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      const res = await bulkImportCourseAction(formData);
      if (res?.success) {
        toast.success("Course successfully imported!");
        setOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to import course. Please check your JSON format.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Import JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-none border-border">
        <DialogHeader>
          <DialogTitle>Bulk Import Course</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="bg-muted/30 p-4 border rounded-none text-sm">
            <div className="flex justify-between items-start mb-2">
              <p className="text-muted-foreground font-medium">Use the JSON format below to instantly create a course with all its modules and lessons.</p>
              <Button size="sm" variant="secondary" onClick={handleCopyTemplate} className="shrink-0 h-8 rounded-none">
                {copied ? <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Copied!" : "Copy Template"}
              </Button>
            </div>
            <pre className="text-[11px] font-mono overflow-x-auto bg-background p-3 border border-dashed text-foreground/80">
              {JSON_TEMPLATE}
            </pre>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Paste Course JSON Here</label>
              <Textarea 
                name="rawJson" 
                className="min-h-[300px] font-mono text-sm resize-y rounded-none" 
                placeholder="Paste your JSON here..."
                required
              />
            </div>
            <div className="flex justify-end pt-2">
              <SubmitButton pendingText="Importing Course..." className="rounded-none">Import Course</SubmitButton>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
