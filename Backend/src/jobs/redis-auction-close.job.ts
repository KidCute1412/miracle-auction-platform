import { randomUUID } from "node:crypto";
import { createComponentLogger, runWithLogContext } from "@/infrastructure/observability/logger.ts";

const log = createComponentLogger("redis-auction-close.job");

import { getAuctionRedisClients } from "@/config/redis.config.ts";
import { MutateAuctionUseCase } from "@/modules/bids/application/mutate-auction.use-case.ts";
import { redisAuctionKeys } from "@/modules/bids/infrastructure/redis/redis-auction.keys.ts";

const mutations = new MutateAuctionUseCase();
let timer: NodeJS.Timeout | undefined;
let running = false;
let currentRun: Promise<number> | undefined;

export async function closeDueRedisAuctions(now = new Date(), limit = 100): Promise<number> {
  if (running) return 0;
  running = true;
  try {
    let closed = 0;
    for (const redis of getAuctionRedisClients()) {
      const due = await redis.zrangebyscore(redisAuctionKeys.deadlines, 0, now.getTime(), "WITHSCORES", "LIMIT", 0, limit);
      for (let index = 0; index < due.length; index += 2) {
        const productId = Number(due[index]);
        const deadlineMs = due[index + 1];
        try {
          await mutations.close(productId, deadlineMs, now);
          closed += 1;
        } catch (error) {
          log.error("[AUCTION_CLOSE] Mutation failed", { productId, error });
        }
      }
    }
    return closed;
  } finally {
    running = false;
  }
}

export function startRedisAuctionCloseJob(intervalMs = 1_000): void {
  if (timer) return;
  timer = setInterval(() => {
    if (currentRun) return;
    currentRun = runWithLogContext({ jobId: randomUUID() }, closeDueRedisAuctions).finally(() => {
      currentRun = undefined;
    });
  }, intervalMs);
  timer.unref();
}

export async function stopRedisAuctionCloseJob(): Promise<void> {
  if (timer) clearInterval(timer);
  timer = undefined;
  await currentRun;
}
