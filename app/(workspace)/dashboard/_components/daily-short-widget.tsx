import { PlayCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getApprovedShortsAction } from "@/actions/shorts";
import { prisma } from "@/lib/prisma";

export async function DailyShortWidget({ userId }: { userId: string }) {
  const shorts = await getApprovedShortsAction();
  if (shorts.length === 0) return null;

  const todayDateStr = new Date().toISOString().split("T")[0];
  const seed = todayDateStr.split("-").join("");
  const randomIndex = parseInt(seed) % shorts.length;
  const short = shorts[randomIndex];

  const progress = await prisma.shortProgress.findUnique({
    where: { userId_shortId: { userId, shortId: short.id } }
  });

  return (
    <div className="group relative h-[180px] w-full max-w-[320px] overflow-hidden border border-border bg-black shadow-sm">
      {/* Background Image */}
      {short.thumbnailUrl ? (
        <img 
          src={short.thumbnailUrl} 
          alt={short.title} 
          className="absolute inset-0 h-full w-full object-cover opacity-50 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-70" 
        />
      ) : (
        <div className="absolute inset-0 bg-primary/80" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <span className="bg-accent px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-accent-foreground shadow-sm">
            Daily Tip
          </span>
          {progress?.watched && (
            <div className="bg-green-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
              Watched
            </div>
          )}
        </div>
        
        <div>
          <h3 className="mb-2 text-sm font-bold leading-snug text-white line-clamp-2">
            {short.title}
          </h3>
          <Link 
            href={`/dashboard/shorts/${short.id}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-accent transition-colors hover:text-white"
          >
            <PlayCircle className="size-4" />
            Watch Now
          </Link>
        </div>
      </div>
    </div>
  );
}
