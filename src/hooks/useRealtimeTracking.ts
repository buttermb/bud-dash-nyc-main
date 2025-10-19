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
    // Don't connect WebSocket if no orderId
    if (!orderId) {
      setConnected(false);
      return;
    }

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "vltveasdxtfvvqbzxzuf";
    const wsUrl = `wss://${projectId}.supabase.co/functions/v1/realtime-tracking`;

    let ws: WebSocket | null = null;
    
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Real-time tracking connected");
        setConnected(true);
        if (ws) {
          ws.send(JSON.stringify({ type: "subscribe-order", orderId }));
        }
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
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      setConnected(false);
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
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
