// hooks/useSocket.ts
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import type { BidSocketEvent } from "api-contracts";

const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SOCKET_SERVER_URL = rawUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");

const isNewer = (
  incoming: BidSocketEvent,
  previous: Pick<BidSocketEvent, "sequence" | "version"> | undefined,
): boolean => !previous
  || BigInt(incoming.sequence) > BigInt(previous.sequence)
  || (BigInt(incoming.sequence) === BigInt(previous.sequence)
    && BigInt(incoming.version) > BigInt(previous.version));

const useSocketBidding = (
  productId: number | null,
  onBid?: (event: BidSocketEvent) => void,
  onReconnect?: () => void,
  initialSequence?: string,
  initialVersion?: string,
): void => {
    const onBidRef = useRef(onBid);
    const onReconnectRef = useRef(onReconnect);
    onBidRef.current = onBid;
    onReconnectRef.current = onReconnect;

    useEffect(() => {
        if (!productId) return;
        const newSocket = io(SOCKET_SERVER_URL, {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });
        let latest: Pick<BidSocketEvent, "sequence" | "version"> | undefined =
            initialSequence && initialVersion
                ? { sequence: initialSequence, version: initialVersion }
                : undefined;
        let connectedOnce = false;

        const handleBid = (event: BidSocketEvent) => {
            if (String(event.productId) !== String(productId) || !isNewer(event, latest)) return;
            latest = { sequence: event.sequence, version: event.version };
            onBidRef.current?.(event);
        };
        const handleConnect = () => {
            newSocket.emit("join_bidding_channel", productId);
            if (connectedOnce) onReconnectRef.current?.();
            connectedOnce = true;
        };
        newSocket.on("new_bid", handleBid);
        newSocket.on("connect", handleConnect);

        return () => {
            newSocket.off("new_bid", handleBid);
            newSocket.off("connect", handleConnect);
            newSocket.disconnect();
        };
    }, [productId, initialSequence, initialVersion]);
};
export default useSocketBidding;
export { isNewer };
