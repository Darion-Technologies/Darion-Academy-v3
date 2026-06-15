"use server";

import { prisma } from "@/lib/prisma";

export type WatchHistoryItem = {
  id: string;
  type: "COURSE" | "SHORT";
  title: string;
  subtitle?: string;
  url: string;
  thumbnailUrl?: string;
  watchedAt: Date;
  completed: boolean;
};

export async function getWatchHistoryAction(userId: string): Promise<WatchHistoryItem[]> {
  try {
    const [videoProgress, shortProgress] = await Promise.all([
      prisma.videoProgress.findMany({
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
        take: 50
      }),
      prisma.shortProgress.findMany({
        where: { userId },
        include: {
          short: {
            select: {
              title: true,
              thumbnailUrl: true,
            }
          }
        },
        orderBy: { watchedAt: "desc" },
        take: 50
      })
    ]);

    const history: WatchHistoryItem[] = [
      ...videoProgress.map((p) => ({
        id: p.id,
        type: "COURSE" as const,
        title: p.lesson.title,
        subtitle: p.lesson.module.course.title,
        url: `/courses/${p.lesson.module.course.slug}`,
        thumbnailUrl: p.lesson.module.course.thumbnailUrl || undefined,
        watchedAt: p.updatedAt,
        completed: p.completed,
      })),
      ...shortProgress.map((p) => ({
        id: p.id,
        type: "SHORT" as const,
        title: p.short.title,
        url: `/dashboard/shorts`,
        thumbnailUrl: p.short.thumbnailUrl || undefined,
        watchedAt: p.watchedAt || p.createdAt,
        completed: p.watched,
      }))
    ];

    return history.sort((a, b) => b.watchedAt.getTime() - a.watchedAt.getTime()).slice(0, 50);

  } catch (error) {
    console.error("Error fetching watch history:", error);
    return [];
  }
}

export type CommentHistoryItem = {
  id: string;
  type: "SHORT";
  text: string;
  createdAt: Date;
  reference: {
    title: string;
    url: string;
    thumbnailUrl?: string;
  };
};

export async function getCommentHistoryAction(userId: string): Promise<CommentHistoryItem[]> {
  try {
    const comments = await prisma.shortComment.findMany({
      where: { userId },
      include: {
        short: {
          select: {
            title: true,
            thumbnailUrl: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return comments.map((c) => ({
      id: c.id,
      type: "SHORT" as const,
      text: c.text,
      createdAt: c.createdAt,
      reference: {
        title: c.short.title,
        url: `/dashboard/shorts`,
        thumbnailUrl: c.short.thumbnailUrl || undefined,
      }
    }));
  } catch (error) {
    console.error("Error fetching comment history:", error);
    return [];
  }
}
