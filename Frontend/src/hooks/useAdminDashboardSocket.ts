import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import type { DashboardUpdatedEvent } from "api-contracts";

export type DashboardSocketState = "connecting" | "connected" | "disconnected";

export function useAdminDashboardSocket(onUpdate: (event: DashboardUpdatedEvent) => void): DashboardSocketState {
  const callback = useRef(onUpdate);
  const [state, setState] = useState<DashboardSocketState>("connecting");
  useEffect(() => { callback.current = onUpdate; }, [onUpdate]);
  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const socket = io(`${base}/admin`, { withCredentials: true, transports: ["websocket", "polling"] });
    socket.on("connect", () => setState("connected"));
    socket.on("disconnect", () => setState("disconnected"));
    socket.on("connect_error", () => setState("disconnected"));
    socket.on("dashboard.updated.v1", (event: DashboardUpdatedEvent) => callback.current(event));
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);
  return state;
}
