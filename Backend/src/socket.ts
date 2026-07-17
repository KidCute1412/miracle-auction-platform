import type { Server } from "socket.io";
import type { BidSocketEvent } from "api-contracts";

let socketServer: Server | undefined;
export function setSocketServer(io: Server): void { socketServer = io; }
export function emitBidUpdate(productId: number, event: BidSocketEvent): void { socketServer?.to(`bidding_room_${productId}`).emit("new_bid", event); }
