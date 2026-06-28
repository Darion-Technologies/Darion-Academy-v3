import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '../../../auth-utils';
import { sendPushNotification } from '@/lib/push';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await props.params;
    const lessonId = params.id;
    const { text, timestamp, isDoubt } = await request.json();

    if (!text) return NextResponse.json({ error: 'Note text is required.' }, { status: 400 });

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true }
    });

    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

    const enrollment = await prisma.enrollment.findUnique({
      where: { learnerId_courseId: { learnerId: user.id, courseId: lesson.module.courseId } },
    });

    if (!enrollment && user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const newNote = await prisma.videoNote.create({
      data: { userId: user.id, lessonId, timestamp: Math.floor(timestamp), text, isDoubt }
    });

    if (isDoubt && enrollment?.mentorId) {
      await prisma.notification.create({
        data: {
          userId: enrollment.mentorId,
          type: "GENERAL",
          title: "Question from learner",
          message: `${user.user_metadata?.name || user.email || "A learner"} asked a question in ${lesson.title}`,
          href: `/mentor/learners/${user.id}`
        }
      });
      await sendPushNotification(enrollment.mentorId, {
        title: "Question from learner",
        body: `${user.user_metadata?.name || user.email || "A learner"} asked a question in ${lesson.title}`,
        url: `/mentor/learners/${user.id}`
      });
    }

    return NextResponse.json({ success: true, note: newNote });
  } catch (error: any) {
    console.error('Error creating video note:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');

    if (!noteId) return NextResponse.json({ error: 'Note ID is required.' }, { status: 400 });

    const note = await prisma.videoNote.findUnique({ where: { id: noteId } });
    if (!note || note.userId !== user.id) {
      return NextResponse.json({ error: 'Note not found or unauthorized.' }, { status: 403 });
    }

    await prisma.videoNote.delete({ where: { id: noteId } });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting video note:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
