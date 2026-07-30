import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.ts";
import { setSocketServer, startAdminSocket, stopAdminSocket } from "./socket.ts";
import { closeRedisConnection } from "./config/redis.config.ts";
import { prisma } from "./infrastructure/database/prisma.client.ts";
import { getLogger } from "./infrastructure/observability/logger.ts";

const log = getLogger({ component: "api-server" });

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  pingInterval: 25000,
  pingTimeout: 20000,
  connectionStateRecovery: { maxDisconnectionDuration: 120000, skipMiddlewares: false },
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173", methods: ["GET", "POST"], credentials: true },
});
setSocketServer(io);
void startAdminSocket(io);
io.on("connection", (socket) => {
  socket.on("join_bidding_channel", (productId: number) => socket.join(`bidding_room_${productId}`));
});

const port = Number(process.env.PORT) || 5000;
httpServer.listen(port, () => {
  log.info({ port }, "API server started");
});

let shuttingDown = false;
async function gracefulShutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  log.info({ signal }, "Graceful shutdown started");
  await new Promise<void>((resolve) => io.close(() => resolve()));
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  await Promise.allSettled([stopAdminSocket(), prisma.$disconnect(), closeRedisConnection()]);
  log.info({ signal }, "Graceful shutdown completed");
  process.exit(0);
}
process.on("SIGINT", () => void gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
