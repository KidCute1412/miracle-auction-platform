import { redisClient } from "@/config/redis.config.ts";
import { MutateAuctionUseCase } from "@/modules/bids/application/mutate-auction.use-case.ts";
import { redisAuctionKeys } from "@/modules/bids/infrastructure/redis/redis-auction.keys.ts";

const mutations = new MutateAuctionUseCase();
let timer: NodeJS.Timeout | undefined;
let running = false;

export async function closeDueRedisAuctions(now = new Date(), limit = 100): Promise<number> {
  if (running) return 0;
  running = true;
  try {
    const due = await redisClient.zrangebyscore(
      redisAuctionKeys.deadlines,
      0,
      now.getTime(),
      "WITHSCORES",
      "LIMIT",
      0,
      limit,
    );
    let closed = 0;
    for (let index = 0; index < due.length; index += 2) {
      const productId = Number(due[index]);
      const deadlineMs = due[index + 1];
      try {
        await mutations.close(productId, deadlineMs, now);
        closed += 1;
      } catch (error) {
        console.error("[AUCTION_CLOSE] Mutation failed", { productId, error });
      }
    }
    return closed;
  } finally {
    running = false;
  }
}

export function startRedisAuctionCloseJob(intervalMs = 1_000): void {
  if (timer) return;
  timer = setInterval(() => void closeDueRedisAuctions(), intervalMs);
  timer.unref();
}

export function stopRedisAuctionCloseJob(): void {
  if (timer) clearInterval(timer);
  timer = undefined;
}
