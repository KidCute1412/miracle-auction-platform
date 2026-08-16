import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import clientRoutes from "./routes/client/index.route.ts";
import adminRoutes from "./routes/admin/index.route.ts";
import variableConfig from "./config/variable.config.ts";
import { redisClient, checkRedisConnection, checkRedisDurability } from "./config/redis.config.ts";
import { checkPrismaConnection } from "./infrastructure/database/prisma.client.ts";
import { checkKafkaConnection } from "./config/kafka.config.ts";
import { csrfProtection } from "./middlewares/csrf.middleware.ts";
import { requestId } from "./middlewares/request-id.middleware.ts";
import { requestLogger } from "./middlewares/request-logger.middleware.ts";
import { getLogger, safeError } from "./infrastructure/observability/logger.ts";
import { getAuthSnapshotMetrics } from "./modules/accounts/infrastructure/auth-snapshot.cache.ts";
import { getRedisMutationMetrics } from "./modules/bids/infrastructure/redis/redis-auction.authority.ts";
import { createRedisRateLimitStore, redisRateLimitPrefixes } from "./infrastructure/security/redis-rate-limit.store.ts";

const log = getLogger({ component: "api" });

async function checkKafkaForReadiness(): Promise<boolean> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      checkKafkaConnection(),
      new Promise<boolean>((resolve) => {
        timer = setTimeout(() => resolve(false), 1_000);
        timer.unref();
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  // PostgreSQL BIGINT values are represented as JavaScript bigint by Prisma.
  // JSON has no bigint type, so preserve exact values as strings in every API response.
  app.set("json replacer", (_key: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value));
  app.use(requestId);
  app.use(requestLogger);
  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
  app.get("/ready", async (_req, res) => {
    const [database, redis, durability, kafka, heartbeat] = await Promise.all([
      checkPrismaConnection(),
      checkRedisConnection(),
      checkRedisDurability(),
      checkKafkaForReadiness(),
      redisClient.get("auction:worker:heartbeat").catch(() => null),
    ]);
    const heartbeatAt = heartbeat ? Date.parse(heartbeat) : Number.NaN;
    const heartbeatTtlMs = Number(process.env.AUCTION_WORKER_HEARTBEAT_TTL_SECONDS ?? 90) * 1_000;
    const auctionWorker = Number.isFinite(heartbeatAt) && Date.now() - heartbeatAt < heartbeatTtlMs;
    const dependencies = { database, redis, redisDurability: durability, auctionWorker, kafka };
    const ready = database && redis && durability.ready && auctionWorker;
    res.status(ready ? 200 : 503).json({
      status: ready ? "ready" : "not_ready",
      dependencies,
      metrics: { authSnapshot: getAuthSnapshotMetrics(), redisMutation: getRedisMutationMetrics() },
    });
  });
  app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());
  app.use(csrfProtection);
  app.use(
    rateLimit({
      store: createRedisRateLimitStore(redisRateLimitPrefixes.api),
      passOnStoreError: true,
      windowMs: 15 * 60 * 1000,
      // A benchmark stack is isolated and may legitimately generate more traffic
      // than the public-IP protection intended for normal deployments.
      limit: Number(process.env.API_RATE_LIMIT ?? 2000),
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: "Too many requests from this IP, please try again later." },
    }),
  );
  app.use("/", clientRoutes);
  app.use(`/${variableConfig.pathAdmin}`, adminRoutes);
  app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    log.error({ err: safeError(error) }, "Unhandled operational error");
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected server error occurred",
        requestId: req.requestId,
      },
    });
  });
  return app;
}

export const app = createApp();
