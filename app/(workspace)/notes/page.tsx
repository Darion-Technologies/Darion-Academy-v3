import { requireUser } from "@/lib/auth";
import { getUserNotesAction } from "@/actions/notes";
import { NotesClient } from "./_components/notes-client";
import { BookOpen } from "lucide-react";

export const metadata = {
  title: "My Notes - Darion Academy",
};

export default async function NotesPage() {
  const user = await requireUser();
  const notes = await getUserNotesAction(user.id);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 pb-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          My Notes
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {notes.length} saved {notes.length === 1 ? 'note' : 'notes'}
        </p>
      </div>
      
      <NotesClient notes={notes} />
    </div>
  );
}
