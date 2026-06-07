"use client";

import { useState, useTransition } from "react";
import { Clock, Plus, Trash2, LoaderCircle } from "lucide-react";
import { createVideoNoteAction, deleteVideoNoteAction } from "@/app/actions/learning";
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
};

export function VideoNotes({
  lessonId,
  currentProgress,
  notes,
  onSeekTo,
}: {
  lessonId: string;
  currentProgress: number;
  notes: VideoNoteItem[];
  onSeekTo: (time: number) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    
    const formData = new FormData();
    formData.set("lessonId", lessonId);
    formData.set("timestamp", Math.floor(currentProgress).toString());
    formData.set("text", newNoteText);

    startTransition(async () => {
      await createVideoNoteAction(formData);
      setNewNoteText("");
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

  return (
    <div className="flex flex-col h-full bg-muted/50 border-l">
      <div className="p-4 border-b bg-card flex items-center justify-between">
        <h3 className="font-bold text-foreground">My Notes</h3>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)} variant="outline" className="h-8 rounded-lg">
            <Plus className="size-4 mr-1" /> Add Note
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isAdding && (
          <Card className="border-blue-200 shadow-sm rounded-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-blue-600">
                <Clock className="size-3" />
                {formatTime(currentProgress)}
              </div>
              <Textarea 
                placeholder="What did you learn here?"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="min-h-[80px] text-sm resize-none rounded-lg"
                autoFocus
              />
              <div className="flex gap-2 mt-3 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="rounded-lg">Cancel</Button>
                <Button size="sm" onClick={handleAddNote} disabled={isPending || !newNoteText.trim()} className="rounded-lg">
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
            <Card key={note.id} className="group relative hover:border-blue-300 transition-colors rounded-lg shadow-sm cursor-pointer" onClick={() => onSeekTo(note.timestamp)}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                    <Clock className="size-3" /> {formatTime(note.timestamp)}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} 
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{note.text}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
