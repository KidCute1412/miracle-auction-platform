import { createComponentLogger } from "@/infrastructure/observability/logger.ts";

const log = createComponentLogger("test-db");

import { prisma } from "./infrastructure/database/prisma.client.ts";

async function run() {
  try {
    const [categories, users] = await Promise.all([prisma.categories.findMany(), prisma.users.findMany()]);
    log.info(
      "Categories in database:",
      categories.map((category) => ({ id: category.id, name: category.name, created_by: category.created_by })),
    );
    log.info(
      "Users in database:",
      users.map((user) => ({ user_id: user.user_id, full_name: user.full_name })),
    );
  } catch (error) {
    log.error("Error executing database query:", error);
  } finally {
    await prisma.$disconnect();
  }
}

void run();
