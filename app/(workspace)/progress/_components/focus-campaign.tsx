import { Rocket } from "lucide-react";
import Link from "next/link";

export function FocusCampaign() {
  return (
    <div className="border border-border bg-primary/5 p-4 flex flex-col gap-2 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 size-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
      
      <div className="flex items-center gap-2 mb-1 relative z-10">
        <Rocket className="size-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Current Focus</h3>
      </div>
      
      <p className="text-xs text-muted-foreground relative z-10 max-w-[90%]">
        Resume your top priority course to keep the momentum going.
      </p>
      
      <Link href="/courses" className="text-xs font-bold text-primary hover:underline mt-2 relative z-10">
        Resume Learning &rarr;
      </Link>
    </div>
  );
}
