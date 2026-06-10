import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getShortByIdAction } from "@/actions/shorts";
import { ShortQuizBuilder } from "../_components/ShortQuizBuilder";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: "Manage Short - Admin" };
}

export default async function AdminShortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "MENTOR") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const short = await getShortByIdAction(id);

  if (!short) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/shorts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Manage Short</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden border">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${short.youtubeVideoId}`}
              title={short.title}
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{short.title}</h3>
            <p className="text-muted-foreground text-sm">{short.channelName}</p>
            <div className="flex gap-2 mt-2">
              <Badge>{short.category}</Badge>
              <Badge variant="outline">{short.durationSeconds}s</Badge>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <ShortQuizBuilder shortId={short.id} existingQuizzes={short.quizzes} />
        </div>
      </div>
    </div>
  );
}
