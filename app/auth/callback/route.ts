import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const profile = await prisma.user.findUnique({
        where: { id: data.user.id },
        select: { active: true },
      });
      if (profile?.active) return NextResponse.redirect(`${origin}${next}`);
      await supabase.auth.signOut();
    }
  }
  return NextResponse.redirect(`${origin}/login?error=account_unavailable`);
}
