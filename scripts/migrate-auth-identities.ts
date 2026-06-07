import { PrismaClient, type User } from "../generated/prisma";
import { createClient, type User as AuthUser } from "@supabase/supabase-js";
import { identityPlan } from "../lib/auth-migration";

const prisma = new PrismaClient();
const dryRun = !process.argv.includes("--execute");
const canonicalMentorEmail = "mentor@darion.in";
const duplicateMentorEmail = "mentor@dariongroup.com";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin credentials are not configured.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function listAuthUsers() {
  const supabase = adminClient();
  const users: AuthUser[] = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }
  return users;
}

async function mergeDuplicateMentor() {
  const [canonical, duplicate] = await Promise.all([
    prisma.user.findUnique({ where: { email: canonicalMentorEmail } }),
    prisma.user.findUnique({ where: { email: duplicateMentorEmail } }),
  ]);
  if (!duplicate) return { action: "not-present" };
  if (!canonical) throw new Error(`Canonical mentor ${canonicalMentorEmail} is missing.`);
  if (!duplicate.active) return { action: "already-inactive", duplicateId: duplicate.id, canonicalId: canonical.id };
  if (dryRun) return { action: "would-merge", duplicateId: duplicate.id, canonicalId: canonical.id };

  await prisma.$transaction(async (tx) => {
    await tx.enrollment.updateMany({ where: { mentorId: duplicate.id }, data: { mentorId: canonical.id } });
    await tx.submission.updateMany({ where: { reviewerId: duplicate.id }, data: { reviewerId: canonical.id } });
    await tx.certificate.updateMany({ where: { issuerId: duplicate.id }, data: { issuerId: canonical.id } });
    await tx.certificate.updateMany({ where: { revokedById: duplicate.id }, data: { revokedById: canonical.id } });
    await tx.feedback.updateMany({ where: { authorId: duplicate.id }, data: { authorId: canonical.id } });
    await tx.activityLog.updateMany({ where: { actorId: duplicate.id }, data: { actorId: canonical.id } });
    await tx.user.update({ where: { id: duplicate.id }, data: { active: false } });
    await tx.activityLog.create({
      data: {
        actorId: canonical.id,
        action: "Merged duplicate mentor profile",
        entityType: "User",
        entityId: duplicate.id,
        metadata: { duplicateEmail: duplicate.email, canonicalEmail: canonical.email },
      },
    });
  });
  return { action: "merged", duplicateId: duplicate.id, canonicalId: canonical.id };
}

async function rekeyProfile(profile: User, authId: string) {
  if (profile.id === authId) return;
  await prisma.$executeRaw`UPDATE "User" SET "id" = ${authId}::uuid WHERE "id" = ${profile.id}::uuid`;
}

async function main() {
  const supabase = adminClient();
  const [profiles, authUsers] = await Promise.all([
    prisma.user.findMany({ orderBy: { email: "asc" } }),
    listAuthUsers(),
  ]);
  const plan = identityPlan(profiles, authUsers);
  const report: Record<string, unknown> = {
    mode: dryRun ? "dry-run" : "execute",
    generatedAt: new Date().toISOString(),
    duplicateMentor: await mergeDuplicateMentor(),
    identities: plan,
    results: [],
  };

  if (!dryRun) {
    const results: unknown[] = [];
    let failures = 0;
    for (const item of plan) {
      if (item.email.toLowerCase() === duplicateMentorEmail) {
        results.push({ email: item.email, result: "duplicate-profile-deactivated" });
        continue;
      }
      const profile = profiles.find((candidate) => candidate.id === item.profileId)!;
      if (item.action === "linked") {
        results.push({ email: item.email, result: "already-linked" });
        continue;
      }

      let authId = item.authId;
      let createdAuthUser = false;
      if (!authId) {
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(profile.email, {
          data: { name: profile.name, role: profile.role },
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/settings`,
        });
        if (error || !data.user) {
          results.push({ email: item.email, result: "invite-failed", error: error?.message });
          failures += 1;
          continue;
        }
        authId = data.user.id;
        createdAuthUser = true;
      }

      try {
        await rekeyProfile(profile, authId);
        results.push({ email: item.email, result: "linked", oldId: profile.id, authId });
      } catch (error) {
        if (createdAuthUser) await supabase.auth.admin.deleteUser(authId);
        results.push({
          email: item.email,
          result: "profile-migration-failed",
          compensated: createdAuthUser,
          error: error instanceof Error ? error.message : String(error),
        });
        failures += 1;
      }
    }
    report.results = results;
    if (failures > 0) process.exitCode = 1;
  }

  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
