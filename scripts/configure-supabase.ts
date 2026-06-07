import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const statements = [
    `ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE "Enrollment" ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE "Certificate" ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS "notification_owner_select" ON "Notification"`,
    `CREATE POLICY "notification_owner_select" ON "Notification" FOR SELECT TO authenticated USING ("userId" = auth.uid())`,
    `DROP POLICY IF EXISTS "enrollment_participant_select" ON "Enrollment"`,
    `CREATE POLICY "enrollment_participant_select" ON "Enrollment" FOR SELECT TO authenticated USING (
      "learnerId" = auth.uid()
      OR "mentorId" = auth.uid()
      OR EXISTS (SELECT 1 FROM "User" WHERE "User"."id" = auth.uid() AND "User"."role" = 'ADMIN' AND "User"."active" = true)
    )`,
    `DROP POLICY IF EXISTS "certificate_owner_select" ON "Certificate"`,
    `CREATE POLICY "certificate_owner_select" ON "Certificate" FOR SELECT TO authenticated USING (
      "userId" = auth.uid()
      OR EXISTS (SELECT 1 FROM "User" WHERE "User"."id" = auth.uid() AND "User"."role" = 'ADMIN' AND "User"."active" = true)
    )`,
  ];

  for (const statement of statements) await prisma.$executeRawUnsafe(statement);
  for (const table of ["Notification", "Enrollment", "Certificate"]) {
    const published = await prisma.$queryRawUnsafe<{ present: boolean }[]>(
      `SELECT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = $1
      ) AS present`,
      table,
    );
    if (!published[0]?.present) {
      await prisma.$executeRawUnsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE "${table}"`);
    }
  }
  console.log("Configured authenticated RLS policies and Supabase Realtime publication.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
