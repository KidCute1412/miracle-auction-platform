export type BidEngine = "postgres" | "redis" | "shadow";

export function getBidEngine(): BidEngine {
  const value = process.env.BID_ENGINE ?? "postgres";
  if (value === "postgres" || value === "redis" || value === "shadow") return value;
  throw new Error(`Unsupported BID_ENGINE: ${value}`);
}
