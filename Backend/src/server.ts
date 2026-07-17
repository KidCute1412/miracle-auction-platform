import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

dotenv.config();

import clientRoutes from "./routes/client/index.route.ts";

import adminRoutes from "./routes/admin/index.route.ts";

import variableConfig from "./config/variable.config.ts";
import cookieParser from "cookie-parser";
import { startAuctionEndEmailJob } from "./jobs/auction-end.job.ts";

import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { closeRedisConnection, redisClient } from "./config/redis.config.ts";
import { checkDatabaseConnection } from "./config/database.config.ts";
import { checkRedisConnection } from "./config/redis.config.ts";
import { checkKafkaConnection, closeKafkaConnection, initKafka } from "./config/kafka.config.ts";

const app = express(); // Create express app
app.set("trust proxy", 1); // Trust first proxy header
const httpServer = createServer(app); // Create HTTP server

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.get("/ready", async (_req, res) => {
  const values = await Promise.all([checkDatabaseConnection(), checkRedisConnection(), checkKafkaConnection()]);
  const dependencies = { database: values[0], redis: values[1], kafka: values[2] };
  const ready = Object.values(dependencies).every(Boolean);
  res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not_ready", dependencies });
});

// Create Socket.io server
export const io = new Server(httpServer, {

  
  pingInterval: 25000, // (Mặc định là 25000ms - 25s). Server sẽ gửi "ping" xuống client mỗi 25s.
  pingTimeout: 20000,  // (Mặc định là 20000ms - 20s). Nếu sau 20s client không phản hồi, server sẽ đóng kết nối.
  connectionStateRecovery: { // (Tính năng mới của Socket.io v4.6+)
    maxDisconnectionDuration: 2 * 60 * 1000, // Cho phép phục hồi trạng thái trong 2 phút nếu mất mạng
    skipMiddlewares: true,
  },
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const port = Number(process.env.PORT) || 5000;

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", //allow send cookie so set specific domain
    credentials: true, //allow send cookie
  })
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Configure Redis store rate limiting middleware
const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(args[0], ...args.slice(1)) as Promise<any>,
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes window
  limit: 2000, // Limit each IP to 2000 requests per window (increased from 100 for local development/testing)
  standardHeaders: true, // Return rate limit info in the headers
  legacyHeaders: false, // Disable legacy rate limit headers
  message: { message: "Too many requests from this IP, please try again later." },
});
app.use(limiter);

var pathAdmin: String = variableConfig.pathAdmin; //set global variable for admin routes
app.use("/", clientRoutes);
app.use(`/${pathAdmin}`, adminRoutes);

// Config socket.io
io.on("connection", (socket) => {
  // Products bidding room
  socket.on("join_bidding_channel", (product_id: number) => {
    socket.join(`bidding_room_${product_id}`);
    console.log(`User ${socket.id} joined room bidding_room_${product_id}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
  });
});

// Start the server
httpServer.listen(port, async () => {
  console.log(`Your website is running at port: http://localhost:${port}`);
  
  // Initialize Kafka connection
  await initKafka();

  // Start auction end email cron job
  startAuctionEndEmailJob();
});

import db from "./config/database.config.ts";

let shuttingDown = false;
const gracefulShutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n[SYSTEM] Received ${signal}. Starting graceful shutdown...`);
  await new Promise<void>((resolve) => io.close(() => resolve()));
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  await Promise.allSettled([db.destroy(), closeRedisConnection(), closeKafkaConnection()]);
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGHUP", () => gracefulShutdown("SIGHUP"));

