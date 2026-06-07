import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Award, Star, Trophy, Target } from "lucide-react";
import { BadgeType } from "@/generated/prisma";

export function BadgeCard({ badge, userBadge, className }: { badge: any; userBadge: any; className?: string }) {
  // Map badge type to Lucide icons if no iconUrl is provided
  const getIcon = () => {
    switch (badge.type) {
      case BadgeType.WEEKLY_STAR: return Star;
      case BadgeType.MONTHLY_HERO: return Award;
      case BadgeType.YEARLY_CHAMPION: return Trophy;
      default: return Target;
    }
  };

  const Icon = getIcon();
  const color = badge.color || "#3B82F6"; // Fallback blue
  const dateStr = new Date(userBadge.awardedAt).toLocaleDateString();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={cn(
            "relative flex flex-col items-center justify-center p-6 rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:scale-105 hover:shadow-md cursor-default overflow-hidden group",
            className
          )}
          style={{ borderColor: `${color}40` }}
        >
          {/* Subtle background glow */}
          <div 
            className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" 
            style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
          />
          
          <div 
            className="relative flex items-center justify-center size-16 rounded-full shadow-inner mb-4 bg-gradient-to-br from-background to-muted border"
            style={{ borderColor: `${color}60` }}
          >
            {badge.iconUrl && !badge.iconUrl.startsWith("/badges/") ? ( // Temporarily fallback to Lucide if the SVG isn't uploaded yet
              <img src={badge.iconUrl} alt={badge.name} className="size-8 object-contain" />
            ) : (
              <Icon className="size-8" style={{ color }} />
            )}
            
            {/* Glossy reflection effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent to-white/20 opacity-50 pointer-events-none" />
          </div>

          <h3 className="font-bold text-sm text-center leading-tight">{badge.name}</h3>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">{userBadge.period}</p>
        </div>
      </TooltipTrigger>
      
      <TooltipContent side="bottom" className="w-64 p-3 space-y-2">
        <div className="font-semibold">{badge.name}</div>
        <p className="text-xs text-muted-foreground">{badge.description}</p>
        <div className="border-t pt-2 mt-2">
          <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider mb-1">Performance snapshot</p>
          {userBadge.metadata?.score !== undefined && (
            <div className="flex justify-between text-xs">
              <span>LMS Score</span>
              <span className="font-semibold text-primary">{userBadge.metadata.score.toLocaleString()} pts</span>
            </div>
          )}
          <div className="flex justify-between text-xs mt-0.5">
            <span>Awarded</span>
            <span className="font-semibold">{dateStr}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
