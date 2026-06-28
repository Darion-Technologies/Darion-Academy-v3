import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCalendarData } from '@/lib/calendar-data';

import { getUserFromRequest } from '../auth-utils';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getCalendarData(user.id);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching mobile calendar:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
