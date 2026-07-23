const prefix = (productId: number | string): string => `auction:v1:${productId}`;

export const redisAuctionKeys = {
  state: (productId: number | string) => `${prefix(productId)}:state`,
  maxima: (productId: number | string) => `${prefix(productId)}:maxima`,
  ranking: (productId: number | string) => `${prefix(productId)}:ranking`,
  rankMembers: (productId: number | string) => `${prefix(productId)}:rank-members`,
  bans: (productId: number | string) => `${prefix(productId)}:bans`,
  idempotency: (productId: number | string) => `${prefix(productId)}:idempotency`,
  rate: (productId: number | string, actorId: number | string) => `${prefix(productId)}:rate:${actorId}`,
  deadlines: "auction:v1:deadlines",
  results: "auction:v1:results",
  dlq: "auction:v1:results:dlq",
  projectorRetries: "auction:v1:projector:retries",
} as const;

export function mutationKeys(productId: number, actorId: number): string[] {
  return [
    redisAuctionKeys.state(productId),
    redisAuctionKeys.maxima(productId),
    redisAuctionKeys.ranking(productId),
    redisAuctionKeys.rankMembers(productId),
    redisAuctionKeys.bans(productId),
    redisAuctionKeys.idempotency(productId),
    redisAuctionKeys.rate(productId, actorId),
    redisAuctionKeys.deadlines,
    redisAuctionKeys.results,
  ];
}
