import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '../../auth-utils';
import { refreshEnrollmentProgress } from '@/lib/progress';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { lessonId, timestamp, maxTimestamp, completed } = body;

    if (!lessonId) return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 });

    await prisma.videoProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      update: { 
        timestamp: timestamp !== undefined ? timestamp : undefined, 
        maxTimestamp: maxTimestamp !== undefined ? { set: maxTimestamp } : undefined, 
        completed: completed ? true : undefined 
      },
      create: { 
        userId: user.id, 
        lessonId, 
        timestamp: timestamp || 0, 
        maxTimestamp: maxTimestamp || timestamp || 0, 
        completed: !!completed 
      }
    });

    if (completed) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { module: { include: { course: true } } },
      });

      if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

      await prisma.progress.upsert({
        where: { userId_lessonId: { userId: user.id, lessonId } },
        update: { completed: true, completedAt: new Date() },
        create: { userId: user.id, lessonId, completed: true, completedAt: new Date() }
      });
      await refreshEnrollmentProgress(prisma, user.id, lesson.module.courseId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving video progress:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
