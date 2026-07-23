import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.ts";
import { setSocketServer } from "./socket.ts";
import { startAuctionEndEmailJob } from "./jobs/auction-end.job.ts";
import { initKafka, closeKafkaConnection } from "./config/kafka.config.ts";
import { closeRedisConnection } from "./config/redis.config.ts";
import { prisma } from "./infrastructure/database/prisma.client.ts";
import { dispatchBidOutbox } from "./modules/bids/infrastructure/bid-outbox.dispatcher.ts";
import { getBidEngine } from "./modules/bids/application/bid-engine.ts";
import { bootstrapActiveRedisAuctions } from "./modules/bids/infrastructure/redis/redis-auction.bootstrap.ts";
import { startBidProjector, stopBidProjector } from "./workers/bid-projector.worker.ts";
import { startRedisAuctionCloseJob, stopRedisAuctionCloseJob } from "./jobs/redis-auction-close.job.ts";

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  pingInterval: 25000,
  pingTimeout: 20000,
  connectionStateRecovery: { maxDisconnectionDuration: 120000, skipMiddlewares: true },
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173", methods: ["GET", "POST"], credentials: true },
});
setSocketServer(io);
io.on("connection", (socket) => {
  socket.on("join_bidding_channel", (productId: number) => socket.join(`bidding_room_${productId}`));
});

const port = Number(process.env.PORT) || 5000;
httpServer.listen(port, async () => {
  console.log(`Your website is running at port: http://localhost:${port}`);
  if (getBidEngine() === "redis") {
    const initialized = await bootstrapActiveRedisAuctions();
    console.log(`[BIDDING] Redis authority ready; initialized ${initialized} auctions`);
    startBidProjector();
    startRedisAuctionCloseJob();
  }
  void initKafka();
  startAuctionEndEmailJob();
  setInterval(() => void dispatchBidOutbox().catch(console.error), 1000).unref();
});

let shuttingDown = false;
async function gracefulShutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[SYSTEM] Received ${signal}. Starting graceful shutdown...`);
  await new Promise<void>((resolve) => io.close(() => resolve()));
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  stopRedisAuctionCloseJob();
  await stopBidProjector();
  await Promise.allSettled([prisma.$disconnect(), closeRedisConnection(), closeKafkaConnection()]);
  process.exit(0);
}
process.on("SIGINT", () => void gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
