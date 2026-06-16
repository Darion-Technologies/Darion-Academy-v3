import { UserRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

import { unstable_cache } from "next/cache";

export const roleHome: Record<UserRole, string> = {
  ADMIN: "/admin",
  MENTOR: "/mentor",
  EMPLOYEE: "/dashboard",
  INTERN: "/dashboard",
};

const getCachedUser = unstable_cache(
  async (id: string) => prisma.user.findUnique({ where: { id } }),
  ["user-profile"],
  { tags: ["user-profile"], revalidate: 3600 }
);

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await getCachedUser(user.id);
  if (!dbUser) return null;
  
  // unstable_cache serializes Dates to strings, so we must restore them
  return {
    ...dbUser,
    createdAt: new Date(dbUser.createdAt),
    updatedAt: new Date(dbUser.updatedAt),
  };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user || !user.active) redirect("/login");
  return user;
}

const getCachedEnrollment = unstable_cache(
  async (learnerId: string, mentorId?: string) => prisma.enrollment.findFirst({
    where: mentorId ? { learnerId, mentorId } : { learnerId },
    select: { id: true },
  }),
  ["user-enrollment"],
  { tags: ["user-enrollment"], revalidate: 3600 }
);

export async function requireRole(...roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    const learnerOnly = roles.every((role) => role === "EMPLOYEE" || role === "INTERN");
    const hasEnrollment = learnerOnly && await getCachedEnrollment(user.id);
    if (!hasEnrollment) redirect(roleHome[user.role]);
  }
  return user;
}

export async function canReviewLearner(reviewerId: string, role: UserRole, learnerId: string) {
  if (role === "ADMIN") return true;
  if (role !== "MENTOR") return false;
  return Boolean(await getCachedEnrollment(learnerId, reviewerId));
}
