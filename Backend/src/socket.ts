import jwt, { type JwtPayload } from "jsonwebtoken";
import { Redis } from "ioredis";
import type { Namespace, Server, Socket } from "socket.io";
import type { BidSocketEvent, DashboardUpdatedEvent } from "api-contracts";
import { accountRepository } from "@/modules/accounts/infrastructure/account.repository.ts";

let socketServer: Server | undefined;
let adminNamespace: Namespace | undefined;
let dashboardSubscriber: Redis | undefined;
let adminConnections = 0;

export function setSocketServer(io: Server): void {
  socketServer = io;
}

export function emitBidUpdate(productId: number, event: BidSocketEvent): void {
  socketServer?.to(`bidding_room_${productId}`).emit("new_bid", event);
}

function cookieValue(header: string | undefined, name: string): string | undefined {
  return header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

async function authenticateAdminSocket(socket: Socket, next: (error?: Error) => void): Promise<void> {
  try {
    const token = cookieValue(socket.handshake.headers.cookie, "accessToken");
    if (!token) return next(new Error("UNAUTHORIZED"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
      algorithms: ["HS256"],
      issuer: "online-auction",
      audience: "online-auction-api",
    }) as JwtPayload;
    const account = await accountRepository.findById(decoded.user_id);
    if (!account || account.status !== "active" || account.role !== "admin" || account.auth_version !== decoded.auth_version) {
      return next(new Error("FORBIDDEN"));
    }
    socket.data.userId = account.user_id;
    next();
  } catch {
    next(new Error("UNAUTHORIZED"));
  }
}

export async function startAdminSocket(io: Server): Promise<void> {
  adminNamespace = io.of("/admin");
  adminNamespace.use((socket, next) => void authenticateAdminSocket(socket, next));
  adminNamespace.on("connection", (socket) => {
    adminConnections += 1;
    socket.join("dashboard_admins");
    socket.on("disconnect", () => {
      adminConnections = Math.max(0, adminConnections - 1);
    });
  });
  dashboardSubscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
  });
  dashboardSubscriber.on("error", (error) => console.warn("[SOCKET] Redis subscriber error", error.message));
  dashboardSubscriber.on("message", (channel, value) => {
    if (channel !== "dashboard:updated:v1") return;
    try {
      const event = JSON.parse(value) as DashboardUpdatedEvent;
      adminNamespace?.to("dashboard_admins").emit("dashboard.updated.v1", event);
    } catch (error) {
      console.warn("[SOCKET] Ignored invalid dashboard Redis notification", error);
    }
  });
  await dashboardSubscriber.subscribe("dashboard:updated:v1").catch((error) =>
    console.warn("[SOCKET] Dashboard Redis subscriber unavailable; clients will poll", error));
}

export async function stopAdminSocket(): Promise<void> {
  if (!dashboardSubscriber) return;
  await dashboardSubscriber.unsubscribe("dashboard:updated:v1").catch(() => undefined);
  await dashboardSubscriber.quit().catch(() => undefined);
  dashboardSubscriber = undefined;
}

export function getAdminSocketCount(): number {
  return adminConnections;
}
