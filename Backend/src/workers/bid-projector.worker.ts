import { hostname } from "node:os";
import {
  closeProjectorRedisConnection,
  runProjectorBatch,
} from "@/modules/bids/infrastructure/redis/redis-stream.projector.ts";

const consumer = `${hostname()}-${process.pid}`;
let active = false;
let loop: Promise<void> | undefined;

async function projectorLoop(): Promise<void> {
  while (active) {
    try {
      await runProjectorBatch(consumer);
    } catch (error) {
      console.error("[BID_PROJECTOR] Batch failed", error);
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }
}

export function startBidProjector(): void {
  if (active) return;
  active = true;
  loop = projectorLoop();
}

export async function stopBidProjector(): Promise<void> {
  active = false;
  await loop;
  await closeProjectorRedisConnection();
  loop = undefined;
}
