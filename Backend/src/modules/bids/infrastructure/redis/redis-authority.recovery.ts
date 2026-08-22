import { createHash, randomUUID } from "node:crypto";
import { hostname } from "node:os";
import { Prisma } from "@prisma/client";
import { getAuctionRedisClients } from "@/config/redis.config.ts";
import { kafkaTopics } from "@/config/kafka-topics.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { addOutboxEvent } from "@/infrastructure/events/outbox.repository.ts";
import { getLogger, safeError } from "@/infrastructure/observability/logger.ts";
import { bootstrapRedisAuction } from "./redis-auction.bootstrap.ts";
import { redisAuctionKeys } from "./redis-auction.keys.ts";
import { reconcileAuctionProjection } from "./redis-projection.reconciliation.ts";
import {
  captureProjectorStreamWatermarks,
  ensureProjectorGroup,
  getProjectorStreamHealth,
  hasUndrainedProjectorEntries,
  runProjectorBatch,
} from "./redis-stream.projector.ts";

const log = getLogger({ component: "redis-authority-recovery" });
const SCHEMA_VERSION = 1;
const ownerId = `${hostname()}-${process.pid}-${randomUUID()}`;

export type AuctionAuthorityRecoveryState = "disabled" | "checking" | "ready" | "recovering" | "failed";

export interface AuctionAuthorityRecoveryRuntime {
  state: AuctionAuthorityRecoveryState;
  ready: boolean;
  recoveryEpoch?: string;
  trigger?: string;
  lastError?: string;
  lastCheckedAt?: string;
  scope?: "none" | "auctions" | "global";
  affectedAuctionIds?: number[];
}

let runtime: AuctionAuthorityRecoveryRuntime = {
  state: process.env.AUCTION_AUTO_RECOVERY_ENABLED === "true" ? "checking" : "disabled",
  ready: process.env.AUCTION_AUTO_RECOVERY_ENABLED !== "true",
};
let running: Promise<AuctionAuthorityRecoveryRuntime> | undefined;

export function getAuctionAuthorityRecoveryRuntime(): AuctionAuthorityRecoveryRuntime {
  return { ...runtime };
}

interface AuthorityManifest {
  generation: string;
  recoveryEpoch: string;
  schemaVersion: number;
  recoveredAt: string;
}

interface ClaimedRecovery {
  generation: string;
  recovery_epoch: bigint;
  last_redis_healthy_at: Date;
}

interface RecoveryProduct {
  product_id: bigint;
}

function parseManifest(raw: string | null): AuthorityManifest | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthorityManifest>;
    if (
      typeof parsed.generation === "string" &&
      typeof parsed.recoveryEpoch === "string" &&
      parsed.schemaVersion === SCHEMA_VERSION &&
      typeof parsed.recoveredAt === "string"
    )
      return parsed as AuthorityManifest;
  } catch {
    // A malformed manifest is treated as an authority mismatch and rebuilt.
  }
  return undefined;
}

async function activeProductIds(): Promise<number[]> {
  const rows = await prisma.products.findMany({
    where: { auction_status: { in: ["PENDING", "ACTIVE"] }, is_removed: { not: true } },
    select: { product_id: true },
  });
  return rows.map((row) => Number(row.product_id));
}

async function inspectRedisAuthority(productIds: readonly number[], generation: string, epoch: bigint) {
  const clients = getAuctionRedisClients();
  const [manifests, fences, plannedBootstraps] = await Promise.all([
    Promise.all(clients.map((client) => client.get(redisAuctionKeys.authorityManifest))),
    Promise.all(clients.map((client) => client.exists(redisAuctionKeys.recoveryFence))),
    Promise.all(clients.map((client) => client.exists(redisAuctionKeys.plannedBootstrap))),
  ]);
  const parsed = manifests.map(parseManifest);
  const manifestMatches = parsed.every(
    (item) => item?.generation === generation && item.recoveryEpoch === epoch.toString(),
  );
  const activeBidRows = await prisma.bidding_history.findMany({
    where: { product_id: { in: productIds.map((productId) => BigInt(productId)) }, status: null },
    select: { product_id: true },
    distinct: ["product_id"],
  });
  const productsWithActiveBids = new Set(activeBidRows.map((row) => Number(row.product_id)));
  const statePresence = await Promise.all(
    productIds.map(async (productId) => {
      const client = clients[productId % clients.length]!;
      const stateKey = redisAuctionKeys.state(productId);
      const [stateType, maximaType, rankingType, rankMembersType, bansType, auctionFence] = await Promise.all([
        client.type(stateKey),
        client.type(redisAuctionKeys.maxima(productId)),
        client.type(redisAuctionKeys.ranking(productId)),
        client.type(redisAuctionKeys.rankMembers(productId)),
        client.type(redisAuctionKeys.bans(productId)),
        client.exists(redisAuctionKeys.auctionRecoveryFence(productId)),
      ]);
      const fields = stateType === "hash"
        ? await client.hmget(stateKey, "productId", "status", "sequence", "version", "currentPriceVnd", "endAtMs")
        : [];
      const requiresBidStructures = productsWithActiveBids.has(productId);
      const validType = (actual: string, expected: string, required: boolean): boolean =>
        actual === expected || (!required && actual === "none");
      const complete = stateType === "hash" &&
        validType(maximaType, "hash", requiresBidStructures) &&
        validType(rankingType, "zset", requiresBidStructures) &&
        validType(rankMembersType, "hash", requiresBidStructures) &&
        validType(bansType, "set", false) && fields.every((value) => value !== null);
      return { productId, exists: complete, fenced: auctionFence === 1 };
    }),
  );
  return {
    manifestMatches,
    manifestAbsent: manifests.every((item) => item === null),
    fencePresent: fences.some((item) => item === 1),
    plannedBootstrap: plannedBootstraps.some((item) => item === 1),
    missingProductIds: statePresence.filter((item) => !item.exists || item.fenced).map((item) => item.productId),
  };
}

async function writeManifest(manifest: AuthorityManifest): Promise<void> {
  await Promise.all(
    getAuctionRedisClients().map((client) => client.set(redisAuctionKeys.authorityManifest, JSON.stringify(manifest))),
  );
}

async function claimRecovery(trigger: string): Promise<ClaimedRecovery | undefined> {
  const leaseSeconds = Math.max(30, Number(process.env.AUCTION_RECOVERY_LEASE_SECONDS ?? 60));
  const rows = await prisma.$queryRaw<ClaimedRecovery[]>(Prisma.sql`
    UPDATE auction_authority_recovery
       SET owner_id = ${ownerId},
           lease_until = now() + (${leaseSeconds} * interval '1 second'),
           recovery_epoch = CASE WHEN state = 'READY' THEN recovery_epoch + 1 ELSE recovery_epoch END,
           state = 'RECOVERING',
           recovery_started_at = CASE WHEN state = 'READY' THEN now() ELSE recovery_started_at END,
           last_error = NULL,
           updated_at = now()
     WHERE id = 1
       AND (lease_until IS NULL OR lease_until < now() OR owner_id = ${ownerId})
     RETURNING generation, recovery_epoch, last_redis_healthy_at
  `);
  const claimed = rows[0];
  if (!claimed) return undefined;
  await prisma.auction_authority_recovery_runs.upsert({
    where: { recovery_epoch: claimed.recovery_epoch },
    create: {
      run_id: randomUUID(),
      recovery_epoch: claimed.recovery_epoch,
      trigger,
      status: "RUNNING",
      metadata: { ownerId },
    },
    update: { status: "RUNNING", error: null, metadata: { ownerId } },
  });
  return claimed;
}

async function renewLease(epoch: bigint): Promise<void> {
  const leaseSeconds = Math.max(30, Number(process.env.AUCTION_RECOVERY_LEASE_SECONDS ?? 60));
  const updated = await prisma.auction_authority_recovery.updateMany({
    where: { id: 1, owner_id: ownerId, recovery_epoch: epoch, state: "RECOVERING" },
    data: { lease_until: new Date(Date.now() + leaseSeconds * 1_000), updated_at: new Date() },
  });
  if (updated.count !== 1) throw new Error("Auction recovery lease was lost");
}

async function drainProjection(epoch: bigint, productIds?: readonly number[]): Promise<void> {
  await ensureProjectorGroup();
  const deadline = Date.now() + Math.max(30_000, Number(process.env.AUCTION_RECOVERY_DRAIN_TIMEOUT_MS ?? 120_000));
  const consumer = `authority-recovery-${ownerId}`;
  const targets = productIds?.map(String) ?? [];
  const watermarks = targets.length > 0 ? await captureProjectorStreamWatermarks() : undefined;
  while (Date.now() < deadline) {
    await runProjectorBatch(consumer);
    if (targets.length > 0 && watermarks && !(await hasUndrainedProjectorEntries(new Set(targets), watermarks))) return;
    const health = await getProjectorStreamHealth();
    if (targets.length === 0 && health.pending === 0 && health.lag === 0) return;
    await renewLease(epoch);
  }
  throw new Error("Timed out while draining Redis auction events into PostgreSQL");
}

async function extendInterruptedAuctions(
  lastHealthyAt: Date,
  epoch: bigint,
): Promise<{ products: RecoveryProduct[]; seconds: number }> {
  const graceSeconds = Math.max(0, Number(process.env.AUCTION_RECOVERY_GRACE_SECONDS ?? 300));
  const outageSeconds = Math.max(0, Math.ceil((Date.now() - lastHealthyAt.getTime()) / 1_000));
  const extensionSeconds = outageSeconds + graceSeconds;
  const recovered = await prisma.$transaction(async (tx) => {
    const products = await tx.$queryRaw<RecoveryProduct[]>(Prisma.sql`
      UPDATE products
         SET end_time = GREATEST(
               end_time + (${extensionSeconds} * interval '1 second'),
               now() + (${graceSeconds} * interval '1 second')
             ),
             last_authority_recovery_epoch = ${epoch}
       WHERE auction_status IN ('PENDING', 'ACTIVE')
         AND is_removed IS NOT TRUE
         AND end_time IS NOT NULL
         AND end_time >= ${lastHealthyAt}
         AND last_authority_recovery_epoch < ${epoch}
       RETURNING product_id
    `);
    for (const product of products) {
      await addOutboxEvent(tx, {
        topic: kafkaTopics.domain,
        eventType: "auction.authority_recovered",
        aggregateId: product.product_id.toString(),
        payload: { productId: product.product_id.toString(), recoveryEpoch: epoch.toString(), extensionSeconds },
      });
    }
    return products;
  });
  return { products: recovered, seconds: extensionSeconds };
}

type StoredTransition = {
  event_id: string;
  event_type: string;
  product_id: bigint;
  payload: Prisma.JsonValue;
  created_at: Date;
};

function restoredIdempotencyRecord(
  transition: StoredTransition,
): { digest: string; record: string; ttlMs: number } | undefined {
  if (!transition.payload || typeof transition.payload !== "object" || Array.isArray(transition.payload))
    return undefined;
  const event = transition.payload as Record<string, unknown>;
  const idempotencyKey = event.idempotencyKey;
  const actorId = event.actorId;
  const currentPrice = event.currentPriceVnd;
  const endAtMs = event.endAtMs;
  const sequence = event.sequence;
  const version = event.version;
  if ([idempotencyKey, actorId, currentPrice, endAtMs, sequence, version].some((value) => typeof value !== "string"))
    return undefined;
  const operationByType: Record<string, string> = {
    BID_ACCEPTED: "BID",
    BUY_NOW_COMPLETED: "BUY_NOW",
    BIDDER_BANNED: "BAN",
    AUCTION_CLOSED: "CLOSE",
    AUCTION_CANCELLED: "CANCEL",
  };
  const operation = operationByType[transition.event_type];
  if (!operation) return undefined;
  const amount = operation === "BID" || operation === "BUY_NOW" ? event.requestedMaxPriceVnd : "";
  if ((operation === "BID" || operation === "BUY_NOW") && typeof amount !== "string") return undefined;
  const target = operation === "BAN" ? event.targetUserId : "";
  const reason = operation === "BAN" ? (event.reason ?? "") : "";
  const fingerprint = [
    operation,
    transition.product_id.toString(),
    actorId,
    amount ?? "",
    target ?? "",
    reason ?? "",
  ].join(":");
  const result = JSON.stringify({
    status: "success",
    data: {
      event_id: transition.event_id,
      product_id: transition.product_id.toString(),
      current_price: currentPrice,
      leader_id: typeof event.leaderId === "string" && event.leaderId !== "" ? event.leaderId : null,
      end_time_ms: endAtMs,
      sequence,
      version,
      order_id: typeof event.orderId === "string" ? event.orderId : null,
    },
  });
  const configuredTtl = Number(process.env.BID_IDEMPOTENCY_TTL_MS ?? 86_400_000);
  const occurredAt =
    typeof event.occurredAtMs === "string" ? Number(event.occurredAtMs) : transition.created_at.getTime();
  const ttlMs = configuredTtl - Math.max(0, Date.now() - occurredAt);
  if (ttlMs <= 0) return undefined;
  return {
    digest: createHash("sha256")
      .update(idempotencyKey as string)
      .digest("hex"),
    record: JSON.stringify({ fingerprint, result }),
    ttlMs,
  };
}

async function restoreRecentIdempotency(): Promise<number> {
  const ttlMs = Number(process.env.BID_IDEMPOTENCY_TTL_MS ?? 86_400_000);
  const transitions = await prisma.auction_transitions.findMany({
    where: { created_at: { gte: new Date(Date.now() - ttlMs) } },
    select: { event_id: true, event_type: true, product_id: true, payload: true, created_at: true },
  });
  let restored = 0;
  for (const transition of transitions) {
    const item = restoredIdempotencyRecord(transition);
    if (!item) continue;
    const clients = getAuctionRedisClients();
    await clients[Number(transition.product_id % BigInt(clients.length))]!.set(
      redisAuctionKeys.idempotencyRequest(transition.product_id.toString(), item.digest),
      item.record,
      "PX",
      item.ttlMs,
    );
    restored += 1;
  }
  return restored;
}

async function performRecovery(
  trigger: string,
  targetProductIds: readonly number[] = [],
  globalRecovery = false,
): Promise<AuctionAuthorityRecoveryRuntime> {
  const claim = await claimRecovery(trigger);
  if (!claim) {
    runtime = { state: "checking", ready: false, trigger, lastCheckedAt: new Date().toISOString() };
    return runtime;
  }
  const epoch = claim.recovery_epoch;
  runtime = {
    state: "recovering",
    ready: !globalRecovery,
    recoveryEpoch: epoch.toString(),
    trigger,
    scope: globalRecovery ? "global" : "auctions",
    affectedAuctionIds: [...targetProductIds],
  };
  const fence = JSON.stringify({
    ownerId,
    recoveryEpoch: epoch.toString(),
    trigger,
    startedAt: new Date().toISOString(),
  });
  try {
    if (globalRecovery) {
      await Promise.all(getAuctionRedisClients().map((client) => client.set(redisAuctionKeys.recoveryFence, fence)));
    } else {
      await Promise.all(targetProductIds.map(async (productId) => {
        const client = getAuctionRedisClients()[productId % getAuctionRedisClients().length]!;
        await client.set(redisAuctionKeys.auctionRecoveryFence(productId), fence);
      }));
    }
    await drainProjection(epoch, globalRecovery ? undefined : targetProductIds);
    const extension =
      trigger === "FULL_DATA_LOSS"
        ? await extendInterruptedAuctions(claim.last_redis_healthy_at, epoch)
        : { products: [] as RecoveryProduct[], seconds: 0 };
    await renewLease(epoch);
    const refreshedProductIds = globalRecovery ? await activeProductIds() : [...targetProductIds];
    for (const productId of refreshedProductIds) {
      await bootstrapRedisAuction(productId, { recovery: true, force: true });
      const reconciliation = await reconcileAuctionProjection(productId);
      if (reconciliation.status !== "converged") {
        throw new Error(`Recovered auction ${productId} did not converge: ${reconciliation.status}`);
      }
      await renewLease(epoch);
    }
    const idempotencyRecords = await restoreRecentIdempotency();
    const completedAt = new Date();
    await writeManifest({
      generation: claim.generation,
      recoveryEpoch: epoch.toString(),
      schemaVersion: SCHEMA_VERSION,
      recoveredAt: completedAt.toISOString(),
    });
    await prisma.$transaction([
      prisma.auction_authority_recovery.update({
        where: { id: 1 },
        data: {
          state: "READY",
          owner_id: null,
          lease_until: null,
          recovery_completed_at: completedAt,
          last_redis_healthy_at: completedAt,
          last_error: null,
          updated_at: completedAt,
        },
      }),
      prisma.auction_authority_recovery_runs.update({
        where: { recovery_epoch: epoch },
        data: {
          status: "COMPLETED",
          completed_at: completedAt,
          recovered_auctions: refreshedProductIds.length,
          extension_seconds: extension.seconds,
          metadata: { ownerId, trigger, idempotencyRecords, extendedAuctions: extension.products.length },
        },
      }),
    ]);
    if (globalRecovery) {
      await Promise.all(getAuctionRedisClients().map((client) => client.del(redisAuctionKeys.recoveryFence)));
    } else {
      await Promise.all(targetProductIds.map(async (productId) => {
        const client = getAuctionRedisClients()[productId % getAuctionRedisClients().length]!;
        await client.del(redisAuctionKeys.auctionRecoveryFence(productId));
      }));
    }
    runtime = {
      state: "ready",
      ready: true,
      recoveryEpoch: epoch.toString(),
      trigger,
      lastCheckedAt: completedAt.toISOString(),
      scope: globalRecovery ? "global" : "none",
      affectedAuctionIds: [],
    };
    log.info(
      { trigger, epoch: epoch.toString(), auctions: refreshedProductIds.length },
      "Redis auction authority recovered from PostgreSQL",
    );
    return runtime;
  } catch (error) {
    const message = safeError(error).message.slice(0, 4_000);
    await prisma
      .$transaction([
        prisma.auction_authority_recovery.updateMany({
          where: { id: 1, recovery_epoch: epoch, owner_id: ownerId },
          data: {
            state: "FAILED_RETRYING",
            owner_id: null,
            lease_until: null,
            last_error: message,
            updated_at: new Date(),
          },
        }),
        prisma.auction_authority_recovery_runs.updateMany({
          where: { recovery_epoch: epoch },
          data: { status: "FAILED_RETRYING", error: message },
        }),
      ])
      .catch(() => undefined);
    runtime = {
      state: "failed",
      ready: !globalRecovery,
      recoveryEpoch: epoch.toString(),
      trigger,
      scope: globalRecovery ? "global" : "auctions",
      affectedAuctionIds: [...targetProductIds],
      lastError: message,
      lastCheckedAt: new Date().toISOString(),
    };
    log.error(
      { err: safeError(error), trigger, epoch: epoch.toString() },
      "Redis authority recovery failed; mutation fence remains closed",
    );
    throw error;
  }
}

async function cycle(): Promise<AuctionAuthorityRecoveryRuntime> {
  if (process.env.AUCTION_AUTO_RECOVERY_ENABLED !== "true") {
    runtime = { state: "disabled", ready: true, lastCheckedAt: new Date().toISOString() };
    return runtime;
  }
  runtime = { ...runtime, state: "checking", ready: false, lastCheckedAt: new Date().toISOString() };
  const control = await prisma.auction_authority_recovery.findUniqueOrThrow({ where: { id: 1 } });
  const productIds = await activeProductIds();
  const inspection = await inspectRedisAuthority(productIds, control.generation, control.recovery_epoch);
  if (inspection.plannedBootstrap) {
    runtime = {
      state: "checking",
      ready: false,
      recoveryEpoch: control.recovery_epoch.toString(),
      trigger: "PLANNED_BOOTSTRAP",
      lastCheckedAt: new Date().toISOString(),
    };
    return runtime;
  }
  if (
    control.state === "READY" &&
    !inspection.fencePresent &&
    inspection.manifestAbsent &&
    inspection.missingProductIds.length === 0
  ) {
    const now = new Date();
    await writeManifest({
      generation: control.generation,
      recoveryEpoch: control.recovery_epoch.toString(),
      schemaVersion: SCHEMA_VERSION,
      recoveredAt: now.toISOString(),
    });
    await prisma.auction_authority_recovery.update({
      where: { id: 1 },
      data: { last_redis_healthy_at: now, updated_at: now },
    });
    runtime = {
      state: "ready",
      ready: true,
      recoveryEpoch: control.recovery_epoch.toString(),
      trigger: "MANIFEST_ADOPTED",
      lastCheckedAt: now.toISOString(),
    };
    return runtime;
  }
  if (
    inspection.manifestMatches &&
    !inspection.fencePresent &&
    inspection.missingProductIds.length === 0 &&
    control.state === "READY"
  ) {
    const now = new Date();
    await prisma.auction_authority_recovery.update({
      where: { id: 1 },
      data: { last_redis_healthy_at: now, updated_at: now },
    });
    runtime = {
      state: "ready",
      ready: true,
      recoveryEpoch: control.recovery_epoch.toString(),
      lastCheckedAt: now.toISOString(),
    };
    return runtime;
  }
  const trigger =
    inspection.missingProductIds.length === productIds.length && productIds.length > 0
      ? "FULL_DATA_LOSS"
      : inspection.missingProductIds.length > 0
        ? "PARTIAL_STATE_LOSS"
        : "MANIFEST_MISMATCH";
  const globalRecovery = trigger === "FULL_DATA_LOSS" || trigger === "MANIFEST_MISMATCH";
  return performRecovery(trigger, globalRecovery ? [] : inspection.missingProductIds, globalRecovery);
}

export function runAuctionAuthorityRecoveryCycle(): Promise<AuctionAuthorityRecoveryRuntime> {
  if (running) return running;
  running = cycle().finally(() => {
    running = undefined;
  });
  return running;
}
