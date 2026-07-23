import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { redisClient } from "@/config/redis.config.ts";
import { BidDomainError, BidInfrastructureError } from "../../domain/bid.errors.ts";
import { parseMoneyVnd } from "../../domain/money.ts";
import { mutationKeys } from "./redis-auction.keys.ts";
import type { AuctionMutationCommand, AuctionMutationResult } from "./redis-auction.types.ts";

const SCRIPT_URL = new URL("./auction-mutate.lua", import.meta.url);
let scriptSha: string | undefined;

function fingerprint(command: AuctionMutationCommand): string {
  return [
    command.operation,
    command.productId,
    command.actorId,
    command.amountVnd ?? "",
    command.targetUserId ?? "",
    command.reason ?? "",
  ].join(":");
}

async function loadScript(): Promise<string> {
  const source = await readFile(SCRIPT_URL, "utf8");
  scriptSha = await redisClient.script("LOAD", source) as string;
  return scriptSha;
}

async function evaluate(keys: string[], payload: string): Promise<unknown> {
  const sha = scriptSha ?? await loadScript();
  try {
    return await redisClient.evalsha(sha, keys.length, ...keys, payload);
  } catch (error) {
    if (error instanceof Error && error.message.includes("NOSCRIPT")) {
      return redisClient.evalsha(await loadScript(), keys.length, ...keys, payload);
    }
    throw error;
  }
}

export class RedisAuctionAuthority {
  async mutate(command: AuctionMutationCommand): Promise<Extract<AuctionMutationResult, { status: "success" }>> {
    if (!command.idempotencyKey || command.idempotencyKey.length > 255) {
      throw new BidDomainError("A valid idempotency key is required", 400, "IDEMPOTENCY_KEY_REQUIRED");
    }
    if (command.amountVnd !== undefined) parseMoneyVnd(command.amountVnd);
    const eventId = randomUUID();
    const orderId = command.orderId ?? (
      command.operation === "BUY_NOW" || command.operation === "CLOSE" ? randomUUID() : undefined
    );
    const payload = JSON.stringify({
      ...command,
      eventId,
      orderId,
      nowMs: (command.now ?? new Date()).getTime().toString(),
      fingerprint: fingerprint(command),
      rateLimit: Number(process.env.BID_RATE_LIMIT ?? 30),
      rateWindowMs: Number(process.env.BID_RATE_WINDOW_MS ?? 10_000),
      idempotencyTtlMs: Number(process.env.BID_IDEMPOTENCY_TTL_MS ?? 86_400_000),
    });

    let raw: unknown;
    try {
      raw = await evaluate(mutationKeys(command.productId, command.actorId), payload);
    } catch (error) {
      console.error("[BIDDING] Redis authority failure", error);
      throw new BidInfrastructureError();
    }
    if (typeof raw !== "string") throw new BidInfrastructureError("Bidding authority returned an invalid result");

    let result: AuctionMutationResult;
    try {
      result = JSON.parse(raw) as AuctionMutationResult;
    } catch {
      throw new BidInfrastructureError("Bidding authority returned malformed JSON");
    }
    if (result.status === "error") {
      if (result.statusCode >= 500) throw new BidInfrastructureError(result.message);
      throw new BidDomainError(result.message, result.statusCode, result.code);
    }
    return result;
  }
}

export const redisAuctionAuthority = new RedisAuctionAuthority();
