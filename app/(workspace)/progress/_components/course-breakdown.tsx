"use client";

import Link from "next/link";
import { Check, Circle, BookOpen, AlertCircle } from "lucide-react";
import type { CourseProgressDetail } from "@/lib/progress-data";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function CourseBreakdown({ courses }: { courses: CourseProgressDetail[] }) {
  if (!courses || courses.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center border border-dashed border-border text-sm text-muted-foreground bg-card/50">
        You are not enrolled in any courses yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {courses.map((course) => (
        <Link key={course.id} href={`/courses/${course.slug}`} className="block border border-border bg-card p-3 rounded-none hover:border-primary/50 hover:bg-muted/30 transition-colors">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/3 shrink-0 flex flex-col justify-center">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-1 line-clamp-1 group-hover:text-primary transition-colors" title={course.title}>
              {course.title}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
              <span className="uppercase tracking-widest">{course.status.replace('_', ' ')}</span>
              <span>•</span>
              <span className="font-black text-foreground">{course.progressPercent}%</span>
            </div>
            
            {/* Minimal Progress Bar underneath */}
            <div className="h-1 w-full bg-muted overflow-hidden rounded-none">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-in-out" 
                style={{ width: `${course.progressPercent}%` }}
              />
            </div>
          </div>

          <div className="sm:w-2/3 flex items-center">
            <div className="flex w-full items-center justify-between relative px-2 py-1">
              {/* Background Connecting Line */}
              <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-border -translate-y-1/2 z-0"></div>
              
              {/* Foreground Connecting Line for Completed */}
              {course.modules.length > 1 && (
                 <div 
                   className="absolute top-1/2 left-4 h-[1px] bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                   style={{ 
                     width: `calc(${(course.modules.filter(m => m.completed).length - 1) / (course.modules.length - 1) * 100}% - 1rem)` 
                   }}
                 ></div>
              )}

              {/* Module Nodes */}
              {course.modules.map((mod, i) => (
                <TooltipProvider key={mod.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative z-10 flex flex-col items-center group cursor-help">
                        <div className={cn(
                          "size-5 rounded-none border flex items-center justify-center bg-card transition-all duration-300",
                          mod.completed 
                            ? "border-primary bg-primary text-primary-foreground" 
                            : "border-border text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"
                        )}>
                          {mod.completed ? <Check className="size-3" /> : <span className="text-[9px] font-bold">{i + 1}</span>}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="flex flex-col gap-1 p-2 rounded-none border-border">
                      <span className="text-xs font-bold uppercase tracking-wider">{mod.title}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold uppercase">
                        {mod.completed ? (
                          <><Check className="size-3 text-primary" /> Completed</>
                        ) : (
                          <><Circle className="size-3" /> Pending</>
                        )}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
