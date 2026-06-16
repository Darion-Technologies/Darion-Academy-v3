import { requireUser } from "@/lib/auth";
import { getCalendarData } from "@/lib/calendar-data";
import { CalendarClient } from "./_components/calendar-client";
import { Calendar } from "lucide-react";

export const metadata = {
  title: "Calendar - Darion Academy",
  description: "View upcoming deadlines and track your learning streaks.",
};

export default async function CalendarPage() {
  const user = await requireUser();
  const data = await getCalendarData(user.id);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 pb-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <Calendar className="size-5 text-primary" />
          Learning Calendar
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Track momentum & deadlines
        </p>
      </div>
      <CalendarClient data={data} />
    </div>
  );
}
