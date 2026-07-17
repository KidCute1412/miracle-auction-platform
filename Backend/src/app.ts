import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import clientRoutes from "./routes/client/index.route.ts";
import adminRoutes from "./routes/admin/index.route.ts";
import variableConfig from "./config/variable.config.ts";
import { redisClient, checkRedisConnection } from "./config/redis.config.ts";
import { checkDatabaseConnection } from "./config/database.config.ts";
import { checkKafkaConnection } from "./config/kafka.config.ts";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
  app.get("/ready", async (_req, res) => {
    const [database, redis, kafka] = await Promise.all([checkDatabaseConnection(), checkRedisConnection(), checkKafkaConnection()]);
    const dependencies = { database, redis, kafka };
    const ready = Object.values(dependencies).every(Boolean);
    res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not_ready", dependencies });
  });
  app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());
  app.use(rateLimit({
    store: new RedisStore({ sendCommand: (...args: string[]) => redisClient.call(args[0], ...args.slice(1)) as never }),
    windowMs: 15 * 60 * 1000, limit: 2000, standardHeaders: true, legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again later." },
  }));
  app.use("/", clientRoutes);
  app.use(`/${variableConfig.pathAdmin}`, adminRoutes);
  return app;
}

export const app = createApp();
