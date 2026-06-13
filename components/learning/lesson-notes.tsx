"use client";

import { useState, useTransition } from "react";
import { Clock, Plus, Trash2, LoaderCircle, HelpCircle, CheckCircle2, MessageSquareReply } from "lucide-react";
import { createVideoNoteAction, deleteVideoNoteAction, replyToDoubtAction } from "@/app/actions/learning";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export type VideoNoteItem = {
  id: string;
  timestamp: number;
  text: string;
  isDoubt: boolean;
  resolved: boolean;
  mentorReply?: string | null;
  repliedAt?: Date | null;
};

import { useLesson } from "./lesson-context";

export function LessonNotes({
  lessonId,
  notes,
  isMentor = false,
}: {
  lessonId: string;
  notes: VideoNoteItem[];
  isMentor?: boolean;
}) {
  const { currentTimestamp, seekTo } = useLesson();
  const [isAdding, setIsAdding] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [isDoubt, setIsDoubt] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    
    const formData = new FormData();
    formData.set("lessonId", lessonId);
    formData.set("timestamp", Math.floor(currentTimestamp).toString());
    formData.set("text", newNoteText);
    formData.set("isDoubt", isDoubt ? "true" : "false");

    startTransition(async () => {
      await createVideoNoteAction(formData);
      setNewNoteText("");
      setIsDoubt(false);
      setIsAdding(false);
    });
  };

  const handleDelete = (noteId: string) => {
    if (!confirm("Delete this note?")) return;
    const formData = new FormData();
    formData.set("noteId", noteId);
    startTransition(() => {
      deleteVideoNoteAction(formData);
    });
  };

  const handleReply = (noteId: string) => {
    if (!replyText.trim()) return;
    const formData = new FormData();
    formData.set("noteId", noteId);
    formData.set("text", replyText);
    startTransition(async () => {
      await replyToDoubtAction(formData);
      setReplyingTo(null);
      setReplyText("");
    });
  };

  return (
    <div className="flex flex-col h-full bg-muted/50 border border-border shadow-sm overflow-hidden mt-6">
      <div className="p-4 border-b bg-card flex items-center justify-between">
        <h3 className="font-bold text-foreground">{isMentor ? "Learner Notes & Doubts" : "My Notes"}</h3>
        {!isAdding && !isMentor && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => { setIsDoubt(false); setIsAdding(true); }} variant="outline" className="h-8">
              <Plus className="size-4 mr-1" /> Add Note
            </Button>
            <Button size="sm" onClick={() => { setIsDoubt(true); setIsAdding(true); }} variant="default" className="h-8 bg-amber-600 hover:bg-amber-700 text-white">
              <HelpCircle className="size-4 mr-1" /> Ask Mentor
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isAdding && (
          <Card className="border-blue-200 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-blue-600">
                <Clock className="size-3" />
                {formatTime(currentTimestamp)}
              </div>
              <Textarea 
                placeholder={isDoubt ? "What do you need help with from your mentor?" : "What did you learn here?"}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="min-h-[80px] text-sm resize-none"
                autoFocus
              />
              <div className="flex items-center mt-3 mb-1">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isDoubt} 
                    onChange={(e) => setIsDoubt(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  Ask Mentor (Flag as Doubt)
                </label>
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="">Cancel</Button>
                <Button size="sm" onClick={handleAddNote} disabled={isPending || !newNoteText.trim()} className="">
                  {isPending ? <LoaderCircle className="size-4 animate-spin" /> : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {notes.length === 0 && !isAdding ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <p>No notes yet.</p>
            <p className="mt-1 text-muted-foreground">Add timestamped notes while you watch.</p>
          </div>
        ) : (
          notes.sort((a, b) => a.timestamp - b.timestamp).map((note) => (
            <Card key={note.id} className={`group relative transition-colors shadow-sm cursor-pointer ${note.isDoubt ? (note.resolved ? 'border-emerald-200 bg-emerald-50/30' : 'border-amber-300 bg-amber-50/50 hover:border-amber-400') : 'hover:border-blue-300'}`} onClick={() => seekTo(note.timestamp)}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    {note.timestamp > 0 && (
                      <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                        <Clock className="size-3" /> {formatTime(note.timestamp)}
                      </span>
                    )}
                    {note.isDoubt && (
                      <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${note.resolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {note.resolved ? <CheckCircle2 className="size-3" /> : <HelpCircle className="size-3" />}
                        {note.resolved ? 'Resolved' : 'Mentor Question'}
                      </span>
                    )}
                  </div>
                  {!isMentor && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} 
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all p-1 -mt-1 -mr-1"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{note.text}</p>
                
                {note.mentorReply && (
                  <div className="mt-2 pl-3 ml-1 border-l-2 border-emerald-300 bg-emerald-50/50 p-2">
                    <p className="text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1">
                      <MessageSquareReply className="size-3" /> Mentor Reply
                    </p>
                    <p className="text-sm text-emerald-900 whitespace-pre-wrap">{note.mentorReply}</p>
                  </div>
                )}
                
                {isMentor && note.isDoubt && !note.resolved && replyingTo !== note.id && (
                  <Button size="sm" variant="outline" className="mt-2 w-full text-xs h-7" onClick={(e) => { e.stopPropagation(); setReplyingTo(note.id); }}>
                    Reply to Doubt
                  </Button>
                )}
                
                {isMentor && replyingTo === note.id && (
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <Textarea 
                      placeholder="Type your response..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[80px] text-sm resize-none bg-white"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => { setReplyingTo(null); setReplyText(""); }} className="h-7 text-xs">Cancel</Button>
                      <Button size="sm" onClick={() => handleReply(note.id)} disabled={isPending || !replyText.trim()} className="h-7 text-xs">
                        {isPending ? <LoaderCircle className="size-3 animate-spin" /> : "Send Reply"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
