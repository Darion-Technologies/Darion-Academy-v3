"use client";

import { useState } from "react";
import type { UnifiedNote } from "@/actions/notes";
import { format } from "date-fns";
import { BookOpen, PlaySquare, Calendar as CalendarIcon, ExternalLink, Filter, FileText, Plus, ChevronRight, MoreHorizontal, ChevronDown, Bold, Italic, Link as LinkIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Image as ImageIcon, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/generated/prisma";

interface NotesClientProps {
  notes: UnifiedNote[];
  user: { name: string; avatarUrl?: string | null; role: UserRole };
}

export function NotesClient({ notes, user }: NotesClientProps) {
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
    <div className="flex flex-col lg:flex-row h-full border border-border bg-background shadow-sm rounded-xl overflow-hidden">
      {/* Left Column: List View */}
      <div className="w-full lg:w-[360px] shrink-0 border-r border-border flex flex-col h-full bg-muted/5">
        
        <div className="p-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-medium tracking-tight text-foreground">My Notes</h1>
          </div>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 flex flex-col gap-2">
          {notes.map((note) => {
            const isActive = activeNote?.id === note.id;
            return (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={cn(
                  "flex flex-col text-left p-4 rounded-xl border transition-all duration-200",
                  isActive ? "bg-card border-border shadow-sm ring-1 ring-border" : "bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <span className="block text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2.5">
                  {format(new Date(note.updatedAt), "dd MMM")}
                </span>
                <h3 className="text-sm font-semibold text-foreground mb-1.5 leading-snug line-clamp-1">
                  {note.reference.title}
                </h3>
                <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed mb-3.5">
                  {note.content}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-muted/60 text-muted-foreground">
                    {note.type === "COURSE" ? "Lecture" : "Video"}
                  </span>
                  {note.reference.courseTitle && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-muted/60 text-muted-foreground truncate max-w-[140px]">
                      {note.reference.courseTitle}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Reading Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-card">
        {activeNote ? (
          <>
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 lg:px-10 py-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>My Notes</span>
                <ChevronRight className="size-3.5" />
                <span className="text-foreground font-medium">{activeNote.reference.courseTitle || activeNote.type}</span>
              </div>
              <button className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal className="size-5" />
              </button>
            </div>

            {/* Note Content */}
            <div className="flex-1 overflow-y-auto px-6 lg:px-16 xl:px-24 pb-24 no-scrollbar">
              <h1 className="text-3xl lg:text-[42px] font-bold text-foreground mb-8 tracking-tight leading-tight mt-4">
                {activeNote.reference.title}
              </h1>
              
              {/* Metadata Grid */}
              <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[140px_1fr] gap-y-4 gap-x-4 mb-8 text-[13px]">
                <div className="text-muted-foreground flex items-center">Created by</div>
                <div className="flex items-center gap-2.5 font-medium text-foreground">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} className="size-6 rounded-full object-cover shadow-sm" alt={user.name} />
                  ) : (
                    <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/20">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  {user.name}
                </div>
                
                <div className="text-muted-foreground flex items-center">Last Modified</div>
                <div className="font-medium text-foreground flex items-center">
                  {format(new Date(activeNote.updatedAt), "dd MMMM yyyy, HH:mm a")}
                </div>
                
                <div className="text-muted-foreground flex items-center">Tags</div>
                <div className="flex items-center flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-muted/50 text-[11px] font-medium text-muted-foreground border border-border/50">
                    {activeNote.type === "COURSE" ? "Lecture" : "Video"}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-muted/50 text-[11px] font-medium text-muted-foreground border border-border/50">
                    Productivity
                  </span>
                  {activeNote.reference.courseTitle && (
                    <span className="px-2.5 py-1 rounded-md bg-muted/50 text-[11px] font-medium text-muted-foreground border border-border/50">
                      {activeNote.reference.courseTitle}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full h-px bg-border/60 my-6"></div>

              {/* Note Body */}
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-p:leading-relaxed text-foreground/90">
                 <h2 className="text-xl font-bold mb-4 tracking-tight">Summary</h2>
                 <p className="text-[15px] leading-[1.8] whitespace-pre-wrap">{activeNote.content}</p>
                 
                 {activeNote.reference.thumbnailUrl && (
                   <div className="mt-8 rounded-xl overflow-hidden border border-border shadow-sm max-w-xl">
                     <img src={activeNote.reference.thumbnailUrl} alt="Reference" className="w-full h-auto object-cover" />
                   </div>
                 )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="size-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">Select a note to read</p>
          </div>
        )}
      </div>
    </div>
  );
}
