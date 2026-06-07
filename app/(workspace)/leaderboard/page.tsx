import { Trophy, Medal, Award, Flame, CheckCircle2, ChevronUp } from "lucide-react";
import { getLeaderboardRankings } from "@/lib/leaderboard-data";
import { requireRole } from "@/lib/auth";
import { initials } from "@/lib/utils";

export const metadata = {
  title: "Leaderboard — Darion Academy",
  description: "Global learner rankings and activity scores.",
};

export default async function LeaderboardPage() {
  const user = await requireRole("EMPLOYEE", "INTERN", "ADMIN", "MENTOR");
  const rankings = await getLeaderboardRankings();

  const top3 = rankings.slice(0, 3);
  const others = rankings.slice(3);

  const currentUserRank = rankings.find((r) => r.id === user.id);

  // Rearrange top 3 for podium display: [2nd, 1st, 3rd]
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
          <Trophy className="size-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Academy Leaderboard</h1>
        <p className="mt-2 text-muted-foreground">
          Rankings based on certificates earned, courses completed, and active streaks.
        </p>
      </div>

      {/* Podium */}
      {podium.length > 0 && (
        <div className="mt-12 flex flex-wrap items-end justify-center gap-4 sm:gap-6">
          {podium.map((entry, idx) => {
            if (!entry) return null;
            // Map array index back to actual rank for styling
            const isFirst = entry.rank === 1;
            const isSecond = entry.rank === 2;
            const isThird = entry.rank === 3;

            return (
              <div
                key={entry.id}
                className={`flex flex-col items-center ${
                  isFirst ? "order-1 sm:order-none z-10 scale-110" : "opacity-90"
                }`}
              >
                {/* Avatar & Crown */}
                <div className="relative mb-4">
                  {isFirst && (
                    <Trophy className="absolute -top-8 left-1/2 -translate-x-1/2 size-7 text-yellow-500 drop-shadow-md" />
                  )}
                  <div
                    className={`flex items-center justify-center rounded-full font-bold shadow-lg ${
                      isFirst
                        ? "size-20 bg-gradient-to-br from-yellow-300 to-amber-500 text-yellow-950 text-xl border-4 border-yellow-200"
                        : isSecond
                        ? "size-16 bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 text-lg border-2 border-slate-100"
                        : "size-16 bg-gradient-to-br from-orange-300 to-amber-600 text-orange-950 text-lg border-2 border-orange-200"
                    }`}
                  >
                    {entry.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={entry.avatarUrl}
                        alt={entry.name}
                        className="size-full rounded-full object-cover"
                      />
                    ) : (
                      initials(entry.name)
                    )}
                  </div>
                  {/* Rank Badge */}
                  <div
                    className={`absolute -bottom-3 left-1/2 -translate-x-1/2 flex size-7 items-center justify-center rounded-full border-2 border-background text-xs font-bold text-white shadow-sm ${
                      isFirst ? "bg-yellow-500" : isSecond ? "bg-slate-400" : "bg-orange-500"
                    }`}
                  >
                    {entry.rank}
                  </div>
                </div>

                {/* Name & Score */}
                <div className="text-center">
                  <p className="font-bold text-foreground line-clamp-1 max-w-[120px]">{entry.name}</p>
                  <p className="text-sm font-black text-primary mt-1">{entry.score.toLocaleString()} pts</p>
                </div>

                {/* Breakdown Stats */}
                <div className="mt-3 flex items-center justify-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm">
                  <div className="flex items-center gap-1" title="Certificates">
                    <Award className="size-3.5 text-blue-500" />
                    <span className="font-semibold text-foreground">{entry.certificates}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Courses Completed">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    <span className="font-semibold text-foreground">{entry.courses}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Active Days">
                    <Flame className="size-3.5 text-orange-500" />
                    <span className="font-semibold text-foreground">{entry.streaks}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rankings List */}
      <div className="mt-12 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/40 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">All Rankings</h2>
        </div>
        <div className="divide-y divide-border">
          {others.length > 0 ? (
            others.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30 ${
                  entry.id === user.id ? "bg-primary/5 hover:bg-primary/10" : ""
                }`}
              >
                {/* Rank Number */}
                <div className="flex w-8 justify-center">
                  <span className="text-lg font-bold text-muted-foreground">#{entry.rank}</span>
                </div>

                {/* Avatar */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
                  {entry.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.avatarUrl} alt={entry.name} className="size-full rounded-full object-cover" />
                  ) : (
                    initials(entry.name)
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`truncate font-semibold ${entry.id === user.id ? "text-primary" : "text-foreground"}`}>
                    {entry.name}
                    {entry.id === user.id && <span className="ml-2 text-xs font-normal text-muted-foreground">(You)</span>}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden items-center gap-6 sm:flex">
                  <div className="flex w-16 items-center gap-1.5 text-muted-foreground" title="Certificates">
                    <Award className="size-4" />
                    <span className="text-sm font-medium">{entry.certificates}</span>
                  </div>
                  <div className="flex w-16 items-center gap-1.5 text-muted-foreground" title="Courses">
                    <CheckCircle2 className="size-4" />
                    <span className="text-sm font-medium">{entry.courses}</span>
                  </div>
                  <div className="flex w-16 items-center gap-1.5 text-muted-foreground" title="Active Days">
                    <Flame className="size-4" />
                    <span className="text-sm font-medium">{entry.streaks}</span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="font-bold text-foreground">{entry.score.toLocaleString()}</span>
                  <span className="ml-1 text-xs text-muted-foreground">pts</span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-muted-foreground">
              No other learners on the leaderboard yet.
            </div>
          )}
        </div>
      </div>

      {/* Sticky Current User Banner */}
      {currentUserRank && currentUserRank.rank > 3 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-primary/20 bg-card/95 p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] backdrop-blur-xl lg:left-[248px]">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                #{currentUserRank.rank}
              </div>
              <div>
                <p className="font-bold text-foreground">Your Ranking</p>
                <p className="text-xs text-muted-foreground">Keep learning to climb the leaderboard!</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-4 text-xs font-medium text-muted-foreground sm:flex">
                <span className="flex items-center gap-1"><Award className="size-3.5" /> {currentUserRank.certificates}</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="size-3.5" /> {currentUserRank.courses}</span>
                <span className="flex items-center gap-1"><Flame className="size-3.5" /> {currentUserRank.streaks}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-black text-primary">{currentUserRank.score.toLocaleString()} pts</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
