"use client";

import { useState } from "react";
import { YouTubeShort } from "@/generated/prisma";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Play, PenLine, Loader2, ExternalLink, Save } from "lucide-react";
import { saveShortNoteAction, getShortNoteAction } from "@/actions/shorts";
import { toast } from "sonner";
import Link from "next/link";

export function SavedShortsClient({ initialShorts, userId }: { initialShorts: YouTubeShort[], userId: string }) {
  const [selectedShort, setSelectedShort] = useState<YouTubeShort | null>(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [currentNotes, setCurrentNotes] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  async function handleOpenNotes(short: YouTubeShort) {
    setSelectedShort(short);
    setNotesModalOpen(true);
    setLoadingNotes(true);
    setCurrentNotes("");

    try {
      const existing = await getShortNoteAction(short.id, userId);
      if (existing) {
        setCurrentNotes(existing.content);
      }
    } catch (error: any) {
      toast.error("Failed to load notes.");
    } finally {
      setLoadingNotes(false);
    }
  }

  async function handleSaveNotes() {
    if (!selectedShort) return;
    setIsSaving(true);
    try {
      await saveShortNoteAction(selectedShort.id, userId, currentNotes || "");
      toast.success("Notes saved successfully!");
      setNotesModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save notes.");
    } finally {
      setIsSaving(false);
    }
  }

  if (initialShorts.length === 0) {
    return (
      <div className="text-center py-16 bg-card border border-border shadow-sm">
        <h3 className="text-lg font-semibold mb-2 text-foreground">No saved shorts yet</h3>
        <p className="text-sm text-muted-foreground mb-6">Explore the Technical Shorts feed and bookmark videos to review later.</p>
        <Button asChild className="font-semibold">
          <Link href="/dashboard/shorts">Go to Shorts Feed</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {initialShorts.map(short => (
          <div key={short.id} className="bg-card border border-border hover:border-primary/50 transition-colors flex h-28 group shadow-sm">
            <div className="relative w-20 bg-muted shrink-0 overflow-hidden cursor-pointer" onClick={() => handleOpenNotes(short)}>
              {short.thumbnailUrl ? (
                <img src={short.thumbnailUrl} alt={short.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 text-[9px] font-medium text-white shadow-sm">
                {short.durationSeconds}s
              </div>
            </div>
            
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">@{short.channelName}</span>
                  <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 uppercase tracking-wider border border-border">{short.category}</span>
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 text-foreground leading-tight" title={short.title}>{short.title}</h3>
              </div>
              
              <div className="flex justify-end mt-2">
                <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent text-muted-foreground hover:text-foreground gap-1.5" onClick={() => handleOpenNotes(short)}>
                  <PenLine className="w-3 h-3" /> My Notes
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={notesModalOpen} onOpenChange={setNotesModalOpen}>
        <DialogContent className="sm:max-w-[650px] bg-card border-border text-foreground p-0 overflow-hidden shadow-lg">
          <div className="border-b border-border bg-muted/50 p-4">
            <DialogTitle className="text-lg flex items-center gap-2 font-bold tracking-tight text-foreground">
              <PenLine className="w-4 h-4 text-primary" /> 
              STUDY NOTES
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">
              TARGET: <span className="text-foreground">{selectedShort?.title}</span>
            </DialogDescription>
          </div>
          
          <div className="p-4 bg-card">
            {loadingNotes ? (
              <div className="h-[350px] flex items-center justify-center border border-border bg-muted/30">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              </div>
            ) : (
              <Textarea 
                placeholder="Document your technical takeaways here..."
                value={currentNotes || ""}
                onChange={(e) => setCurrentNotes(e.target.value)}
                className="h-[350px] bg-background border-border resize-none text-foreground placeholder:text-muted-foreground custom-scrollbar focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 text-sm shadow-inner"
              />
            )}
          </div>
          
          <div className="flex justify-between items-center p-4 border-t border-border bg-muted/50">
            {selectedShort && (
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs font-semibold uppercase tracking-wider" asChild>
                <a href={`https://youtube.com/shorts/${selectedShort.youtubeVideoId}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1.5" /> Source
                </a>
              </Button>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider" onClick={() => setNotesModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold uppercase tracking-wider" onClick={handleSaveNotes} disabled={loadingNotes || isSaving}>
                {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Save className="w-3 h-3 mr-1.5" />}
                Save Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
