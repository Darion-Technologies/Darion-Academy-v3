import { PrismaClient } from "../generated/prisma";

function migrationUrl() {
  const configured = process.env.DATABASE_URL;
  if (!configured) throw new Error("DATABASE_URL is not configured.");
  const url = new URL(configured);
  if (url.hostname.includes("pooler.supabase.com")) {
    url.port = "6543";
    url.searchParams.set("pgbouncer", "true");
    url.searchParams.set("connection_limit", "1");
  }
  return url.toString();
}

const prisma = new PrismaClient({ datasourceUrl: migrationUrl() });

async function main() {
  const enumExists = await prisma.$queryRawUnsafe<{ present: boolean }[]>(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AppearanceTheme') AS present`,
  );
  if (!enumExists[0]?.present) {
    await prisma.$executeRawUnsafe(`CREATE TYPE "AppearanceTheme" AS ENUM ('SYSTEM', 'LIGHT', 'DARK')`);
  }

  const columns = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'LearningPreference'
       AND column_name IN ('theme', 'sidebarCollapsed')`,
  );
  const present = new Set(columns.map((column) => column.column_name));
  if (!present.has("theme")) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "LearningPreference" ADD COLUMN "theme" "AppearanceTheme" NOT NULL DEFAULT 'SYSTEM'`,
    );
  }
  if (!present.has("sidebarCollapsed")) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "LearningPreference" ADD COLUMN "sidebarCollapsed" BOOLEAN NOT NULL DEFAULT false`,
    );
  }
  console.log("Appearance preference migration applied.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
