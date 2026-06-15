import { requireUser } from "@/lib/auth";
import { getUserNotesAction } from "@/actions/notes";
import Link from "next/link";
import { BookOpen, PlaySquare, Calendar, ExternalLink } from "lucide-react";

export const metadata = {
  title: "My Notes - Darion Academy",
};

export default async function NotesPage() {
  const user = await requireUser();
  const notes = await getUserNotesAction(user.id);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Notes</h2>
      </div>
      
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-lg bg-card/50">
          <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No notes yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
            You haven't taken any notes yet. Notes you take in courses and tech shorts will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
              <div className="flex flex-row items-center justify-between p-4 border-b bg-muted/40">
                <div className="flex items-center gap-2">
                  {note.type === "COURSE" ? (
                    <BookOpen className="h-4 w-4 text-primary" />
                  ) : (
                    <PlaySquare className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {note.type}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {note.updatedAt.toLocaleDateString()}
                </div>
              </div>
              
              <div className="p-5 flex-1 bg-card">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
              </div>
              
              <div className="p-4 border-t bg-muted/20">
                <Link 
                  href={note.reference.url} 
                  className="group flex items-center justify-between text-sm font-medium hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {note.reference.thumbnailUrl ? (
                      <div className="h-8 w-12 shrink-0 overflow-hidden rounded bg-muted">
                        <img 
                          src={note.reference.thumbnailUrl} 
                          alt="" 
                          className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                        />
                      </div>
                    ) : (
                      <div className="h-8 w-12 shrink-0 flex items-center justify-center rounded bg-primary/10 text-primary">
                        {note.type === "COURSE" ? <BookOpen className="h-4 w-4" /> : <PlaySquare className="h-4 w-4" />}
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {note.reference.title}
                      </span>
                      {note.reference.courseTitle && (
                        <span className="truncate text-[10px] text-muted-foreground">
                          {note.reference.courseTitle}
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
