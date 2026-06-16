"use client";

import { useState } from "react";
import type { CalendarData } from "@/lib/calendar-data";
import { CalendarHeader } from "./calendar-header";
import { CalendarGrid } from "./calendar-grid";
import { UpcomingSidebar } from "./upcoming-sidebar";

interface CalendarClientProps {
  data: CalendarData;
}

export function CalendarClient({ data }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-80px)] lg:overflow-hidden pb-4">
      <div className="flex-1 flex flex-col min-w-0">
        <CalendarHeader currentDate={currentDate} onChangeDate={setCurrentDate} />
        <CalendarGrid currentDate={currentDate} data={data} />
      </div>
      <UpcomingSidebar data={data} />
    </div>
  );
}
