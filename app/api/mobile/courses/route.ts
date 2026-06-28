import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTopDashboardData } from '@/lib/dashboard-data';
import { createSignedUrl } from '@/lib/storage';
import { getUserFromRequest } from '../auth-utils';

const THUMBNAIL_BUCKET = 'course-files';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getTopDashboardData(user.id);
    
    // Collect course IDs that have thumbnails
    const courseIds = data.enrollments
      .filter(e => e.hasThumbnail)
      .map(e => e.courseId);

    // Fetch the actual storage paths from DB
    const courses = courseIds.length > 0 ? await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, thumbnailUrl: true },
    }) : [];

    // Generate signed URLs
    const signedUrlMap = new Map<string, string>();
    await Promise.all(
      courses.map(async (course) => {
        if (course.thumbnailUrl) {
          try {
            const signedUrl = await createSignedUrl(THUMBNAIL_BUCKET, course.thumbnailUrl, 3600);
            signedUrlMap.set(course.id, signedUrl);
          } catch {
            // Skip on error
          }
        }
      })
    );

    // Attach signed URL to enrollment
    const enrollmentsWithThumbnails = data.enrollments.map(e => ({
      ...e,
      courseThumbnail: signedUrlMap.get(e.courseId) || null
    }));

    return NextResponse.json(enrollmentsWithThumbnails);
  } catch (error: any) {
    console.error('Error fetching mobile courses:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
