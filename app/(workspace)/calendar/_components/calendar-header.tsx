"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  currentDate: Date;
  onChangeDate: (date: Date) => void;
}

export function CalendarHeader({ currentDate, onChangeDate }: CalendarHeaderProps) {
  const handlePrevMonth = () => onChangeDate(subMonths(currentDate, 1));
  const handleNextMonth = () => onChangeDate(addMonths(currentDate, 1));
  const handleToday = () => onChangeDate(new Date());

  return (
    <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-black text-foreground uppercase tracking-tight w-[180px]">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex items-center rounded-none border border-border bg-card">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-muted rounded-none border-r border-border transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-[10px] uppercase font-bold hover:bg-muted rounded-none border-r border-border transition-colors text-foreground"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-muted rounded-none transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-2 py-1 border border-border bg-card rounded-none text-[10px] font-bold uppercase">
          <span className="flex size-1.5 rounded-none bg-orange-500"></span>
          <span className="text-muted-foreground">Streak</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 border border-border bg-card rounded-none text-[10px] font-bold uppercase">
          <span className="flex size-1.5 rounded-none bg-blue-500"></span>
          <span className="text-muted-foreground">Assigned</span>
        </div>
      </div>
    </div>
  );
}
