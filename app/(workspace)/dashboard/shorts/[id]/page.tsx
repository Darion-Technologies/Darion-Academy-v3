import { requireUser } from "@/lib/auth";
import { getShortByIdAction } from "@/actions/shorts";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ShortWatchClient } from "../_components/ShortWatchClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: "Watch Short - Dashboard" };
}

export default async function WatchShortPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  
  const short = await getShortByIdAction(id);
  if (!short || !short.approved) {
    notFound();
  }

  const [progress, bookmark] = await Promise.all([
    prisma.shortProgress.findUnique({
      where: { userId_shortId: { userId: user.id, shortId: id } }
    }),
    prisma.shortBookmark.findUnique({
      where: { userId_shortId: { userId: user.id, shortId: id } }
    })
  ]);

  // Fetch related shorts from same category
  const relatedShorts = await prisma.youTubeShort.findMany({
    where: { 
      category: short.category, 
      approved: true,
      id: { not: id } 
    },
    take: 3,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/shorts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight truncate">{short.title}</h2>
      </div>

      <ShortWatchClient 
        short={short} 
        userId={user.id} 
        isWatchedInitially={!!progress?.watched}
        isBookmarkedInitially={!!bookmark}
        relatedShorts={relatedShorts}
      />
    </div>
  );
}
