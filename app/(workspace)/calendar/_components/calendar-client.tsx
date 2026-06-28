"use client";

import { useState } from "react";
import type { CalendarData } from "@/lib/calendar-data";
import { CalendarHeader } from "./calendar-header";
import { CalendarGrid } from "./calendar-grid";
import { CalendarSidebar } from "./calendar-sidebar";
import { CreateEventModal } from "./create-event-modal";

interface CalendarClientProps {
  data: CalendarData;
}

export function CalendarClient({ data }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<"day" | "week" | "month">("week");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCalendars, setActiveCalendars] = useState<string[]>(["deadlines", "events", "personal"]);
  const [activeCourseTypes, setActiveCourseTypes] = useState<string[]>(["engineering", "soft_skills", "onboarding"]);

  return (
    <div className="flex flex-col lg:flex-row flex-1 lg:h-[calc(100vh-120px)] w-full rounded-xl border border-border overflow-hidden bg-background shadow-sm">
      <CalendarSidebar 
        currentDate={currentDate} 
        onChangeDate={setCurrentDate}
        activeCalendars={activeCalendars}
        setActiveCalendars={setActiveCalendars}
        activeCourseTypes={activeCourseTypes}
        setActiveCourseTypes={setActiveCourseTypes}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-card overflow-hidden">
        {/* Top App Tabs */}
        <div className="flex items-center border-b border-border bg-muted/30 pt-2 px-2 gap-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border border-b-transparent rounded-t-lg shadow-[0_-2px_10px_rgba(0,0,0,0.02)] min-w-fit">
            <div className="size-4 rounded-sm bg-black flex items-center justify-center">
               <div className="size-2 bg-white rounded-[1px]" />
            </div>
            <span className="text-xs font-bold text-foreground">Skejulio Calendar</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50 rounded-t-lg transition-colors cursor-pointer min-w-fit opacity-60 hover:opacity-100">
            <div className="size-4 rounded-full border-2 border-emerald-500" />
            <span className="text-xs font-semibold text-muted-foreground">Bubbee API Gateway</span>
            <button className="ml-2 text-muted-foreground/50 hover:text-foreground">✕</button>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50 rounded-t-lg transition-colors cursor-pointer min-w-fit opacity-60 hover:opacity-100">
            <div className="size-4 rounded border-2 border-teal-600 bg-teal-100" />
            <span className="text-xs font-semibold text-muted-foreground">Cansaas Task Manager</span>
            <button className="ml-2 text-muted-foreground/50 hover:text-foreground">✕</button>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50 rounded-t-lg transition-colors cursor-pointer min-w-fit opacity-60 hover:opacity-100">
            <div className="size-4 rounded-sm bg-orange-500 text-[8px] font-bold text-white flex items-center justify-center">C</div>
            <span className="text-xs font-semibold text-muted-foreground">Roemah CRM System</span>
            <button className="ml-2 text-muted-foreground/50 hover:text-foreground">✕</button>
          </div>
        </div>

        <CalendarHeader 
          currentDate={currentDate} 
          onChangeDate={setCurrentDate} 
          viewType={viewType}
          onChangeView={setViewType}
          onAddNew={() => setIsModalOpen(true)}
        />
        <CalendarGrid 
          currentDate={currentDate} 
          data={data} 
          viewType={viewType}
          activeCalendars={activeCalendars}
        />
      </div>
      <CreateEventModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
