// hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { BidSocketEvent } from "api-contracts";

const SOCKET_SERVER_URL = `${import.meta.env.VITE_API_URL}`; // Phải khớp với URL backend

const useSocketBidding = (productId: number | null, onBid?: (event: BidSocketEvent) => void) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
 
        const newSocket = io(SOCKET_SERVER_URL);
        setSocket(newSocket);


        const handleBid = (event: BidSocketEvent) => onBid?.(event);
        newSocket.on("new_bid", handleBid);
        if (productId !== null) {
            newSocket.emit('join_bidding_channel', productId);
        }

        return () => {
            newSocket.off("new_bid", handleBid);
            newSocket.disconnect();
        };
    }, [productId]); 

    return socket;
};
export default useSocketBidding;
