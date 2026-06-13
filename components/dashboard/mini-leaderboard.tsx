import { UserAvatar } from "@/components/user-avatar";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { getLeaderboardRankings } from "@/lib/leaderboard-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

export async function MiniLeaderboard() {
  const rankings = await getLeaderboardRankings();
  const top3 = rankings.slice(0, 3);

  if (top3.length === 0) return null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="mb-1 flex flex-row items-center justify-between border-b pb-1.5 sm:pb-2">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          Top Performers
        </CardTitle>
        <Link
          href="/leaderboard"
          className="text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          View All
        </Link>
      </CardHeader>
      
      <CardContent className="px-2 pb-2 sm:px-3 sm:pb-3 flex-1 flex flex-col justify-between">
        <div className="flex flex-col gap-[1px] bg-border border border-border flex-1">
          {top3.map((user, index) => (
            <div key={user.id} className="flex flex-1 items-center justify-between bg-card p-2 sm:p-3 transition-colors hover:bg-secondary/40">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="w-4 text-center text-[10px] font-bold text-muted-foreground">
                  0{index + 1}
                </span>
                <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden bg-secondary font-bold text-[10px] text-foreground rounded-full">
                  <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size={32} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold leading-tight text-foreground truncate max-w-[100px] sm:max-w-[140px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {user.courses} courses
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-sm font-bold text-foreground">{user.score.toLocaleString()}</span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">pts</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
