import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '../auth-utils';

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { token } = await request.json().catch(() => ({}));
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }

  await prisma.expoPushToken.upsert({
    where: { token },
    update: { userId: user.id },
    create: { userId: user.id, token },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { token } = await request.json().catch(() => ({}));
  if (!token) return NextResponse.json({ error: 'token is required' }, { status: 400 });

  await prisma.expoPushToken.deleteMany({ where: { userId: user.id, token } });
  return NextResponse.json({ success: true });
}
