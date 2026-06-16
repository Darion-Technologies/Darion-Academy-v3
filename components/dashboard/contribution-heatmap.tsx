"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_IN_GRID = 371; // 53 weeks × 7 days
const WEEK_COUNT = 53;
const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Timezone-safe key using LOCAL date parts - avoids UTC offset mismatches */
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatLabel(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  heatmapDays: Date[];
}

export function ContributionHeatmap({ heatmapDays }: Props) {
  const { grid, monthMarkers, activeDays, activeSet, today } = useMemo(() => {
    // FIX 1+2: Build activeSet once using local date parts (timezone-safe)
    const activeSet = new Set(heatmapDays.map((d) => toDateKey(new Date(d))));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Align grid end to nearest Sunday so columns are Mon→Sun
    const dayOfWeek = today.getDay(); // 0=Sun
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const gridEnd = new Date(today);
    gridEnd.setDate(today.getDate() + daysToSunday);

    // Build flat array of dates oldest → newest
    const dates: Date[] = [];
    for (let i = DAYS_IN_GRID - 1; i >= 0; i--) {
      const d = new Date(gridEnd);
      d.setDate(gridEnd.getDate() - i);
      dates.push(d);
    }

    // Reshape into week columns
    const weeks: Date[][] = [];
    for (let w = 0; w < WEEK_COUNT; w++) {
      weeks.push(dates.slice(w * 7, w * 7 + 7));
    }

    // FIX 3: Only show a month label if ≥ 2 weeks gap since the last one
    const monthMarkers: { weekIndex: number; label: string }[] = [];
    let lastMonth = -1;
    let lastMarkerWeek = -3;
    weeks.forEach((week, wi) => {
      const m = week[0].getMonth();
      if (m !== lastMonth && wi - lastMarkerWeek >= 2) {
        monthMarkers.push({ weekIndex: wi, label: MONTH_NAMES[m] });
        lastMonth = m;
        lastMarkerWeek = wi;
      }
    });

    return { grid: weeks, monthMarkers, activeDays: activeSet.size, activeSet, today };
  }, [heatmapDays]);

  // Shared Tooltip State
  const [hoveredCell, setHoveredCell] = useState<{ date: Date; isActive: boolean; isFuture: boolean; x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="mb-1 flex flex-row items-center justify-between border-b pb-1.5 sm:pb-2">
        <CardTitle>Learning Activity</CardTitle>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="border bg-muted px-2.5 py-1 font-medium text-foreground">
            Past year
          </span>
          <span className="font-semibold text-foreground">
            {activeDays} day{activeDays !== 1 ? "s" : ""} active
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-2 pb-2 sm:px-3 sm:pb-3">
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: `${WEEK_COUNT * 14 + 32}px` }}>

            {/* Month labels row */}
            <div className="relative mb-1 flex" style={{ paddingLeft: "32px" }}>
              {grid.map((_, wi) => {
                const marker = monthMarkers.find((m) => m.weekIndex === wi);
                return (
                  <div
                    key={wi}
                    className="shrink-0 overflow-hidden whitespace-nowrap text-[10px] font-medium text-muted-foreground"
                    style={{ width: "14px" }}
                  >
                    {marker ? marker.label : ""}
                  </div>
                );
              })}
            </div>

            {/* Grid: day labels + week columns */}
            {/* FIX 5: day-label column uses gap-[2px] to match week column spacing */}
            <div className="flex" role="grid" aria-label="Learning activity heatmap, past year">
              <div className="mr-1 flex flex-col gap-[2px]" style={{ width: "28px" }} role="rowheader">
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-end pr-1 text-[9px] font-medium text-muted-foreground"
                    style={{ height: "12px" }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Week columns */}
              <div className="flex gap-[2px]">
                {grid.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[2px]" role="row">
                    {week.map((day, di) => {
                      const key = toDateKey(day);
                      // FIX 1: use pre-computed activeSet from useMemo
                      const isActive = activeSet.has(key);
                      const isFuture = day > today;

                      const colorClass = isFuture
                        ? "bg-secondary/30"
                        : isActive
                          ? "bg-primary hover:opacity-80"
                          : "bg-secondary hover:bg-border";

                      return (
                        <div
                          key={di}
                          role="gridcell"
                          tabIndex={0}
                          // FIX 4:] instead of for square cells
                          className={cn("transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background", colorClass)}
                          style={{ width: "12px", height: "12px" }}
                          aria-label={`${formatLabel(day)}: ${isFuture ? "Future" : isActive ? "Active" : "No activity"}`}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCell({
                              date: day,
                              isActive,
                              isFuture,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 8,
                            });
                          }}
                          onMouseLeave={() => setHoveredCell(null)}
                          onFocus={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCell({
                              date: day,
                              isActive,
                              isFuture,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 8,
                            });
                          }}
                          onBlur={() => setHoveredCell(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
              <span>Less</span>
              <div className="bg-secondary" style={{ width: "12px", height: "12px" }} />
              <div className="bg-primary" style={{ width: "12px", height: "12px" }} />
              <span>More</span>
            </div>

          </div>
        </div>
      </CardContent>

      {/* Shared Floating Tooltip */}
      {mounted && hoveredCell && createPortal(
        <div
          className="pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-full flex-col items-center gap-1 border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in zoom-in-95"
          style={{ left: hoveredCell.x, top: hoveredCell.y }}
        >
          <span className="font-semibold">
            {formatLabel(hoveredCell.date)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {hoveredCell.isFuture ? "Future" : hoveredCell.isActive ? "Activity recorded" : "No activity"}
          </span>
        </div>,
        document.body
      )}
    </Card>
  );
}
