"use client";

import { Search, Filter, Plus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarHeaderProps {
  currentDate: Date;
  onChangeDate: (date: Date) => void;
  viewType: "day" | "week" | "month";
  onChangeView: (view: "day" | "week" | "month") => void;
  onAddNew: () => void;
}

export function CalendarHeader({ currentDate, onChangeDate, viewType, onChangeView, onAddNew }: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 px-4 border-b border-border bg-card">
      <div className="flex items-center gap-4 mb-2 sm:mb-0">
        <div className="flex items-center p-1 bg-muted/50 rounded-lg border border-border">
          <button 
            onClick={() => onChangeView("day")}
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-md transition-colors",
              viewType === "day" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Day
          </button>
          <button 
            onClick={() => onChangeView("week")}
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-md transition-colors",
              viewType === "week" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Week
          </button>
          <button 
            onClick={() => onChangeView("month")}
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-md transition-colors",
              viewType === "month" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Month
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search task, event..." 
            className="w-[180px] lg:w-[220px] h-8 pl-8 pr-3 rounded-md border border-border bg-background text-xs focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <button className="h-8 px-3 flex items-center gap-1.5 text-xs font-bold text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors">
          <Filter className="size-3.5" />
          Filter
        </button>
        <button 
          onClick={onAddNew}
          className="h-8 px-3 flex items-center gap-1.5 text-xs font-bold text-background bg-foreground rounded-md hover:bg-foreground/90 transition-colors shadow-sm"
        >
          <Plus className="size-3.5" strokeWidth={3} />
          Add New
        </button>
      </div>
    </div>
  );
}
