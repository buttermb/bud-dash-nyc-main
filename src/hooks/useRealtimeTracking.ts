import { useState, useEffect, useRef } from "react";

interface TrackingUpdate {
  status: string;
  message?: string;
  lat?: number;
  lng?: number;
  created_at: string;
}

export const useRealtimeTracking = (orderId: string | null) => {
  const [updates, setUpdates] = useState<TrackingUpdate[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "vltveasdxtfvvqbzxzuf";
    const wsUrl = `wss://${projectId}.supabase.co/functions/v1/realtime-tracking`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Real-time tracking connected");
      setConnected(true);
      ws.send(JSON.stringify({ type: "subscribe-order", orderId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "tracking-update") {
        setUpdates((prev) => [...prev, data.data]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [orderId]);

  const sendCourierLocation = (courierId: string, lat: number, lng: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "courier-location",
          courierId,
          lat,
          lng,
        })
      );
    }
  };

  return { updates, connected, sendCourierLocation };
};
