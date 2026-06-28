import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { emailOrId, password } = await request.json();

    if (!emailOrId || !password) {
      return NextResponse.json({ error: 'Email/Employee ID and password are required' }, { status: 400 });
    }

    let email = emailOrId.trim().toLowerCase();

    // If it doesn't look like an email, assume it's an Employee ID
    if (!email.includes('@')) {
      const userRecord = await prisma.user.findUnique({
        where: { employeeId: emailOrId.trim() },
        select: { email: true, active: true },
      });

      if (!userRecord) {
        return NextResponse.json({ error: 'No account found with that Employee ID' }, { status: 404 });
      }
      if (!userRecord.active) {
        return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
      }
      email = userRecord.email;
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      return NextResponse.json({ error: error?.message || 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({
      access_token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role,
      }
    });

  } catch (error: any) {
    console.error('Mobile login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
