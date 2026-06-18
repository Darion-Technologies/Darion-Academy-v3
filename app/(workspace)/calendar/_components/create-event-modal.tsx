"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createPersonalEventAction } from "@/app/actions/calendar";
import { Calendar, Clock, Link as LinkIcon, Box, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEventModal({ open, onOpenChange }: CreateEventModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateStr, setDateStr] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    setLoading(true);
    try {
      await createPersonalEventAction({ title, description, date: new Date(dateStr) });
      onOpenChange(false);
      setTitle("");
      setDescription("");
      router.refresh(); // Refresh data
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-border bg-card p-0 overflow-hidden shadow-xl">
        <DialogHeader className="p-4 border-b border-border bg-muted/20">
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            Create Schedule
          </DialogTitle>
          <p className="text-xs text-muted-foreground">Fill in the data below to add a schedule</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Check className="size-3.5" /> Title
            </label>
            <input 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="h-8 text-sm px-3 rounded-md border border-border bg-background focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="e.g. Weekly Sync"
            />
          </div>
          <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3.5" /> Date
            </label>
            <input 
              type="date"
              required
              value={dateStr}
              onChange={e => setDateStr(e.target.value)}
              className="h-8 text-sm px-3 rounded-md border border-border bg-background focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="grid grid-cols-[100px_1fr] items-start gap-4">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 pt-2">
              <Box className="size-3.5" /> Description
            </label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="h-20 text-sm p-3 rounded-md border border-border bg-background focus:outline-none focus:border-primary/50 transition-colors resize-none"
              placeholder="Add Description"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
            <button 
              type="button" 
              onClick={() => onOpenChange(false)}
              className="px-4 py-1.5 text-xs font-bold rounded-md text-foreground hover:bg-muted transition-colors border border-border"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-1.5 text-xs font-bold rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
            >
              {loading && <div className="size-3 border-2 border-background/20 border-t-background rounded-full animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
