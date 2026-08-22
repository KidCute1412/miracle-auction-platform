const prefix = (productId: number | string): string => `auction:v1:${productId}`;

const requestPrefix = (productId: number | string): string => `${prefix(productId)}:idempotency-request`;

export const redisAuctionKeys = {
  state: (productId: number | string) => `${prefix(productId)}:state`,
  maxima: (productId: number | string) => `${prefix(productId)}:maxima`,
  ranking: (productId: number | string) => `${prefix(productId)}:ranking`,
  rankMembers: (productId: number | string) => `${prefix(productId)}:rank-members`,
  bans: (productId: number | string) => `${prefix(productId)}:bans`,
  idempotency: (productId: number | string) => `${prefix(productId)}:idempotency`,
  idempotencyRequest: (productId: number | string, digest: string) => `${requestPrefix(productId)}:${digest}`,
  durabilityProbe: (eventId: string) => `auction:v1:durability-probe:${eventId}`,
  rate: (productId: number | string, actorId: number | string) => `${prefix(productId)}:rate:${actorId}`,
  deadlines: "auction:v1:deadlines",
  results: "auction:v1:results",
  dlq: "auction:v1:results:dlq",
  projectorRetries: "auction:v1:projector:retries",
  authorityManifest: "auction:v1:authority-manifest",
  recoveryFence: "auction:v1:recovery:fence",
  auctionRecoveryFence: (productId: number | string) => `${prefix(productId)}:recovery-fence`,
  plannedBootstrap: "auction:v1:bootstrap-batch",
} as const;

export function mutationKeys(productId: number, actorId: number, idempotencyDigest: string): string[] {
  return [
    redisAuctionKeys.state(productId),
    redisAuctionKeys.maxima(productId),
    redisAuctionKeys.ranking(productId),
    redisAuctionKeys.rankMembers(productId),
    redisAuctionKeys.bans(productId),
    redisAuctionKeys.idempotencyRequest(productId, idempotencyDigest),
    redisAuctionKeys.rate(productId, actorId),
    redisAuctionKeys.deadlines,
    redisAuctionKeys.results,
    redisAuctionKeys.idempotency(productId),
    redisAuctionKeys.auctionRecoveryFence(productId),
    redisAuctionKeys.recoveryFence,
  ];
}
