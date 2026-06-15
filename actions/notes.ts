"use server";

import { prisma } from "@/lib/prisma";

export type UnifiedNote = {
  id: string;
  type: "COURSE" | "SHORT";
  content: string;
  createdAt: Date;
  updatedAt: Date;
  reference: {
    title: string;
    courseTitle?: string;
    url: string;
    thumbnailUrl?: string;
  };
};

export async function getUserNotesAction(userId: string): Promise<UnifiedNote[]> {
  try {
    const [videoNotes, shortNotes] = await Promise.all([
      prisma.videoNote.findMany({
        where: { userId },
        include: {
          lesson: {
            select: {
              title: true,
              module: {
                select: {
                  course: {
                    select: {
                      title: true,
                      slug: true,
                      thumbnailUrl: true,
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.shortNote.findMany({
        where: { userId },
        include: {
          short: {
            select: {
              title: true,
              youtubeVideoId: true,
              thumbnailUrl: true,
            }
          }
        },
        orderBy: { updatedAt: "desc" },
      })
    ]);

    const unifiedNotes: UnifiedNote[] = [
      ...videoNotes.map((note) => ({
        id: note.id,
        type: "COURSE" as const,
        content: note.text,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        reference: {
          title: note.lesson.title,
          courseTitle: note.lesson.module.course.title,
          url: `/courses/${note.lesson.module.course.slug}`,
          thumbnailUrl: note.lesson.module.course.thumbnailUrl || undefined,
        }
      })),
      ...shortNotes.map((note) => ({
        id: note.id,
        type: "SHORT" as const,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        reference: {
          title: note.short.title,
          url: `/dashboard/shorts`,
          thumbnailUrl: note.short.thumbnailUrl || undefined,
        }
      }))
    ];

    // Sort combined notes by updatedAt descending
    return unifiedNotes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  } catch (error) {
    console.error("Error fetching user notes:", error);
    return [];
  }
}
