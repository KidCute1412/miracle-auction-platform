export type AuctionPhase = "PENDING" | "ACTIVE" | "ENDED";

export type AuctionClock = {
  phase: AuctionPhase;
  targetTimeMs: number;
  remainingMs: number;
};

export function getAuctionClock(startTime: string, endTime: string, nowMs = Date.now()): AuctionClock {
  const startTimeMs = Date.parse(startTime);
  const endTimeMs = Date.parse(endTime);

  if (!Number.isFinite(startTimeMs) || !Number.isFinite(endTimeMs)) {
    return { phase: "ENDED", targetTimeMs: endTimeMs, remainingMs: 0 };
  }
  if (nowMs < startTimeMs) {
    return { phase: "PENDING", targetTimeMs: startTimeMs, remainingMs: startTimeMs - nowMs };
  }
  if (nowMs < endTimeMs) {
    return { phase: "ACTIVE", targetTimeMs: endTimeMs, remainingMs: endTimeMs - nowMs };
  }
  return { phase: "ENDED", targetTimeMs: endTimeMs, remainingMs: 0 };
}

export function formatAuctionDuration(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}
