"use client";

import { useState } from "react";
import Link from "next/link";
import { History, MessageSquare, PlaySquare, BookOpen, Clock, ExternalLink, Filter, Calendar } from "lucide-react";
import { format } from "date-fns";

export type UnifiedHistoryItem = {
  id: string;
  type: "COURSE" | "SHORT" | "COMMENT";
  title: string;
  subtitle?: string;
  text?: string;
  url: string;
  thumbnailUrl?: string;
  timestamp: Date;
  completed?: boolean;
};

interface HistoryClientProps {
  initialData: UnifiedHistoryItem[];
}

type FilterType = "ALL" | "COURSE" | "SHORT" | "COMMENT";
type DateFilterType = "ALL_TIME" | "TODAY" | "LAST_7" | "LAST_30";

export function HistoryClient({ initialData }: HistoryClientProps) {
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("ALL_TIME");

  const filteredData = initialData.filter(item => {
    // Content Type Filter
    if (filter !== "ALL" && item.type !== filter) return false;
    
    // Date Filter
    if (dateFilter !== "ALL_TIME") {
      const itemDate = new Date(item.timestamp);
      const now = new Date();
      // Reset hours to compare just the dates properly
      const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
      const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const diffTime = Math.abs(nowDay.getTime() - itemDay.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === "TODAY" && diffDays > 0) return false;
      if (dateFilter === "LAST_7" && diffDays > 7) return false;
      if (dateFilter === "LAST_30" && diffDays > 30) return false;
    }

    return true;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Activity History</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Track your course progress and interactions
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-sm">
            <Filter className="h-3.5 w-3.5 text-muted-foreground ml-2 mr-1" />
            <div className="h-4 w-[1px] bg-border mx-1"></div>
            {(["ALL", "COURSE", "SHORT", "COMMENT"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                  filter === f 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {f === "ALL" ? "All Content" : f.charAt(0) + f.slice(1).toLowerCase() + "s"}
              </button>
            ))}
          </div>
          
          <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground ml-2 mr-1" />
            <div className="h-4 w-[1px] bg-border mx-1"></div>
            {[
              { id: "ALL_TIME", label: "All Time" },
              { id: "TODAY", label: "Today" },
              { id: "LAST_7", label: "7 Days" },
              { id: "LAST_30", label: "30 Days" }
            ].map((df) => (
              <button
                key={df.id}
                onClick={() => setDateFilter(df.id as DateFilterType)}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                  dateFilter === df.id 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {df.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <History className="h-10 w-10 mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No history found</h3>
            <p className="text-sm">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredData.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className="group flex flex-col sm:flex-row items-start sm:items-center hover:bg-muted/40 transition-colors p-4 gap-4"
              >
                {/* Icon/Thumbnail Column */}
                <div className="flex-shrink-0 relative">
                  {item.type === "COMMENT" ? (
                    <div className="h-12 w-12 rounded-md border border-border flex items-center justify-center bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                  ) : item.thumbnailUrl ? (
                    <div className="h-14 w-24 rounded-md overflow-hidden border border-border bg-muted/50">
                      <img 
                        src={item.thumbnailUrl} 
                        alt="" 
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-24 rounded-md border border-border flex items-center justify-center bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
                      {item.type === "COURSE" ? <BookOpen className="h-6 w-6" /> : <PlaySquare className="h-6 w-6" />}
                    </div>
                  )}
                  
                  {item.type !== "COMMENT" && (
                    <div className="absolute -top-2 -left-2 bg-background border border-border px-1.5 py-0.5 rounded text-[10px] font-bold text-muted-foreground shadow-sm group-hover:text-foreground transition-colors">
                      {item.type === "COURSE" ? "COURSE" : "SHORT"}
                    </div>
                  )}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    {item.completed && (
                      <span className="text-[10px] font-medium bg-success/10 text-success px-1.5 py-0.5 rounded-sm">
                        Completed
                      </span>
                    )}
                  </div>
                  
                  {item.type === "COMMENT" ? (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      "{item.text}"
                    </p>
                  ) : item.subtitle ? (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.subtitle}
                    </p>
                  ) : null}
                </div>
                
                {/* Meta Column */}
                <div className="flex-shrink-0 flex items-center gap-1.5 text-xs text-muted-foreground sm:ml-auto">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{format(new Date(item.timestamp), "MMM dd, yyyy")}</span>
                  
                  <div className="ml-2 w-8 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
