import { env } from "@/env";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Hoist the pg.Pool into globalThis so it survives hot-reloads in dev.
// Without this, each HMR cycle creates a fresh Pool, exhausting DB connections.
const globalForPrisma = globalThis as unknown as {
  pgPool?: pg.Pool;
  prisma?: PrismaClient;
};

if (!globalForPrisma.pgPool) {
  globalForPrisma.pgPool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    // Cap pool size to avoid exhausting DB max_connections during dev reloads
    max: 5,
  });
}

const adapter = new PrismaPg(globalForPrisma.pgPool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
