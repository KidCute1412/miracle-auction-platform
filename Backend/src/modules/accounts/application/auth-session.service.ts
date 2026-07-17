import crypto from "crypto";
import { redisClient } from "@/config/redis.config.ts";

export type RefreshSession = { userId: number; sessionId: string; tokenId: string; authVersion: number; rememberMe: boolean };

const sessionKey = (sessionId: string) => `auth:session:${sessionId}`;
const refreshKey = (tokenId: string) => `auth:refresh:${tokenId}`;
const ttlFor = (rememberMe: boolean) => rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60;

export const createRefreshSession = (userId: number, authVersion: number, rememberMe: boolean, sessionId?: string): RefreshSession => ({
  userId, authVersion, rememberMe, sessionId: sessionId ?? crypto.randomUUID(), tokenId: crypto.randomUUID(),
});

export async function persistRefreshSession(session: RefreshSession): Promise<void> {
  const ttl = ttlFor(session.rememberMe);
  await redisClient.multi()
    .set(sessionKey(session.sessionId), "active", "EX", ttl)
    .set(refreshKey(session.tokenId), JSON.stringify(session), "EX", ttl)
    .exec();
}

export type ConsumeResult = "active" | "reused" | "revoked";

// Consume a refresh token exactly once. A missing active token revokes its family,
// so a stolen token replay also invalidates the successor issued to the real user.
export async function consumeRefreshSession(sessionId: string, tokenId: string): Promise<ConsumeResult> {
  const result = await redisClient.eval(
    "local state=redis.call('GET',KEYS[1]); if state~='active' then return 'revoked' end; local token=redis.call('GETDEL',KEYS[2]); if token then return 'active' end; redis.call('SET',KEYS[1],'revoked','KEEPTTL'); return 'reused'",
    2,
    sessionKey(sessionId),
    refreshKey(tokenId),
  );
  return result as ConsumeResult;
}

export async function revokeRefreshSession(sessionId: string, tokenId?: string): Promise<void> {
  await redisClient.eval(
    "if redis.call('EXISTS',KEYS[1])==1 then redis.call('SET',KEYS[1],'revoked','KEEPTTL') end; if KEYS[2]~='' then redis.call('DEL',KEYS[2]) end",
    2,
    sessionKey(sessionId),
    tokenId ? refreshKey(tokenId) : "",
  );
}
