import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Limit the internal connection pool to 5 to avoid exhausting Supabase's
// transaction-mode PgBouncer pooler (port 6543), which causes intermittent
// P1001 "Can't reach database" errors under concurrent query bursts.
function buildDatasourceUrl() {
  const base = process.env.DATABASE_URL ?? "";
  if (!base || base.includes("connection_limit=")) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}connection_limit=10&pool_timeout=15`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: buildDatasourceUrl() } },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
