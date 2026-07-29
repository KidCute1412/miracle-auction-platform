// hooks/useSocket.ts
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import type { BidSocketEvent } from "api-contracts";

const SOCKET_SERVER_URL = `${import.meta.env.VITE_API_URL}`; // Phải khớp với URL backend

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
): void => {
    const onBidRef = useRef(onBid);
    const onReconnectRef = useRef(onReconnect);
    onBidRef.current = onBid;
    onReconnectRef.current = onReconnect;

    useEffect(() => {
        const newSocket = io(SOCKET_SERVER_URL);
        let latest: Pick<BidSocketEvent, "sequence" | "version"> | undefined;
        let connectedOnce = false;

        const handleBid = (event: BidSocketEvent) => {
            if (String(event.productId) !== String(productId) || !isNewer(event, latest)) return;
            latest = { sequence: event.sequence, version: event.version };
            onBidRef.current?.(event);
        };
        const handleConnect = () => {
            if (productId !== null) newSocket.emit("join_bidding_channel", productId);
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
    }, [productId]);
};
export default useSocketBidding;
export { isNewer };
