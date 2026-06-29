"use client";

import { ProgressAnalyticsData } from "@/lib/progress-data";
import { Hexagon } from "lucide-react";

export function CompetencyMatrix({ data }: { data: ProgressAnalyticsData }) {
  const radarData = data.radarData;

  if (!radarData || radarData.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 flex flex-col items-center justify-center text-center shadow-sm h-full">
        <div className="mb-3 flex size-8 items-center justify-center rounded bg-muted">
          <Hexagon className="size-4 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-bold text-foreground">No Competency Data</h3>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">Complete modules to generate your skill matrix.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 flex flex-col h-full shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
        <div>
          <h2 className="text-sm font-bold text-foreground">Competency Matrix</h2>
        </div>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2">
        {radarData.map((skill, idx) => {
          const progressPercent = Math.round((skill.A / skill.fullMark) * 100);
          
          return (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">{skill.subject}</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {skill.A} / {skill.fullMark} MODS
                </span>
              </div>
              
              {/* Brutalist segmented progress bar */}
              <div className="flex h-2 w-full gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => {
                  const threshold = (i + 1) * 10;
                  const isActive = progressPercent >= threshold;
                  
                  return (
                    <div 
                      key={i} 
                      className={`flex-1 h-full rounded-sm ${isActive ? 'bg-primary' : 'bg-muted'}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
