"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SearchResult = {
  id: string;
  type: "course" | "lesson";
  title: string;
  subtitle: string;
  href: string;
};

export async function searchEntitiesAction(query: string): Promise<SearchResult[]> {
  const user = await requireUser();
  if (!query || query.length < 2) return [];

  const safeQuery = query.trim();
  const courseAccess =
    user.role === "ADMIN"
      ? {}
      : user.role === "MENTOR"
        ? { enrollments: { some: { OR: [{ learnerId: user.id }, { mentorId: user.id }] } } }
        : { enrollments: { some: { learnerId: user.id } } };

  const [courses, lessons] = await Promise.all([
    prisma.course.findMany({
      where: {
        OR: [
          { title: { contains: safeQuery, mode: "insensitive" } },
          { description: { contains: safeQuery, mode: "insensitive" } },
          { category: { contains: safeQuery, mode: "insensitive" } },
        ],
        status: "PUBLISHED",
        ...courseAccess,
      },
      take: 4,
      select: { id: true, title: true, slug: true, category: true },
    }),
    prisma.lesson.findMany({
      where: {
        OR: [
          { title: { contains: safeQuery, mode: "insensitive" } },
        ],
        module: { course: { status: "PUBLISHED", ...courseAccess } },
      },
      take: 5,
      select: {
        id: true,
        title: true,
        type: true,
        module: { select: { title: true, course: { select: { title: true, slug: true } } } },
      },
    }),
  ]);

  const results: SearchResult[] = [
    ...courses.map((c) => ({
      id: `course-${c.id}`,
      type: "course" as const,
      title: c.title,
      subtitle: `Course • ${c.category}`,
      href: `/courses/${c.slug}`,
    })),
    ...lessons.map((l) => ({
      id: `lesson-${l.id}`,
      type: "lesson" as const,
      title: l.title,
      subtitle: `Lesson in ${l.module.course.title}`,
      href: `/lessons/${l.id}`,
    })),
  ];

  return results;
}
