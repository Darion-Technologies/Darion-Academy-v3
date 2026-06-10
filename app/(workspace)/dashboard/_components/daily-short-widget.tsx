import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Flame, CheckCircle2, Bookmark } from "lucide-react";
import Link from "next/link";
import { getApprovedShortsAction } from "@/actions/shorts";

export async function DailyShortWidget({ userId }: { userId: string }) {
  // Get all approved shorts
  const shorts = await getApprovedShortsAction();
  if (shorts.length === 0) return null;

  // Pick one random short
  // Using today's date to seed the "randomness" so it changes daily but stays consistent for the day
  const todayDateStr = new Date().toISOString().split("T")[0];
  const seed = todayDateStr.split("-").join("");
  const randomIndex = parseInt(seed) % shorts.length;
  const short = shorts[randomIndex];

  // Get user progress for this short
  const progress = await prisma.shortProgress.findUnique({
    where: { userId_shortId: { userId, shortId: short.id } }
  });
  
  // Get counts
  const [totalWatched, totalBookmarks, todayWatchedCount] = await Promise.all([
    prisma.shortProgress.count({ where: { userId, watched: true } }),
    prisma.shortBookmark.count({ where: { userId } }),
    prisma.shortProgress.count({ 
      where: { 
        userId, 
        watched: true,
        watchedAt: {
          gte: new Date(new Date().setHours(0,0,0,0))
        }
      } 
    })
  ]);

  // Streak logic: simple check if they watched anything today
  const hasWatchedToday = todayWatchedCount > 0;

  return (
    <Card className="flex flex-col md:flex-row overflow-hidden group">
      <div className="md:w-[240px] bg-black relative flex-shrink-0 aspect-[16/9] md:aspect-auto">
        {short.thumbnailUrl && (
          <img 
            src={short.thumbnailUrl} 
            alt={short.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" 
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <Link href={`/dashboard/shorts/${short.id}`}>
            <PlayCircle className="h-12 w-12 text-white hover:scale-110 transition-transform shadow-sm rounded-full bg-black/30" />
          </Link>
        </div>
        <Badge variant="neutral" className="absolute top-2 right-2 bg-black/70 text-white border-0">
          Daily Tip
        </Badge>
        {progress?.watched && (
          <div className="absolute top-2 left-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 bg-black/50 rounded-full" />
          </div>
        )}
      </div>
      
      <div className="flex-1 p-4 md:p-6 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Badge variant="neutral" className="mb-2">{short.category}</Badge>
            <CardTitle className="text-xl line-clamp-1 group-hover:underline">
              <Link href={`/dashboard/shorts/${short.id}`}>{short.title}</Link>
            </CardTitle>
          </div>
          <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md">
            <Flame className="h-4 w-4" />
            <span className="text-xs font-bold">{hasWatchedToday ? "Streak Active!" : "Keep Streak"}</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {short.description || "Learn a new quick tip to boost your technical skills today."}
        </p>

        <div className="mt-auto flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span><strong className="text-foreground">{totalWatched}</strong> watched</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bookmark className="h-4 w-4 text-primary" />
            <span><strong className="text-foreground">{totalBookmarks}</strong> saved</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
