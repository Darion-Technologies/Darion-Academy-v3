import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTopDashboardData } from '@/lib/dashboard-data';

import { getUserFromRequest } from '../auth-utils';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getTopDashboardData(user.id);

    return NextResponse.json({
      user: data.user,
      stats: data.stats
    });
  } catch (error: any) {
    console.error('Error fetching mobile profile:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
