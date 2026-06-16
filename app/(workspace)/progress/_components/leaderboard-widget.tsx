import { Trophy } from "lucide-react";
import { initials } from "@/lib/utils";

export function LeaderboardWidget() {
  const topLearners = [
    { rank: 1, name: "Sarah Connor", points: 399, title: "HTML Basics", avatar: null, handle: "@sarahc" },
    { rank: 2, name: "John Smith", points: 200, title: "JS Fundamentals", avatar: null, handle: "@jsmith" },
    { rank: 3, name: "Emily Chen", points: 124, title: "React Masterclass", avatar: null, handle: "@emilyc" },
  ];

  return (
    <div className="border border-border bg-card p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Trophy className="size-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Leaderboard</h3>
        </div>
        <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-sm font-bold">Top 3</span>
      </div>
      <p className="text-[10px] text-muted-foreground mb-4">Points from last 7 days</p>

      <div className="flex flex-col gap-3 flex-1">
        {topLearners.map((user) => (
          <div key={user.rank} className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground w-4">#{user.rank}</span>
            <div className="relative grid size-6 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-[9px] font-bold text-primary">
              <span className="absolute inset-0 flex items-center justify-center">{initials(user.name)}</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-bold text-foreground truncate">{user.name}</span>
              <span className="text-[10px] text-muted-foreground truncate">{user.title}</span>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-xs font-bold text-foreground">{user.points} <span className="text-[10px] text-muted-foreground font-normal">pts</span></span>
              <span className="text-[9px] text-primary">{user.handle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
