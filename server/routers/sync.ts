import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const syncRouter = router({
  pullChanges: protectedProcedure
    .input(z.object({
      lastPulledAt: z.number().nullable(),
      schemaVersion: z.number(),
      migration: z.any().nullable(),
    }))
    .query(async ({ input, ctx }) => {
      const { lastPulledAt } = input;
      const { userId, prisma } = ctx;

      const updatedAfter = lastPulledAt ? new Date(lastPulledAt) : new Date(0);

      // Fetch from Prisma
      const courses = await prisma.course.findMany({
        where: { updatedAt: { gt: updatedAfter }, status: 'PUBLISHED' }
      });
      
      const lessons = await prisma.lesson.findMany({
        where: { updatedAt: { gt: updatedAfter } },
        include: { module: true }
      });

      const videoProgress = await prisma.videoProgress.findMany({
        where: { userId, updatedAt: { gt: updatedAfter } }
      });

      const videoNotes = await prisma.videoNote.findMany({
        where: { userId, updatedAt: { gt: updatedAfter } }
      });

      // Helper to categorize based on createdAt vs lastPulledAt
      const categorize = (records: any[], mapper: (r: any) => any) => {
        const created: any[] = [];
        const updated: any[] = [];
        for (const record of records) {
          if (!lastPulledAt || record.createdAt.getTime() > lastPulledAt) {
            created.push(mapper(record));
          } else {
            updated.push(mapper(record));
          }
        }
        return { created, updated, deleted: [] };
      };

      // Progress doesn't have createdAt, so we rely on lastPulledAt purely
      const progressCategorize = (records: any[], mapper: (r: any) => any) => {
        const created: any[] = [];
        const updated: any[] = [];
        for (const record of records) {
          if (!lastPulledAt) {
            created.push(mapper(record));
          } else {
            updated.push(mapper(record));
          }
        }
        return { created, updated, deleted: [] };
      };

      return {
        changes: {
          courses: categorize(courses, (c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            thumbnail_url: c.thumbnailUrl || null,
            status: c.status,
            created_at: c.createdAt.getTime(),
            updated_at: c.updatedAt.getTime(),
          })),
          lessons: categorize(lessons, (l) => ({
            id: l.id,
            course_id: l.module.courseId,
            title: l.title,
            type: l.type,
            content: l.content || null,
            video_url: l.videoUrl || null,
            order: l.order,
            created_at: l.createdAt.getTime(),
            updated_at: l.updatedAt.getTime(),
          })),
          progress: progressCategorize(videoProgress, (p) => ({
            id: p.id,
            lesson_id: p.lessonId,
            timestamp: p.timestamp,
            max_timestamp: p.maxTimestamp,
            completed: p.completed,
            updated_at: p.updatedAt.getTime(),
          })),
          notes: categorize(videoNotes, (n) => ({
            id: n.id,
            lesson_id: n.lessonId,
            timestamp: n.timestamp,
            text: n.text,
            is_doubt: n.isDoubt,
            created_at: n.createdAt.getTime(),
            updated_at: n.updatedAt.getTime(),
          })),
        },
        timestamp: Date.now(),
      };
    }),

  pushChanges: protectedProcedure
    .input(z.object({
      changes: z.any(),
      lastPulledAt: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { changes } = input;
      const { userId, prisma } = ctx;

      await prisma.$transaction(async (tx) => {
        // Handle Progress
        if (changes.progress) {
          const progressCreated = changes.progress.created || [];
          const progressUpdated = changes.progress.updated || [];
          const progressToUpsert = [...progressCreated, ...progressUpdated];

          for (const p of progressToUpsert) {
            await tx.videoProgress.upsert({
              where: {
                userId_lessonId: {
                  userId,
                  lessonId: p.lesson_id,
                },
              },
              create: {
                id: p.id,
                userId,
                lessonId: p.lesson_id,
                timestamp: p.timestamp,
                maxTimestamp: p.max_timestamp,
                completed: p.completed,
              },
              update: {
                id: p.id, // Keep the client-generated ID as the primary key source of truth
                timestamp: p.timestamp,
                maxTimestamp: p.max_timestamp,
                completed: p.completed,
              },
            });
          }

          if (changes.progress.deleted?.length > 0) {
            await tx.videoProgress.deleteMany({
              where: { id: { in: changes.progress.deleted }, userId }
            });
          }
        }

        // Handle Notes
        if (changes.notes) {
          const notesCreated = changes.notes.created || [];
          const notesUpdated = changes.notes.updated || [];
          const notesToUpsert = [...notesCreated, ...notesUpdated];

          for (const n of notesToUpsert) {
            await tx.videoNote.upsert({
              where: { id: n.id },
              create: {
                id: n.id,
                userId,
                lessonId: n.lesson_id,
                timestamp: n.timestamp,
                text: n.text,
                isDoubt: n.is_doubt,
              },
              update: {
                timestamp: n.timestamp,
                text: n.text,
                isDoubt: n.is_doubt,
              },
            });
          }

          if (changes.notes.deleted?.length > 0) {
            await tx.videoNote.deleteMany({
              where: { id: { in: changes.notes.deleted }, userId }
            });
          }
        }
      });

      return { success: true };
    }),
});
