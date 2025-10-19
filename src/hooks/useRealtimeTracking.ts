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

    let ws: WebSocket | null = null;
    let isClosing = false;

    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Real-time tracking connected");
        setConnected(true);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "subscribe-order", orderId }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "tracking-update") {
            setUpdates((prev) => [...prev, data.data]);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnected(false);
      };

      ws.onclose = () => {
        if (!isClosing) {
          console.log("WebSocket closed");
          setConnected(false);
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      setConnected(false);
    }

    return () => {
      isClosing = true;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Component unmounting");
      }
      wsRef.current = null;
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
