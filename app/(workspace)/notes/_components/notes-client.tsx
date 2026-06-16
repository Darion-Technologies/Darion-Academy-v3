"use client";

import { useState } from "react";
import type { UnifiedNote } from "@/actions/notes";
import { format } from "date-fns";
import { BookOpen, PlaySquare, Calendar, ExternalLink, Filter, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NotesClientProps {
  notes: UnifiedNote[];
}

export function NotesClient({ notes }: NotesClientProps) {
  const [filter, setFilter] = useState<"ALL" | "COURSE" | "SHORT">("ALL");
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes.length > 0 ? notes[0].id : null);

  const filteredNotes = notes.filter((n) => filter === "ALL" || n.type === filter);
  const activeNote = notes.find((n) => n.id === activeNoteId) || filteredNotes[0];

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-none bg-card/50">
        <FileText className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-[13px] font-bold uppercase tracking-wider">No notes yet</h3>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-sm text-center">
          You haven't taken any notes yet. Notes you take in courses and tech shorts will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)] border border-border bg-card">
      {/* Left Column: List View */}
      <div className="w-full lg:w-[380px] shrink-0 border-r border-border flex flex-col h-full bg-muted/10">
        {/* Filter Bar */}
        <div className="flex items-center gap-2 p-2 border-b border-border bg-card">
          <Filter className="size-3.5 text-muted-foreground ml-1" />
          <button
            onClick={() => setFilter("ALL")}
            className={cn(
              "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-none border transition-colors",
              filter === "ALL" ? "bg-sidebar-accent text-sidebar-foreground border-border" : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter("COURSE")}
            className={cn(
              "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-none border transition-colors",
              filter === "COURSE" ? "bg-sidebar-accent text-sidebar-foreground border-border" : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
            )}
          >
            Courses
          </button>
          <button
            onClick={() => setFilter("SHORT")}
            className={cn(
              "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-none border transition-colors",
              filter === "SHORT" ? "bg-sidebar-accent text-sidebar-foreground border-border" : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
            )}
          >
            Shorts
          </button>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
          {filteredNotes.map((note) => {
            const isActive = activeNote?.id === note.id;
            return (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={cn(
                  "flex flex-col text-left p-3 border-b border-border transition-colors",
                  isActive ? "bg-card border-l-2 border-l-primary" : "hover:bg-muted/30 border-l-2 border-l-transparent"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {note.type === "COURSE" ? (
                      <BookOpen className="size-3 text-primary" />
                    ) : (
                      <PlaySquare className="size-3 text-orange-500" />
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      {note.type}
                    </span>
                  </div>
                  <span className="text-[9px] font-semibold text-muted-foreground">
                    {format(new Date(note.updatedAt), "MMM d, yyyy")}
                  </span>
                </div>
                <span className="text-[12px] font-bold leading-tight mb-1 line-clamp-1">
                  {note.reference.title}
                </span>
                <span className="text-[11px] text-muted-foreground line-clamp-2">
                  {note.content}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Reading Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-card">
        {activeNote ? (
          <>
            {/* Header / Meta */}
            <div className="p-4 lg:p-6 border-b border-border flex flex-col gap-4 bg-muted/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border rounded-none",
                      activeNote.type === "COURSE" ? "bg-primary/10 text-primary border-primary/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                    )}>
                      {activeNote.type} NOTE
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3" />
                      Last updated {format(new Date(activeNote.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-black tracking-tight mb-1">
                    {activeNote.reference.title}
                  </h2>
                  {activeNote.reference.courseTitle && (
                    <p className="text-sm font-semibold text-muted-foreground">
                      from {activeNote.reference.courseTitle}
                    </p>
                  )}
                </div>
                
                {activeNote.reference.thumbnailUrl && (
                  <div className="hidden sm:block shrink-0 border border-border w-[120px] h-[68px] overflow-hidden bg-muted relative">
                    <img src={activeNote.reference.thumbnailUrl} alt="" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>

              <Link 
                href={activeNote.reference.url}
                className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-none w-fit mt-2"
              >
                Go to source
                <ExternalLink className="size-3" />
              </Link>
            </div>

            {/* Note Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 no-scrollbar">
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border">
                <p className="text-[14px] whitespace-pre-wrap">{activeNote.content}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs uppercase tracking-wider font-bold">
            Select a note to read
          </div>
        )}
      </div>
    </div>
  );
}
