"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";

export function CourseSelector({ courses, selectedCourseId }: { courses: { id: string; title: string }[], selectedCourseId: string }) {
  const router = useRouter();

  return (
    <div className="mb-6 flex items-center gap-4 border-b pb-4">
      <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
        Filter by Course
      </span>
      <div className="w-[320px]">
        <Select 
          value={selectedCourseId}
          onChange={(e) => router.push(`?courseId=${e.target.value}`)}
          className="h-10 text-base"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
