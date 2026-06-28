import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUserFromRequest } from '@/app/api/mobile/auth-utils';

const bucket = 'course-files';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    select: {
      thumbnailUrl: true,
      enrollments: {
        where: { learnerId: user.id },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!course?.thumbnailUrl || course.enrollments.length === 0) {
    return NextResponse.json({ error: 'Thumbnail not found.' }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(bucket).download(course.thumbnailUrl);

  if (error || !data) {
    return NextResponse.json({ error: 'Thumbnail could not be downloaded.' }, { status: 404 });
  }

  const arrayBuffer = await data.arrayBuffer();

  return new NextResponse(arrayBuffer, {
    headers: {
      'Content-Type': data.type || 'image/jpeg',
      'Cache-Control': 'private, max-age=86400',
    },
  });
}
