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
    <div className="flex flex-col h-[calc(100vh-24px)] lg:h-[calc(100vh-24px)]">
      <NotesClient notes={notes} user={user} />
    </div>
  );
}
