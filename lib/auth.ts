import { UserRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

export const roleHome: Record<UserRole, string> = {
  ADMIN: "/admin",
  MENTOR: "/mentor",
  EMPLOYEE: "/dashboard",
  INTERN: "/dashboard",
};

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;
  return prisma.user.findUnique({ where: { id: authUser.id } });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user || !user.active) redirect("/login");
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    const learnerOnly = roles.every((role) => role === "EMPLOYEE" || role === "INTERN");
    const hasEnrollment = learnerOnly && await prisma.enrollment.findFirst({
      where: { learnerId: user.id },
      select: { id: true },
    });
    if (!hasEnrollment) redirect(roleHome[user.role]);
  }
  return user;
}

export async function canReviewLearner(reviewerId: string, role: UserRole, learnerId: string) {
  if (role === "ADMIN") return true;
  if (role !== "MENTOR") return false;
  return Boolean(
    await prisma.enrollment.findFirst({
      where: { learnerId, mentorId: reviewerId },
      select: { id: true },
    }),
  );
}
