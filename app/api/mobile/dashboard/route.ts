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

    // Collect unique course IDs from pending actions that have thumbnails
    const courseIds = [...new Set(
      data.pendingActions
        .filter(a => a.courseThumbnail) // courseThumbnail is now the API path like '/api/mobile/courses/ID/thumbnail'
        .map(a => {
          // Extract course ID from path: /api/mobile/courses/COURSE_ID/thumbnail
          const match = a.courseThumbnail?.match(/\/api\/mobile\/courses\/([^/]+)\/thumbnail/);
          return match ? match[1] : null;
        })
        .filter(Boolean) as string[]
    )];

    // Fetch the actual storage paths from DB
    const courses = courseIds.length > 0 ? await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, thumbnailUrl: true },
    }) : [];

    // Generate signed URLs for each course
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

    // Replace courseThumbnail with actual signed URLs
    const pendingActionsWithSignedUrls = data.pendingActions.map((action) => {
      if (!action.courseThumbnail) return action;
      const match = action.courseThumbnail.match(/\/api\/mobile\/courses\/([^/]+)\/thumbnail/);
      const courseId = match ? match[1] : null;
      const signedUrl = courseId ? signedUrlMap.get(courseId) : null;
      return { ...action, courseThumbnail: signedUrl ?? null };
    });

    return NextResponse.json({ ...data, pendingActions: pendingActionsWithSignedUrls });

  } catch (error: any) {
    console.error('Error fetching mobile dashboard data:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
