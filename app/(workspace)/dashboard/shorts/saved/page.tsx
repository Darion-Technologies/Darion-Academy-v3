import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSavedShortsAction } from "@/actions/shorts";
import { SavedShortsClient } from "./_components/SavedShortsClient";

export default async function SavedShortsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const savedShorts = await getSavedShortsAction(user.id);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Saved Shorts</h1>
        <p className="text-muted-foreground mt-2 uppercase tracking-wider text-xs font-medium">
          Your personal library of bookmarked technical shorts. Review and manage your study notes.
        </p>
      </div>
      
      <SavedShortsClient initialShorts={savedShorts} userId={user.id} />
    </div>
  );
}
