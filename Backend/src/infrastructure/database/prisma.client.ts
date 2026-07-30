import { PrismaClient } from "@prisma/client";
import { getLogger, safeError } from "@/infrastructure/observability/logger.ts";

const log = getLogger({ component: "database" });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function checkPrismaConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    log.error({ err: safeError(error) }, "Database connection check failed");
    return false;
  }
}
