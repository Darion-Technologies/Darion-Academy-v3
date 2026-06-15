import { requireUser } from "@/lib/auth";
import { getApprovedShortsAction } from "@/actions/shorts";
import { prisma } from "@/lib/prisma";
import { LearnerShortsFeed } from "./_components/LearnerShortsFeed";

export const metadata = {
  title: "Technical Shorts - Dashboard",
};

export default async function LearnerShortsPage() {
  const user = await requireUser();
  
  // Get all approved shorts with quizzes included
  const shorts = await prisma.youTubeShort.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
    include: { quizzes: true }
  });
  
  // Get user progress and bookmarks for shorts
  const progress = await prisma.shortProgress.findMany({
    where: { userId: user.id },
    select: { shortId: true, watched: true }
  });
  
  const bookmarks = await prisma.shortBookmark.findMany({
    where: { userId: user.id },
    select: { shortId: true }
  });

  const watchedSet = new Set(progress.filter(p => p.watched).map(p => p.shortId));
  const bookmarkedSet = new Set(bookmarks.map(b => b.shortId));

  // Algorithmic Feed: "Daily Best Picks"
  // 1. Unwatched first
  // 2. High shortScore
  // 3. Daily seeded shuffle for variety
  
  // Simple seeded random function based on current date
  const todayStr = new Date().toISOString().split('T')[0];
  const seedString = todayStr + user.id;
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed = (seed << 5) - seed + seedString.charCodeAt(i);
    seed |= 0;
  }
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const sortedShorts = [...shorts].sort((a, b) => {
    const aWatched = watchedSet.has(a.id);
    const bWatched = watchedSet.has(b.id);
    
    // Unwatched always before watched
    if (aWatched !== bWatched) return aWatched ? 1 : -1;
    
    // Sort by short score (higher is better)
    if (a.shortScore !== b.shortScore) {
      return (b.shortScore || 5) - (a.shortScore || 5);
    }
    
    // Daily seeded random tie-breaker
    return random() - 0.5;
  });

  return (
    <div className="-mx-2 -mt-2 -mb-16 sm:-mx-4 sm:-mt-4 sm:-mb-16 lg:-mx-6 lg:-mt-6 lg:-mb-6 h-[calc(100dvh-40px)] lg:h-[calc(100dvh-48px)] bg-background flex flex-col items-center justify-center overflow-hidden relative">
      
      <div className="relative z-10 w-full h-full">
        <LearnerShortsFeed 
          initialShorts={sortedShorts} 
          watchedSet={watchedSet} 
          bookmarkedSet={bookmarkedSet}
          userId={user.id}
          userRole={user.role}
        />
      </div>
    </div>
  );
}
