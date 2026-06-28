import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '../../auth-utils';
import { refreshEnrollmentProgress } from '@/lib/progress';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { lessonId } = body;

    if (!lessonId) return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 });

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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error completing lesson:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
