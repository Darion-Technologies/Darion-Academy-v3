"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { format, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarSidebarProps {
  currentDate: Date;
  onChangeDate: (date: Date) => void;
  activeCalendars: string[];
  setActiveCalendars: (state: string[] | ((prev: string[]) => string[])) => void;
  activeCourseTypes: string[];
  setActiveCourseTypes: (state: string[] | ((prev: string[]) => string[])) => void;
}

export function CalendarSidebar({ 
  currentDate, 
  onChangeDate,
  activeCalendars,
  setActiveCalendars,
  activeCourseTypes,
  setActiveCourseTypes
}: CalendarSidebarProps) {
  const [miniCalendarDate, setMiniCalendarDate] = useState(currentDate);

  const monthStart = startOfMonth(miniCalendarDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  const handlePrevMonth = () => setMiniCalendarDate(subMonths(miniCalendarDate, 1));
  const handleNextMonth = () => setMiniCalendarDate(addMonths(miniCalendarDate, 1));

  return (
    <div className="w-full lg:w-[220px] shrink-0 border-r border-border bg-background flex flex-col h-full overflow-y-auto no-scrollbar pt-2 pr-3 lg:pr-4">
      
      {/* Mini Calendar Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-xs font-bold text-foreground">
          {format(miniCalendarDate, "MMMM yyyy")}
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={handleNextMonth} className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Mini Calendar Grid */}
      <div className="mb-8">
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day, i) => (
            <div key={i} className="text-center text-[10px] font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, miniCalendarDate);
            const isSelected = isSameDay(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                onClick={() => onChangeDate(day)}
                className={cn(
                  "flex items-center justify-center h-8 w-full text-xs font-medium rounded-full transition-all",
                  !isCurrentMonth && "text-muted-foreground/40",
                  isCurrentMonth && !isSelected && !isToday && "text-foreground hover:bg-muted",
                  isToday && !isSelected && "text-primary font-bold bg-primary/10",
                  isSelected && "bg-foreground text-background font-bold shadow-md"
                )}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Section */}
      <div className="space-y-4">
        <FilterSection 
          title="My Calendars" 
          activeIds={activeCalendars}
          onChange={(id) => setActiveCalendars(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
          items={[
            { id: "deadlines", label: "Deadlines", color: "bg-blue-500" },
            { id: "events", label: "Events", color: "bg-purple-500" },
            { id: "personal", label: "Personal", color: "bg-orange-500" },
          ]} 
        />
        
        <FilterSection 
          title="Course Type" 
          activeIds={activeCourseTypes}
          onChange={(id) => setActiveCourseTypes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
          items={[
            { id: "engineering", label: "Engineering", color: "bg-emerald-500" },
            { id: "soft_skills", label: "Soft Skills", color: "bg-pink-500" },
            { id: "onboarding", label: "Onboarding", color: "bg-amber-500" },
          ]} 
        />
      </div>
    </div>
  );
}

function FilterSection({ 
  title, 
  items, 
  activeIds,
  onChange 
}: { 
  title: string, 
  items: { id: string, label: string, color: string }[],
  activeIds: string[],
  onChange: (id: string) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between px-1 mb-2">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h4>
      </div>
      <div className="space-y-0.5">
        {items.map(item => {
          const isChecked = activeIds.includes(item.id);
          return (
            <label key={item.id} className="flex items-center gap-2 px-1.5 py-1 hover:bg-muted/50 rounded-md cursor-pointer group transition-colors">
              <input 
                type="checkbox" 
                className="hidden" 
                checked={isChecked}
                onChange={() => onChange(item.id)}
              />
              <div className={cn(
                "size-3.5 rounded-sm border flex items-center justify-center transition-colors",
                isChecked ? "border-transparent " + item.color : "border-border bg-transparent group-hover:border-foreground/30"
              )}>
                {isChecked && <Check className="size-2.5 text-white" strokeWidth={3} />}
              </div>
              <span className="text-xs font-medium text-foreground">{item.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
